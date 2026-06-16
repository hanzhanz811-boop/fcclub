# 메인/뉴스 정렬 개선 및 Quill 웹 에디터 도입 디자인 스펙

## 1. 개요
* **목적**:
  * 메인 페이지의 뉴스 위젯 및 뉴스 탭의 목록 카드를 최신 등록순으로 정렬하여 사용자에게 최신 정보를 먼저 제공합니다.
  * 뉴스 관리자 폼 및 자유게시판 게시글 작성 폼에 Quill Rich Text 에디터를 연동하여 사용자들이 다채롭고 미려한 서식을 본문에 적용할 수 있도록 개선합니다.
  * 리치 텍스트 저장에 따른 DOM XSS 공격 위협을 사전에 완벽히 차단하기 위한 클라이언트용 HTML 새니타이저 필터를 도입합니다.

---

## 2. 세부 요건 및 설계

### 2.1 메인 및 뉴스 섹션 정렬 최신순 변경
* **정렬 기준**: 
  * 고유 식별자(`id`) 값을 기준으로 역순 정렬을 수행합니다. ID가 클수록 더 최근에 등록된 게시글입니다.
* **메인 화면 뉴스 위젯 (`bindNewsWidget`)**:
  * `newsList` 배열을 렌더링 시점에 복사하여 ID 역순으로 정렬합니다.
  * `const sorted = [...newsList].sort((a, b) => b.id - a.id);`
  * 정렬된 배열을 기반으로 화면에 출력하여, 항상 가장 최신 뉴스가 최상단에 노출되도록 구성합니다.
* **뉴스 페이지 (`renderNewsPage`)**:
  * 뉴스 카드 목록 렌더링 시 동일하게 `const sorted = [...newsList].sort((a, b) => b.id - a.id);`를 사용하여 최신순으로 정렬합니다.
  * 최초 진입 또는 활성 뉴스 매핑 시, 뉴스 목록에 데이터가 존재하지만 `activeNewsId`가 유효하지 않은 경우 `sorted[0].id`를 기본 활성화 값으로 지정하여 항상 가장 최신 뉴스가 상세 화면에 먼저 뜨도록 설계합니다.

### 2.2 뉴스 및 자유게시판 Quill 에디터 도입
* **Quill CDN 리소스 추가** (`index.html` 내 헤더 영역에 삽입):
  * CSS 테마: `https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css`
  * JavaScript 라이브러리: `https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js`
* **에디터 컨테이너 설계**:
  * 글쓰기/수정 모달이 열릴 때 기존의 `<textarea>` 요소를 숨기거나 제거하고, Quill 에디터가 마운트될 `<div id="editor-container"></div>` 요소를 동적으로 주입합니다.
  * 에디터 컨테이너는 기존 입력창과 통일된 스타일(높이 최소 200px~최대 400px, 어두운 테마에 어울리는 보더 라인 등)을 부여합니다.
* **에디터 툴바 차등 설정 (역할별)**:
  * **뉴스 등록/수정 (관리자)**:
    ```javascript
    const adminToolbarOptions = [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ];
    ```
  * **자유게시판 작성 (일반 사용자)**:
    ```javascript
    const userToolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote'],
      ['link'],
      ['clean']
    ];
    ```
* **데이터 흐름**:
  * 폼 로드 시 기존 글 내용(`content`)을 에디터에 주입: `quill.root.innerHTML = content || '';`
  * 폼 전송(`submit`) 시 에디터 내용을 읽어 로컬 스토리지에 저장: `const contentValue = quill.root.innerHTML;`
  * 에디터 비워두기 검증: 이미지나 비디오만 업로드된 경우를 제외하고 텍스트 내용이 없는지 검사하기 위해 `quill.getText().trim().length === 0`일 때 경고를 띄웁니다.

