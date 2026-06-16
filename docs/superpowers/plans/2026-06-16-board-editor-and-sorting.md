# 메인/뉴스 정렬 개선 및 Quill 웹 에디터 도입 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 메인 뉴스 위젯과 뉴스 탭의 목록을 최신순(ID 역순) 정렬 렌더링으로 전환하고, 관리자 뉴스 폼(풀 옵션) 및 자유게시판 글쓰기 폼(라이트 옵션)에 Quill 웹 에디터를 연동하며, Rich Text 렌더링에 따른 XSS 공격을 차단할 HTML 새니타이저를 탑재합니다.

**Architecture:** 
- `js/community.js` 내에 XSS 공격 스크립트(script 태그, 인라인 이벤트, javascript: 프로토콜)를 여과하는 `sanitizeHTML` 공통 함수를 구현 및 노출하고, `js/app.js`에서 이를 참조합니다.
- `index.html` 헤더에 Quill CDN CSS/JS를 주입하고, 각 작성/수정 모달이 열릴 때 기존 `textarea` 요소를 Quill 컨테이너 `div`로 동적 교체하여 Quill 인스턴스를 마운트 및 연동합니다.
- 메인 뉴스 위젯 및 뉴스 목록 렌더링 시 `[...newsList].sort((a, b) => b.id - a.id)` 연산 결과로 렌더링을 처리하여 최신 정보 우선 노출을 유지합니다.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Quill Editor (CDN), Node.js Test Runner

---

### Task 1: HTML 새니타이저 (Sanitizer) 구현 및 단위 테스트

**Files:**
- Modify: `js/community.js:15-30` (sanitizeHTML 함수 추가 및 exports 리스트 노출)
- Test: `tests/run_tests.js:250-280` (runSanitizeHTMLTests 추가 및 호출)

- [ ] **Step 1: runSanitizeHTMLTests 실패 테스트 작성**
  `tests/run_tests.js` 파일에 `runSanitizeHTMLTests()` 함수를 추가하여 새니타이저의 XSS 필터링 조건들이 제대로 구현되는지 확인하는 테스트를 작성합니다.
  ```javascript
  function runSanitizeHTMLTests() {
    // 1. script 태그 차단 검증
    const payload1 = '<p>안녕</p><script>alert("xss")</script><div>하세요</div>';
    const clean1 = sanitizeHTML(payload1);
    assert.strictEqual(clean1.includes('<script>'), false, 'Should remove script tags');
    assert.strictEqual(clean1.includes('안녕'), true);
    assert.strictEqual(clean1.includes('하세요'), true);

    // 2. 인라인 이벤트 핸들러 제거 검증
    const payload2 = '<img src="x" onerror="alert(1)" onclick="console.log(2)" alt="test">';
    const clean2 = sanitizeHTML(payload2);
    assert.strictEqual(clean2.includes('onerror'), false, 'Should remove onerror attribute');
    assert.strictEqual(clean2.includes('onclick'), false, 'Should remove onclick attribute');
    assert.strictEqual(clean2.includes('alt="test"'), true);

    // 3. javascript: 프로토콜 제거 검증
    const payload3 = '<a href="javascript:alert(1)">클릭</a><iframe src="javascript:alert(2)"></iframe>';
    const clean3 = sanitizeHTML(payload3);
    assert.strictEqual(clean3.includes('javascript:'), false, 'Should remove javascript: protocol');

    // 4. 허용된 유튜브 iframe 보존 검증
    const payload4 = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560"></iframe>';
    const clean4 = sanitizeHTML(payload4);
    assert.strictEqual(clean4.includes('https://www.youtube.com/embed/dQw4w9WgXcQ'), true, 'Should allow youtube embed src');
  }
  ```
  그리고 파일 하단에 `runTestBlock('Sanitize HTML Safety Tests (runSanitizeHTMLTests)', runSanitizeHTMLTests);`을 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL (ReferenceError: sanitizeHTML is not defined)

