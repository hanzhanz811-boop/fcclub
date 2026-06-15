# 모바일 반응형 및 UI 다듬기 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 환경(768px 미만)에서 작동하는 하단 고정 탭바(Bottom Navigation Bar)를 구현하고, 각 탭별 레이아웃을 모바일에 맞추어 튜닝 및 스크롤 편의 인터랙션을 추가하여 프리미엄 SPA 웹 경험을 완성한다.

**Architecture:** 데스크톱 상단 헤더 메뉴와 모바일 하단 고정 탭바를 미디어 쿼리를 통해 전환하고, `app.js` 라우터 엔진에 모바일 탭 활성화 상태 변경 로직을 결합한다.

**Tech Stack:** HTML5, CSS3, Javascript

---

### Task 1: 모바일 하단 고정 탭바 HTML 마크업 및 아이콘 추가

**Files:**
- Modify: `index.html`

- [ ] **Step 1: index.html 하단에 모바일 네비게이션 바 추가**
  `<footer>` 태그 바로 뒤 또는 직전에 `<nav class="mobile-nav-bar">` 요소를 추가합니다. 각 항목은 SVG 아이콘과 텍스트 태그로 구성되며, 데스크톱 라우터 클릭을 위한 `data-tab` 속성을 동일하게 가집니다.
  ```html
  <!-- index.html 추가 부분 -->
  <nav class="mobile-nav-bar" aria-label="모바일 네비게이션">
    <ul>
      <li>
        <a href="#home" class="mobile-nav-link active" data-tab="home">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>홈</span>
        </a>
      </li>
      <li>
        <a href="#club" class="mobile-nav-link" data-tab="club">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span>구단</span>
        </a>
      </li>
      <li>
        <a href="#squad" class="mobile-nav-link" data-tab="squad">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 8 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          <span>선수단</span>
        </a>
      </li>
      <li>
        <a href="#matches" class="mobile-nav-link" data-tab="matches">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          <span>경기</span>
        </a>
      </li>
      <li>
        <a href="#fanzone" class="mobile-nav-link" data-tab="fanzone">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
          </svg>
          <span>팬존</span>
        </a>
      </li>
    </ul>
  </nav>
  ```

- [ ] **Step 2: 변경사항 커밋**
  ```bash
  git add index.html
  git commit -m "feat: add mobile bottom navigation bar markup in HTML"
  ```

---

### Task 2: 모바일 하단 고정 탭바 CSS 반응형 노출 및 스타일링

**Files:**
- Modify: `css/main.css`

- [ ] **Step 1: 모바일 네비게이션 CSS 코드 추가**
  `css/main.css` 파일 하단에 모바일 하단바 스타일 및 데스크톱/모바일 화면 폭 변환 미디어 쿼리를 선언합니다.
  ```css
  /* css/main.css 추가사항 */
  .mobile-nav-bar {
    display: none;
  }

  @media (max-width: 768px) {
    /* 기존 데스크톱 네비게이션 숨김 */
    header nav {
      display: none;
    }

    /* 상단 헤더 컨테이너 조절 */
    .header-container {
      justify-content: center; /* 모바일에서는 로고 중앙 정렬 */
      height: 60px;
    }
    main {
      margin-top: 60px;
      padding-bottom: 70px; /* 하단 탭바에 가려지지 않게 여백 추가 */
    }

    /* 하단 고정 탭바 스타일링 */
    .mobile-nav-bar {
      display: block;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 65px;
      background-color: var(--color-glass-bg);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-top: 1px solid var(--color-glass-border);
      z-index: 2000;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
    }

    .mobile-nav-bar ul {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 100%;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .mobile-nav-bar li {
      flex: 1;
      text-align: center;
    }

    .mobile-nav-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: var(--color-text-muted);
      font-size: 11px;
      font-weight: 500;
      gap: 4px;
      height: 100%;
      transition: var(--transition-smooth);
    }

    .mobile-nav-link svg {
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .mobile-nav-link:hover {
      color: var(--color-text-primary);
    }

    .mobile-nav-link.active {
      color: var(--color-gold-solid);
    }

    .mobile-nav-link.active svg {
      fill: var(--color-gold-solid);
      transform: scale(1.15); /* 탭 클릭 시 마이크로 바운스 효과 */
    }
  }
  ```

- [ ] **Step 2: 변경사항 커밋**
  ```bash
  git add css/main.css
  git commit -m "style: implement mobile bottom navigation bar CSS design"
  ```

---

### Task 3: 구역별 레이아웃 모바일 최적화 미디어 쿼리 정의

**Files:**
- Modify: `css/components.css`