### 2.3 XSS 방지를 위한 HTML 새니타이저 (Sanitizer) 도입
* **배경**: HTML 서식 코드가 로컬스토리지에 저장되고 페이지에 직접 마운트되므로(즉, `.textContent` 대신 `.innerHTML`을 사용하므로), XSS(크로스 사이트 스크립팅) 취약점을 완벽하게 예방해야 합니다.
* **구현**: `sanitizeHTML(html)` 함수를 `js/app.js` 및 `js/community.js`에 내장하여 렌더링 직전에 정제합니다.
* **여과 규칙**:
  1. `<script>` 및 `<iframe>` 등 실행형 태그 삭제 (Quill 기본 비디오 임베드용 유튜브 iframe 등 안전성이 검증된 도메인만 제한적 허용 처리 또는 iframe 전면 차단하고 비디오는 video 태그로 한정).
     * Quill 비디오 임베드는 기본적으로 `youtube.com` 등을 대상으로 iframe을 생성하므로, youtube 임베드 도메인만을 허용하는 정규식 필터를 적용합니다.
  2. 태그 내 인라인 이벤트 핸들러(예: `onload`, `onerror`, `onclick`, `onmouseover` 등 `on`으로 시작하는 모든 속성) 속성 전면 삭제.
  3. `javascript:` 프로토콜로 시작하는 URL 링크(`href`, `src` 속성) 제거.
* **새니타이저 헬퍼 구조**:
  ```javascript
  function sanitizeHTML(html) {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    // 1. 악성 태그 삭제
    const badTags = body.querySelectorAll('script, object, embed, link, meta, style');
    badTags.forEach(t => t.remove());

    // 2. iframe의 경우 유튜브 임베드 경로만 허용, 그 외 삭제
    const iframes = body.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src') || '';
      if (!src.startsWith('https://www.youtube.com/embed/') && !src.startsWith('https://www.youtube-nocookie.com/embed/')) {
        iframe.remove();
      }
    });

    // 3. 속성 검사 (on- 이벤트 및 javascript: 프로토콜 차단)
    const allElements = body.querySelectorAll('*');
    allElements.forEach(el => {
      // 인라인 이벤트 리스너 제거
      for (let i = el.attributes.length - 1; i >= 0; i--) {
        const attr = el.attributes[i];
        if (attr.name.toLowerCase().startsWith('on')) {
          el.removeAttribute(attr.name);
        }
        if (attr.name.toLowerCase() === 'href' || attr.name.toLowerCase() === 'src') {
          const val = attr.value.trim().toLowerCase();
          if (val.startsWith('javascript:')) {
            el.removeAttribute(attr.name);
          }
        }
      }
    });

    return body.innerHTML;
  }
  ```

---

## 3. 예외 처리 및 성능 고려
* **에디터 미지원 브라우저**: Quill 에디터 스크립트 로드 실패 시(`window.Quill`이 정의되지 않은 경우) 기존의 일반 `<textarea>` 폼으로 자동 전환(fallback)되도록 예외 처리를 구성하여 무중단 서비스를 보장합니다.
* **데이터 용량 관리**: Quill 이미지 삽입 시 기본적으로 Base64 직렬화 이미지가 들어가므로 용량이 큽니다. localstorage 용량 한계(5MB)를 초과하지 않도록 이미지 추가 기능은 관리자 뉴스 에디터에만 허용하고, 일반 사용자 자유게시판은 이미지 삽입을 제한(툴바에서 비활성화)하여 로컬 저장 용량 안정성을 도모합니다.

---

## 4. 검증 계획 (테스트 케이스)
* **정렬 검증**:
  * 뉴스 데이터 로드 후 렌더링 리스트의 첫 번째 아이템의 ID가 전체 데이터 중 가장 큰 ID(최신 뉴스)인지 검사.
* **새니타이저 XSS 방어 검증**:
  * `<script>alert(1)</script>`가 포함된 텍스트 통과 후 script 태그 삭제 확인.
  * `<img src="x" onerror="alert(1)">` 통과 후 onerror 속성 삭제 확인.
  * `<a href="javascript:alert(1)">` 통과 후 href 속성 삭제 확인.
  * 허용된 유튜브 iframe 주소는 정상 보존되는지 확인.
* **Quill Fallback 검증**:
  * `window.Quill`을 강제로 delete한 환경에서 폼 로드 시 에러 없이 기본 textarea로 원활히 마운트되는지 확인.