- [ ] **Step 3: sanitizeHTML 함수 구현 및 노출**
  `js/community.js` 파일 내에 `sanitizeHTML`을 구현하고, 파일 최하단의 `module.exports`에 추가하여 외부에서도 임포트할 수 있도록 노출합니다.
  ```javascript
  function sanitizeHTML(html) {
    if (!html) return '';
    
    // Node.js 테스트 환경과 브라우저 환경 호환성 검증을 위한 DOMParser 예외 처리
    let doc;
    if (typeof window === 'undefined' || !window.DOMParser) {
      // Node 환경일 경우 DOMParser 모킹이 필요하나, run_tests.js 내부에서 글로벌로 mockParser 제공 가능
      // 브라우저 혹은 JSDOM 환경이 아닐 경우 간이 처리
      if (typeof global.DOMParser !== 'undefined') {
        const parser = new global.DOMParser();
        doc = parser.parseFromString(html, 'text/html');
      } else {
        // 기본 RegExp 기반의 간이 대체 처리 (주로 브라우저 상에서 돌기 때문에 Fallback)
        return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    } else {
      const parser = new window.DOMParser();
      doc = parser.parseFromString(html, 'text/html');
    }
    
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
  그리고 `js/community.js` 최하단 `module.exports`에 노출:
  ```javascript
  const globalScope = typeof window !== 'undefined' ? window : global;
  globalScope.sanitizeHTML = sanitizeHTML;
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      CommunityManager,
      escapeHTML,
      sanitizeHTML
    };
  }
  ```
  `tests/run_tests.js` 상단 임포트 리스트 변경:
  ```javascript
  const { CommunityManager, escapeHTML, sanitizeHTML } = require('../js/community.js');
  // global에도 할당
  global.sanitizeHTML = sanitizeHTML;
  ```
  Node 테스트용 글로벌 `DOMParser` 모킹 주입 (`tests/run_tests.js`의 `global.localStorage` 초기화 구문 부근):
  ```javascript
  const { JSDOM } = require('jsdom');
  const jsdomInstance = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.DOMParser = jsdomInstance.window.DOMParser;
  ```

- [ ] **Step 4: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 5: Git 커밋**
  Run: `git commit -am "feat: implement HTML Sanitizer helper and add unit tests"`

---

### Task 2: 메인 화면 및 뉴스 섹션 최신순 정렬 적용

**Files:**
- Modify: `js/app.js:425-454` (`bindNewsWidget` 수정), `js/app.js:456-520` (`renderNewsPage` 수정)
- Test: `tests/run_tests.js` (`runNewsSortingTests` 추가 및 실행)

- [ ] **Step 1: 정렬 실패 테스트 작성**
  `tests/run_tests.js`에 `runNewsSortingTests()` 함수를 설계하여 정렬 전후의 위젯 및 페이지 목록 순서를 검증하는 테스트를 작성합니다.
  ```javascript
  function runNewsSortingTests() {
    const originalDocument = global.document;
    
    // Mock news data
    global.newsList = [
      { id: 1, date: '2026-06-01', title: '옛날 뉴스', content: '옛날 뉴스 본문' },
      { id: 2, date: '2026-06-02', title: '최신 뉴스', content: '최신 뉴스 본문' }
    ];
    
    const renderedTitles = [];
    const mockContainer = {
      innerHTML: '',
      appendChild: (child) => {
        const titleEl = child.querySelector('.news-title') || child.querySelector('.news-item-title');
        if (titleEl) renderedTitles.push(titleEl.textContent);
      },
      querySelectorAll: () => []
    };
    
    global.document = {
      getElementById: (id) => {
        if (id === 'newsListContainer' || id === 'newsTabList') return mockContainer;
        return { innerHTML: '', appendChild: () => {}, querySelectorAll: () => [] };
      },
      createElement: (tag) => {
        return {
          tagName: tag.toUpperCase(),
          innerHTML: '',
          querySelector: (sel) => {
            if (sel === '.news-title' || sel === '.news-item-title') {
              return {
                set textContent(val) { this._val = val; },
                get textContent() { return this._val; }
              };
            }
            return null;
          },
          setAttribute: () => {},
          addEventListener: () => {}
        };
      }
    };
    
    try {
      global.bindNewsWidget();
      // 최신 뉴스(ID: 2)가 먼저 렌더링되었는지 확인
      assert.strictEqual(renderedTitles[0], '최신 뉴스', 'Main widget should render newest news first');
      
      renderedTitles.length = 0;
      global.renderNewsPage();
      assert.strictEqual(renderedTitles[0], '최신 뉴스', 'News tab list should render newest news first');
      assert.strictEqual(global.activeNewsId, 2, 'Default active news should be the newest news');
    } finally {
      global.document = originalDocument;
      delete global.newsList;
      delete global.activeNewsId;
    }
  }
  ```
  그리고 `runTestBlock('News Sorting Tests (runNewsSortingTests)', runNewsSortingTests);` 호출을 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 3: 정렬 로직 적용**
  `js/app.js`에서 `bindNewsWidget()` 및 `renderNewsPage()` 내 `newsList` 순회 시 정렬된 복제본을 기반으로 순회하도록 수정합니다.
  * `bindNewsWidget()` 수정:
    ```javascript
    const sortedNews = [...newsList].sort((a, b) => b.id - a.id);
    sortedNews.forEach(news => {
      // 렌더링 로직...
    });
    ```
  * `renderNewsPage()` 수정:
    ```javascript
    const sortedNews = [...newsList].sort((a, b) => b.id - a.id);
    if (newsList.length > 0) {
      const exists = newsList.some(news => news.id === activeNewsId);
      if (!exists) {
        activeNewsId = sortedNews[0].id; // 가장 최신 ID 지정
      }
    }
    // 카드 렌더링 영역
    sortedNews.forEach(news => {
      // 렌더링 로직...
    });
    ```

- [ ] **Step 4: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 5: Git 커밋**
  Run: `git commit -am "feat: sort news list by ID descending in home widget and news tab"`

---

### Task 3: 관리자 페이지 뉴스 폼 Quill 에디터 연동

**Files:**
- Modify: `index.html` (CDN 주입)
- Modify: `js/app.js:870-960` (`renderAdminNews` 및 뉴스 폼 제출 로직 수정)
- Test: `tests/run_tests.js` (`runAdminNewsQuillTests` 추가 및 실행)

- [ ] **Step 1: Quill CDN 링크 주입**
  `index.html` 파일의 `<head>` 영역에 Quill 에디터 스타일 및 스크립트를 추가합니다.
  ```html
  <link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>
  ```

- [ ] **Step 2: Quill 마운트 실패에 따른 Fallback 통합 테스트 작성**
  `tests/run_tests.js`에 `runAdminNewsQuillTests()` 함수를 만들고, `window.Quill`이 부재하는 환경에서 기존 `<textarea>`로 안전하게 폴백 동작이 일어나는지 검증하는 테스트를 작성합니다.
  ```javascript
  function runAdminNewsQuillTests() {
    const originalDocument = global.document;
    const originalWindow = global.window;
    
    let isQuillInitialized = false;
    let appendedHTML = '';
    
    const mockContainer = {
      set innerHTML(val) { appendedHTML = val; },
      get innerHTML() { return appendedHTML; }
    };
    
    global.document = {
      getElementById: (id) => {
        if (id === 'adminWorkContent') return mockContainer;
        return { value: '', addEventListener: () => {}, style: {} };
      },
      createElement: () => ({ setAttribute: () => {}, style: {} }),
      querySelectorAll: () => []
    };
    
    // Case A: Quill이 부재할 때 textarea 정상 폴백 렌더링 확인
    global.window = { Quill: undefined };
    global.renderAdminNews();
    assert.ok(appendedHTML.includes('<textarea'), 'Fallback to textarea when Quill is absent');
    
    // Case B: Quill이 존재할 때 editor-container 생성 확인
    global.window = {
      Quill: class {
        constructor(selector, options) {
          isQuillInitialized = true;
          this.root = { innerHTML: '초기 본문' };
        }
        getText() { return '초기 본문'; }
      }
    };
    global.renderAdminNews();
    assert.ok(appendedHTML.includes('id="newsEditorContainer"'), 'Render editor container div when Quill is present');
    
    global.document = originalDocument;
    global.window = originalWindow;
  }
  ```
  그리고 `runTestBlock('Admin News Quill Tests (runAdminNewsQuillTests)', runAdminNewsQuillTests);`을 파일 끝부분에 추가합니다.

- [ ] **Step 3: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 4: renderAdminNews 에 Quill 에디터 통합 및 sanitizeHTML 필터 이식**
  `js/app.js`에서 뉴스 등록/수정 시 Quill 에디터를 렌더링하고 HTML 저장을 지원하도록 변경합니다.
  * `renderAdminNews()` 템플릿 변경:
    기존 `<textarea id="newsContent" ...>` 요소를 다음과 같이 감싸서 출력합니다.
    ```javascript
    const hasQuill = typeof window !== 'undefined' && typeof window.Quill !== 'undefined';
    // 템플릿 내용 중 textarea를 Quill 렌더링용 div와 fallback textarea로 병기
    `
    <div class="admin-form-group">
      <label for="newsContent">본문 내용</label>
      ${hasQuill ? `
        <div id="newsEditorContainer" style="height: 300px; background: rgba(0,0,0,0.2); border: 1px solid var(--color-glass-border); border-radius: 6px; color: #fff;"></div>
        <input type="hidden" id="newsContent" value="${escapeHTML(news ? news.content : '')}">
      ` : `
        <textarea id="newsContent" rows="10" required>${escapeHTML(news ? news.content : '')}</textarea>
      `}
    </div>
    `
    ```
  * 에디터 초기화 코드 및 submit 콜백 추가:
    ```javascript
    let quillInstance = null;
    if (hasQuill) {
      const container = document.getElementById('newsEditorContainer');
      if (container) {
        quillInstance = new window.Quill('#newsEditorContainer', {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'align': [] }],
              ['link', 'image', 'video'],
              ['clean']
            ]
          }
        });
        // 수정 모드일 때 기존 HTML 본문 주입
        const hiddenInput = document.getElementById('newsContent');
        if (hiddenInput && hiddenInput.value) {
          // Quill은 HTML 입력을 지원하므로 root.innerHTML에 직접 할당
          quillInstance.root.innerHTML = hiddenInput.value;
        }
      }
    }
    ```
  * submit 핸들러에서 본문 데이터를 에디터로부터 가져오도록 수정 및 저장 시 `sanitizeHTML` 적용:
    ```javascript
    let content = '';
    if (quillInstance) {
      if (quillInstance.getText().trim().length === 0 && !quillInstance.root.innerHTML.includes('<img') && !quillInstance.root.innerHTML.includes('<iframe')) {
        alert('본문 내용을 입력해 주세요.');
        return;
      }
      content = sanitizeHTML(quillInstance.root.innerHTML);
    } else {
      const textEl = document.getElementById('newsContent');
      if (textEl) content = sanitizeHTML(textEl.value.trim());
    }
    ```
  * 상세 보기 시에도 `escapeHTML` 대신 `sanitizeHTML`을 적용하여 렌더링 (`js/app.js:529` 부근):
    ```javascript
    detailContainer.innerHTML = `
      <div class="news-detail-header">
        <h3 class="news-detail-title">${escapeHTML(activeNews.title)}</h3>
        <div class="news-detail-date">${escapeHTML(activeNews.date)}</div>
      </div>
      <div class="news-detail-body">${sanitizeHTML(activeNews.content)}</div>
    `;
    ```

- [ ] **Step 5: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 6: Git 커밋**
  Run: `git commit -am "feat: integrate Quill Editor to admin news manager with sanitizeHTML protection"`

---

### Task 4: 자유게시판(커뮤니티) 글쓰기 Quill 에디터 연동

**Files:**
- Modify: `js/community.js:246-340` (`renderWriteForm` 및 저장 리스너 수정)
- Modify: `js/community.js:350-380` (`renderPostDetail` 수정)
- Test: `tests/run_tests.js` (`runCommunityQuillTests` 추가 및 실행)

- [ ] **Step 1: 자유게시판 Quill 에디터 연동 테스트 작성**
  `tests/run_tests.js`에 `runCommunityQuillTests()` 함수를 설계하여 게시판 글쓰기 폼 렌더링 시 라이트 툴바(이미지 제외) Quill 인스턴스가 올바르게 바인딩되고 폴백이 지원되는지 검사하는 테스트를 작성합니다.
  ```javascript
  function runCommunityQuillTests() {
    const originalDocument = global.document;
    const originalWindow = global.window;
    
    let appendedHTML = '';
    const mockContainer = {
      set innerHTML(val) { appendedHTML = val; },
      get innerHTML() { return appendedHTML; }
    };
    
    global.document = {
      getElementById: (id) => {
        if (id === 'boardDetailColumn') return mockContainer;
        return { value: '', addEventListener: () => {}, style: {} };
      },
      createElement: () => ({ setAttribute: () => {}, style: {} }),
      querySelectorAll: () => []
    };
    
    // Case A: Quill 존재 시 자유게시판 에디터 컨테이너 렌더링 검증
    global.window = {
      Quill: class {
        constructor(selector, options) {
          this.root = { innerHTML: '' };
          // 라이트 툴바에 'image'가 없는지 검사
          const toolbar = options.modules.toolbar;
          const hasImage = toolbar.flat().includes('image');
          assert.strictEqual(hasImage, false, 'User board editor toolbar must not contain image upload');
        }
        getText() { return ''; }
      }
    };
    
    global.renderWriteForm();
    assert.ok(appendedHTML.includes('id="boardEditorContainer"'), 'Render user board editor container');
    
    global.document = originalDocument;
    global.window = originalWindow;
  }
  ```
  그리고 `runTestBlock('Community Quill Tests (runCommunityQuillTests)', runCommunityQuillTests);`을 하단에 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 3: community.js 의 글쓰기 폼 및 본문 출력 영역 수정**
  `js/community.js`의 `renderWriteForm()`을 수정하여 Quill 라이트 툴바 에디터를 마운트합니다.
  * `renderWriteForm()`의 HTML 템플릿 변경:
    ```javascript
    const hasQuill = typeof window !== 'undefined' && typeof window.Quill !== 'undefined';
    // textarea를 에디터 컨테이너로 조건부 변경
    `
    <div class="board-form-group">
      <label for="postContent">내용</label>
      ${hasQuill ? `
        <div id="boardEditorContainer" style="height: 250px; background: rgba(0,0,0,0.2); border: 1px solid var(--color-glass-border); border-radius: 6px; color: #fff;"></div>
        <input type="hidden" id="postContent" value="">
      ` : `
        <textarea id="postContent" placeholder="내용을 입력해주세요" required style="height: 200px;"></textarea>
      `}
    </div>
    `
    ```
  * 에디터 인스턴스화:
    ```javascript
    let boardQuill = null;
    if (hasQuill) {
      boardQuill = new window.Quill('#boardEditorContainer', {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote'],
            ['link'],
            ['clean']
          ]
        }
      });
    }
    ```
  * 저장 시 에디터 HTML 획득 및 `sanitizeHTML` 적용:
    ```javascript
    let content = '';
    if (boardQuill) {
      if (boardQuill.getText().trim().length === 0) {
        alert('내용을 입력해 주세요.');
        return;
      }
      content = sanitizeHTML(boardQuill.root.innerHTML);
    } else {
      const textEl = document.getElementById('postContent');
      if (textEl) content = sanitizeHTML(textEl.value.trim());
    }
    ```
  * 자유게시판 상세 보기 출력 시 `sanitizeHTML` 적용 (`js/community.js:370` 부근):
    ```javascript
    const detailArea = document.getElementById('boardDetailColumn');
    // ...중략...
    detailArea.innerHTML = `
      ...
      <div class="board-detail-body">${sanitizeHTML(post.content)}</div>
      ...
    `;
    ```

- [ ] **Step 4: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 5: Git 최종 커밋**
  Run: `git commit -am "feat: integrate Quill editor to user community board with sanitizeHTML protection"`
