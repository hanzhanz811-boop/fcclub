# 메인 이미지 슬라이더 및 팝업 관리 시스템 디자인 스펙

## 1. 개요 및 요구사항
본 사양서는 SUNGMAN FC Club 웹 애플리케이션의 홈 화면(메인 탭)을 보다 다이내믹하게 꾸미기 위한 배경 이미지 슬라이더 기능과, 관리자 제어가 가능한 공지용 멀티미디어(이미지/영상) 팝업 시스템의 구체적인 구현 명세를 규정합니다.

### 배경 이미지 슬라이더 요구사항
1. 메인 홈 화면 진입 시, 다크/골드 테마와 어울리도록 배경 이미지를 어둡고 흐리게(Dimmed & Blur) 필터 처리하여 출력합니다.
2. 배경 이미지가 고정되지 않고 여러 장(최대 3장)의 이미지가 부드러운 페이드(Fade-in/out) 애니메이션을 타고 순환하도록 구성합니다.
3. 관리자 대시보드에서 이 슬라이더용 이미지를 업로드(Base64 포맷 변환 저장)하고 목록을 조회 및 삭제할 수 있게 개편합니다.

### 메인 팝업 관리 요구사항
1. 메인 탭 로드 시 공지사항이나 이벤트를 알리는 모달 형태의 팝업을 노출합니다.
2. 팝업은 이미지 또는 영상 콘텐츠를 선택하여 구성할 수 있습니다.
3. 영상은 로컬 스토리지 공간 절약을 위해 외부 URL(유튜브 임베드 또는 direct mp4 주소)을 활용해 재생합니다.
4. 사용자 편의를 위한 "오늘 하루 이 창 열지 않기" (24시간 동안 비노출) 제어 기능을 탑재합니다.
5. 관리자 대시보드에서 팝업 활성화 스위치, 제목, 이동용 하이퍼링크, 미디어 유형 분기 및 파일/URL 세팅 폼을 구성합니다.

---

## 2. 데이터 아키텍처 및 로컬 스토리지 스키마

### 2.1. 메인 배경 슬라이더 데이터 (`mainSliderData`)
* **Key**: `mainSliderData`
* **Type**: `Array of Objects` (최대 3개 객체 제한)
* **Schema**:
  ```typescript
  interface SliderImage {
    id: number;       // 타임스탬프 또는 고유 정수 ID
    image: string;    // Base64 Data URL 인코딩 문자열
  }
  ```
* **초기값 (Fallback)**: `mainSliderData`가 비어 있거나 유효하지 않은 경우, 기존 메인 레이아웃의 디폴트 가상 식별자 배경 파일 구조를 디폴트 값으로 할당하여 안정성을 보장합니다.

### 2.2. 메인 팝업 데이터 (`mainPopupData`)
* **Key**: `mainPopupData`
* **Type**: `Object`
* **Schema**:
  ```typescript
  interface PopupConfig {
    active: boolean;    // 팝업 노출 활성화 여부
    type: 'image' | 'video'; // 미디어 컨텐츠 유형
    title: string;      // 팝업 제목 (모달 헤더 및 alt 정보)
    mediaUrl: string;   // 이미지 Base64/URL 또는 유튜브/mp4 URL 주소
    link?: string;      // 팝업 클릭 시 이동할 커스텀 하이퍼링크 (선택 사항)
  }
  ```
* **오늘 하루 보지 않기 타임스탬프**:
  * **Key**: `popup_hide_until`
  * **Value**: 유닉스 타임스탬프(밀리초 단위). 현재 시간과 대조하여 `현재 시간 < popup_hide_until`인 경우 팝업 생성을 생략합니다.

---

## 3. UI 및 인터랙션 디자인 명세

### 3.1. 메인 홈 화면 배경 슬라이더
* **HTML 구조**:
  기존 홈 섹션의 `.hero-section` 내부에 백그라운드 슬라이더 컨테이너(`.hero-slider-bg`)를 생성하고, 하위에 여러 개의 슬라이드(`.hero-slide`) 레이어를 구성합니다.
  ```html
  <div class="hero-slider-bg">
    <!-- 자바스크립트로 동적 렌더링 -->
    <div class="hero-slide active" style="background-image: url('...');"></div>
    <div class="hero-slide" style="background-image: url('...');"></div>
  </div>
  ```
* **CSS 필터 및 트랜지션**:
  ```css
  .hero-slider-bg {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    z-index: 0;
    overflow: hidden;
  }
  .hero-slide {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 1.5s ease-in-out;
    filter: brightness(0.35) blur(5px); /* 어둡고 흐리게 분위기 필터 가공 */
  }
  .hero-slide.active {
    opacity: 1;
  }
  ```