- [ ] **Step 1: css/components.css에 반응형 뷰포트 오버라이드 추가**
  각 컴포넌트별로 모바일 화면에서 적절하게 재배열 및 크기가 조절되도록 미디어 쿼리를 추가합니다.
  ```css
  /* css/components.css 추가사항 */
  @media (max-width: 768px) {
    /* 홈(Home) - 히어로 배너 */
    .hero-content h1 {
      font-size: 28px;
    }
    .hero-content p {
      font-size: 14px;
    }
    /* 홈(Home) - 뉴스 그리드 1열로 변경 */
    .news-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    /* 구단(Club) - 아레나 및 소개 1열 변경 */
    .arena-grid {
      grid-template-columns: 1fr;
    }
    .arena-image {
      height: 220px;
    }

    /* 선수단(Squad) - 필터 가로 스크롤 허용 */
    .squad-filters {
      display: flex;
      overflow-x: auto;
      white-space: nowrap;
      padding-bottom: 8px;
      justify-content: flex-start;
      gap: 8px;
      -webkit-overflow-scrolling: touch;
    }
    .filter-btn {
      flex: 0 0 auto;
      padding: 8px 16px;
    }
    /* 선수단(Squad) - 카드 그리드 2열 튜닝 */
    .squad-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    /* 선수단(Squad) - 스탯 모달창 92%로 확장 */
    .modal-content {
      width: 92%;
      padding: 20px;
    }
    .player-modal-layout {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    /* 경기(Matches) - 경기 일정 및 순위표 세로 배치 */
    .matches-grid {
      grid-template-columns: 1fr;
      gap: 30px;
    }
    /* 경기(Matches) - 순위표 테이블 가로 스크롤 지원 */
    .league-table-section {
      overflow-x: auto;
    }
    .standing-table {
      min-width: 500px; /* 테이블 요소 찌그러짐 방지 */
    }

    /* 팬존(Fan Zone) - 게시판 1열 배치 */
    .fanzone-layout {
      grid-template-columns: 1fr;
      gap: 25px;
    }
    /* 팬존(Fan Zone) - 하단 탭바 겹침 마진 확보 */
    .board-detail-column {
      margin-bottom: 20px;
    }
  }
  ```

- [ ] **Step 2: 변경사항 커밋**
  ```bash
  git add css/components.css
  git commit -m "style: optimize layout components for mobile screens"
  ```

---

### Task 4: 모바일 탭 라우터 스크립트 결합 및 게시판 상세 자동 스크롤 인터랙션

**Files:**
- Modify: `js/app.js`
- Modify: `js/community.js`

- [ ] **Step 1: js/app.js 라우터 업데이트**
  모바일 하단바 링크 클릭 이벤트 수집 및 액티브 탭 클래스 토글 처리를 포함하도록 `initRouter` 및 `switchTab` 함수를 수정합니다.
  ```javascript
  // js/app.js 수정 사항
  // initRouter 내에 모바일 링크 클릭 핸들러 추가
  function initRouter() {
    // 기존 데스크톱 링크
    const navLinks = document.querySelectorAll('nav a.nav-link');
    // 모바일 링크
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    function handleLinkClick(e) {
      e.preventDefault();
      const tabId = this.getAttribute('data-tab');
      window.location.hash = tabId;
    }

    navLinks.forEach(link => link.addEventListener('click', handleLinkClick));
    mobileLinks.forEach(link => link.addEventListener('click', handleLinkClick));

    window.addEventListener('hashchange', () => {
      let hash = window.location.hash.substring(1);
      if (!hash) hash = 'home';
      switchTab(hash);
    });

    // 초기 로드 시 라우팅
    let initialHash = window.location.hash.substring(1);
    if (!initialHash) initialHash = 'home';
    switchTab(initialHash);
  }

  // switchTab 함수 수정: 데스크톱/모바일 탭 링크 모두 active 토글하도록 수정
  function switchTab(tabId) {
    const sections = document.querySelectorAll('.tab-section');
    sections.forEach(section => {
      section.classList.remove('active');
    });

    const activeSection = document.getElementById(tabId);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // 데스크톱 액티브 처리
    const navLinks = document.querySelectorAll('nav a.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 모바일 액티브 처리
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 탭 이동 시 상단 스크롤 복구
    window.scrollTo(0, 0);

    // 탭별 추가 액션
    if (tabId === 'fanzone' && typeof window.renderCommunity === 'function') {
      window.renderCommunity();
    }
  }
  ```

- [ ] **Step 2: js/community.js 모바일 스크롤 추가**
  모바일 화면(너비 <= 768px)에서 글쓰기 폼이 열리거나 글 상세 페이지가 렌더링될 때 사용자의 가독성을 위해 해당 영역(`boardDetailColumn`)으로 부드러운 스크롤 인터랙션을 유도하는 헬퍼 함수를 추가하고, 렌더링 함수(`renderWriteForm`, `renderPostDetail`)가 실행되는 타이밍에 결합합니다.
  ```javascript
  // js/community.js 수정사항
  // 자동 스크롤 함수 정의
  function scrollDetailIntoViewOnMobile() {
    if (window.innerWidth <= 768) {
      const detailColumn = document.getElementById('boardDetailColumn');
      if (detailColumn) {
        detailColumn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // renderWriteForm() 끝에 추가
  function renderWriteForm() {
    // ... [기존 코드 생략] ...
    // 양식 렌더링 후 호출
    scrollDetailIntoViewOnMobile();
  }

  // renderPostDetail(postId) 끝에 추가
  function renderPostDetail(postId) {
    // ... [기존 코드 생략] ...
    // 상세 페이지 및 댓글창 렌더링 후 호출
    scrollDetailIntoViewOnMobile();
  }
  ```

- [ ] **Step 3: 테스트 실행 및 무결성 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 4: 변경사항 커밋**
  ```bash
  git add js/app.js js/community.js
  git commit -m "feat: integrate mobile tab router and auto-scroll detail interaction"
  ```