* **인터랙션**:
  * 자바스크립트 `setInterval` 타이머를 통해 `5000ms(5초)` 간격으로 활성화된 슬라이드 인덱스를 변경하여 순차적으로 페이드 전환 효과를 유도합니다.

### 3.2. 멀티미디어 공지 팝업 모달
* **HTML 및 노출 제어**:
  * 메인 탭 활성화 또는 홈 화면 렌더링 직후 `localStorage`를 조회해 팝업 생성기를 실행합니다.
  * 모달은 화면 중앙 정렬 및 뒷배경 딤드 레이어가 포함된 구조로 구성하며, 팝업 제목 및 미디어 출력부, 하단 컨트롤러로 나뉩니다.
* **비디오/유튜브 임베딩 자동 변환**:
  * 사용자가 입력한 동영상 URL이 유튜브 주소(`youtube.com`, `youtu.be` 등)를 포함하는 경우, 자바스크립트 정규식 파싱을 거쳐 자동으로 임베드용 iframe 주소(`https://www.youtube.com/embed/{영상ID}`)로 변환하여 `<iframe>` 태그를 노출합니다.
  * 일반적인 직접 재생 링크(`.mp4` 등)인 경우 `<video src="..." controls autoplay muted loop>` 태그를 바인딩합니다.
* **오늘 하루 보지 않기**:
  * 하단 제어 바에 `[오늘 하루 이 창 열지 않기]` 버튼과 `[닫기]` 버튼을 함께 구성하여, 클릭 시 브라우저 시간에 24시간을 더한 타임스탬프를 `popup_hide_until` 키에 저장하고 모달을 닫습니다.

---

## 4. 관리자 제어 대시보드 명세

### 4.1. 메인 슬라이더 관리 섹션
* **목록 조회**: 현재 등록된 3장의 썸네일과 원본 크기를 보여주고 삭제 버튼을 제공합니다.
* **이미지 등록**:
  * 3장 제한 체크: 현재 등록된 슬라이더가 3장인 경우 업로드 버튼을 비활성화하고 경고 툴팁을 노출합니다.
  * 확장자 유효성 검사: 이미지 MIME-type 파일만 수용합니다.
  * 크기 유효성 검사: 파일 사이즈가 **1.5MB(1,500,000 bytes) 초과**인 경우 경고 얼럿과 함께 리셋합니다.
  * 미리보기: FileReader의 `load` 완료 시 XSS를 완벽히 격리하기 위해 `document.createElement('img')` 방식으로 안전하게 돔에 주입하여 미리보기를 구현합니다.

### 4.2. 팝업 설정 관리 섹션
* **팝업 제어 폼**:
  * 활성화 스위치 (Checkbox)
  * 팝업 제목 입력 필드
  * 팝업 연결 링크 입력 필드 (선택 사항)
  * 미디어 형식 선택 (Radio: 이미지 vs 동영상)
    * `이미지` 선택 시: 파일 업로드 컴포넌트(1.5MB 제한) 혹은 이미지 URL 텍스트 입력창 노출
    * `동영상` 선택 시: 유튜브 주소 혹은 mp4 비디오 재생 URL 텍스트 입력창 노출
* **저장 핸들러**: 폼 제출 시 `mainPopupData` 오브젝트로 가공하여 `localStorage`에 병합 저장합니다.

---

## 5. 테스트 및 검증 계획 (Test Suite Integration)
* [tests/run_tests.js](file:///J:/project/fcclub/tests/run_tests.js) 파일 하단에 `runMainSliderAndPopupTests()` 단위 및 통합 테스트 세트를 새롭게 탑재합니다.
* **주요 테스트 블록 사양**:
  1. **슬라이더 최대 등록 차단**: 관리자 슬라이더 저장 로직 모의 호출 시 배열 요소의 크기가 3개 초과 등록되려 할 때 경고와 함께 롤백되는지 검증.
  2. **팝업 하루 보지 않기 논리 연산**: `popup_hide_until` 타임스탬프가 미래 시점으로 기록되어 있을 때 모달 팝업 빌더 함수가 UI를 렌더링하지 않고 생략하는지 유무 판별.
  3. **유튜브 URL 정규식 치환 무결성**: 다양한 포맷의 유튜브 URL(공유 주소, 단축 주소 등)이 팝업 비디오 iframe에 삽입될 때 정규식 변환기 함수를 통해 올바른 `embed` URL 주소로 매핑 및 변환되는지 단언문(`assert`) 검증.
  4. **Mock 리소스 예외 해제**: 테스트 전반에 사용된 모의 document 요소와 타이머들이 `try...finally`로 깔끔하게 원복 및 제거되는지 검사.
