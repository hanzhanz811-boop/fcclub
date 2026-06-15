# 관리자 페이지 및 로컬 스토리지 CRUD 연동 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 성만 FC 홈페이지에 클라이언트 사이드 관리자 페이지(`#admin-login`, `#admin-dashboard`)를 구축하고, 로컬 스토리지를 활용하여 뉴스, 선수단, 경기 데이터를 관리자가 추가, 수정, 삭제할 수 있도록 구현합니다.

**Architecture:** 
- 기존 정적 데이터 리소스를 로컬 스토리지로 마이그레이션하여, 모든 뷰 컴포넌트가 로컬 스토리지에 반응하여 실시간으로 갱신되도록 설계합니다.
- 관리자 권한 여부를 `sessionStorage`와 상태 변수로 유지하며, 보안 라우팅 리다이렉션을 결합합니다.
- 로그인 폼과 뉴스/선수단/경기 관리 기능을 관리자 대시보드 2단 레이아웃 내에서 동적 서브 탭으로 렌더링하고, 이스케이프 유틸리티와 ARIA 웹 접근성 마크업을 충족시킵니다.

**Tech Stack:** HTML5, Vanilla CSS, Vanilla JavaScript

---

### Task 1: Footer and Routing Layout updates

**Files:**
- Modify: `index.html`

- [x] **Step 1: 푸터 영역에 관리자 링크 추가**
  `index.html`의 `<footer>` 내부 저작권 텍스트 옆에 Admin 진입용 링크를 조그맣게 추가합니다.
  ```html
  <footer>
    <div class="container">
      <p>&copy; 2026 SUNGMAN FC. All Rights Reserved. | <a href="#admin-login" class="admin-link">Admin</a></p>
    </div>
  </footer>
  ```

- [x] **Step 2: 관리자 로그인 및 대시보드 탭 섹션 추가**
  `index.html` 내에 `#admin-login` 및 `#admin-dashboard` 두 개의 빈 탭 섹션을 추가합니다.
  ```html
  <!-- Admin Login Tab -->
  <section id="admin-login" class="tab-section" aria-labelledby="admin-login-heading">
    <div class="container admin-login-container">
      <div class="card admin-login-card">
        <h2 id="admin-login-heading">ADMIN LOGIN</h2>
        <form id="adminLoginForm">
          <div class="admin-form-group">
            <label for="adminUsername">아이디</label>
            <input type="text" id="adminUsername" required placeholder="Username">
          </div>
          <div class="admin-form-group">
            <label for="adminPassword">비밀번호</label>
            <input type="password" id="adminPassword" required placeholder="Password">
          </div>
          <div class="admin-error-msg" id="adminLoginError" aria-live="assertive"></div>
          <button type="submit" class="btn btn-gold w-100">로그인</button>
        </form>
      </div>
    </div>
  </section>

  <!-- Admin Dashboard Tab -->
  <section id="admin-dashboard" class="tab-section" aria-labelledby="admin-dashboard-heading">
    <div class="container admin-dashboard-container">
      <div class="section-header">
        <h2 id="admin-dashboard-heading">ADMIN DASHBOARD</h2>
      </div>
      <div class="admin-layout">
        <!-- 왼쪽 영역: 서브 네비게이션 -->
        <div class="admin-nav-column">
          <ul>
            <li><button class="admin-nav-btn active" data-admin-tab="news">뉴스 관리</button></li>
            <li><button class="admin-nav-btn" data-admin-tab="squad">선수단 관리</button></li>
            <li><button class="admin-nav-btn" data-admin-tab="matches">경기 관리</button></li>
            <li><button class="admin-nav-btn logout-btn" id="btnAdminLogout">로그아웃</button></li>
          </ul>
        </div>
        <!-- 오른쪽 영역: 동적 작업 공간 -->
        <div id="adminWorkContent" class="admin-work-column">
          <!-- JS 동적 렌더링 -->
        </div>
      </div>
    </div>
  </section>
  ```

---

### Task 2: Styles for Admin login & Dashboard

**Files:**
- Modify: `css/components.css`

- [x] **Step 1: css/components.css에 관리자 페이지 전용 스타일 및 미디어 쿼리 추가**
  관리자 전용 폼, 대시보드 테이블, CRUD 조작용 미디엄/스몰 버튼 및 레이아웃을 `css/components.css` 끝에 선언합니다.
  ```css
  /* Admin Page Styles */
  .admin-login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80px 0;
  }
  .admin-login-card {
    width: 100%;
    max-width: 400px;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-glass-border);
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
  .admin-login-card h2 {
    font-family: var(--font-header);
    font-size: 24px;
    color: var(--color-gold-solid);
    text-align: center;
    margin-bottom: 25px;
    letter-spacing: 1px;
  }
  .admin-form-group {
    margin-bottom: 20px;
  }
  .admin-form-group label {
    display: block;
    font-size: 13px;
    color: var(--color-text-muted);
    margin-bottom: 6px;
  }
  .admin-form-group input, .admin-form-group select, .admin-form-group textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-glass-border);
    color: #fff;
    padding: 12px;
    border-radius: 6px;
    font-family: inherit;
    font-size: 14px;
    transition: var(--transition-smooth);
  }
  .admin-form-group input:focus, .admin-form-group select:focus, .admin-form-group textarea:focus {
    outline: none;
    border-color: var(--color-gold-solid);
    background: rgba(0, 0, 0, 0.5);
  }
  .admin-error-msg {
    color: #ff4a4a;
    font-size: 13px;
    margin-bottom: 15px;
    min-height: 18px;
    text-align: center;
  }
  .admin-link {
    color: var(--color-text-muted);
    text-decoration: none;
    transition: var(--transition-smooth);
    margin-left: 5px;
  }
  .admin-link:hover {
    color: var(--color-gold-solid);
  }

  /* Admin Dashboard Layout */
  .admin-dashboard-container {
    padding-bottom: 60px;
  }
  .admin-layout {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 30px;
    align-items: start;
  }
  .admin-nav-column {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-glass-border);
    border-radius: 12px;
    padding: 20px;
  }
  .admin-nav-column ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .admin-nav-column li {
    margin-bottom: 10px;
  }
  .admin-nav-column li:last-child {
    margin-bottom: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 10px;
    margin-top: 10px;
  }
  .admin-nav-btn {
    width: 100%;
    background: transparent;
    border: 1px solid transparent;
    color: var(--color-text-muted);
    padding: 12px 16px;
    text-align: left;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: var(--transition-smooth);
  }
  .admin-nav-btn:hover, .admin-nav-btn.active {
    color: var(--color-gold-solid);
    background: rgba(212, 175, 55, 0.05);
    border-color: var(--color-glass-border);
  }
  .admin-nav-btn.logout-btn {
    color: #ff4a4a;
  }
  .admin-nav-btn.logout-btn:hover {
    background: rgba(255, 74, 74, 0.05);
    border-color: rgba(255, 74, 74, 0.2);
  }
  .admin-work-column {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-glass-border);
    border-radius: 12px;
    padding: 25px;
    min-height: 500px;
  }
  .admin-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 15px;
    margin-bottom: 25px;
  }
  .admin-section-header h3 {
    font-family: var(--font-header);
    font-size: 20px;
    color: var(--color-gold-solid);
    margin: 0;
  }
  .admin-table-wrapper {
    overflow-x: auto;
    margin-bottom: 20px;
  }
  .admin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .admin-table th, .admin-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .admin-table th {
    font-weight: 600;
    color: var(--color-text-muted);
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  }
  .admin-table td {
    color: var(--color-text-primary);
  }
  .admin-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }
  .admin-actions {
    display: flex;
    gap: 8px;
  }
  .admin-actions .btn-sm {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 4px;
  }
  .w-100 {
    width: 100%;
  }

  @media (max-width: 768px) {
    .admin-layout {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
  ```

---

### Task 3: Dynamic State & LocalStorage Migration in JS

**Files:**
- Modify: `js/app.js`

- [x] **Step 1: js/app.js 정적 상수를 로컬 스토리지 연동 상태 변수로 전환**
  `js/app.js` 상단에 동적 뉴스, 선수단, 경기 배열 변수와 로그인 세션 변수를 추가하고, `initLocalStorageData` 함수를 구현하여 최초 진입 시 데이터가 로컬 스토리지에 자동으로 저장되도록 처리합니다.
  ```javascript
  // js/app.js 파일 상단 추가 사항
  let newsList = [];
  let squadList = [];
  let matchList = [];
  let isAdminLoggedIn = false;
  let activeAdminTab = 'news';

  // DOMContentLoaded 이벤트 리스너 내부에 데이터 로드 로직 삽입
  document.addEventListener('DOMContentLoaded', () => {
    initLocalStorageData();
    // ... [기존 초기화 코드] ...
  });

  function initLocalStorageData() {
    if (typeof localStorage !== 'undefined') {
      // News
      const storedNews = localStorage.getItem('sungman_news');
      if (storedNews) {
        newsList = JSON.parse(storedNews);
      } else if (typeof newsData !== 'undefined') {
        newsList = JSON.parse(JSON.stringify(newsData));
        localStorage.setItem('sungman_news', JSON.stringify(newsList));
      }
      
      // Squad
      const storedSquad = localStorage.getItem('sungman_squad');
      if (storedSquad) {
        squadList = JSON.parse(storedSquad);
      } else if (typeof squadData !== 'undefined') {
        squadList = JSON.parse(JSON.stringify(squadData));
        localStorage.setItem('sungman_squad', JSON.stringify(squadList));
      }

      // Matches
      const storedMatches = localStorage.getItem('sungman_matches');
      if (storedMatches) {
        matchList = JSON.parse(storedMatches);
      } else if (typeof matchData !== 'undefined') {
        matchList = JSON.parse(JSON.stringify(matchData));
        localStorage.setItem('sungman_matches', JSON.stringify(matchList));
      }
    }
  }
  ```

- [x] **Step 2: 기존 정적 참조 함수들 동적 상태 참조로 교체**
  `js/app.js` 내부의 렌더링 함수들이 `newsData`, `squadData`, `matchData` 전역 상수 대신 `newsList`, `squadList`, `matchList` 동적 배열 변수를 사용하도록 일괄 교체합니다.
  * 수정 대상 함수:
    - `bindNextMatchWidget()` (matchData -> matchList)
    - `renderSquad(positionFilter)` (squadData -> squadList)
    - `openPlayerModal(playerId)` (squadData -> squadList)
    - `bindMatchCenter()` (matchData -> matchList, standingData -> standingList 또는 mock 정적 유지)
    - `bindNewsWidget()` (newsData -> newsList)
    - `renderNewsPage()` (newsData -> newsList)

---

### Task 4: Admin Controller (Login, Navigation, CRUD)

**Files:**
- Modify: `js/app.js`

- [x] **Step 1: switchTab 라우팅 로직 보안 분기 연동**
  `switchTab` 함수 내에서 `#admin-login`과 `#admin-dashboard` 해시 진입 시 로그인 세션에 따라 서로 리다이렉트하는 코드를 심습니다.
  ```javascript
  // switchTab 내부 추가
  if (tabId === 'admin-login') {
    if (isAdminLoggedIn) {
      window.location.hash = 'admin-dashboard';
      return;
    }
    renderAdminLogin();
  }
  if (tabId === 'admin-dashboard') {
    if (!isAdminLoggedIn) {
      window.location.hash = 'admin-login';
      return;
    }
    renderAdminDashboard();
  }
  ```

- [x] **Step 2: 관리자 로그인 폼 핸들러 및 바인딩 기능 구현**
  세션 및 아이디/패스워드 확인 동작을 바인딩하는 `bindAdminFeatures()`를 추가합니다.
  ```javascript
  function bindAdminFeatures() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('adminUsername');
        const passwordInput = document.getElementById('adminPassword');
        const errorMsg = document.getElementById('adminLoginError');

        if (usernameInput.value === 'admin' && passwordInput.value === 'admin1234') {
          isAdminLoggedIn = true;
          sessionStorage.setItem('sungman_admin_logged_in', 'true');
          errorMsg.textContent = '';
          usernameInput.value = '';
          passwordInput.value = '';
          window.location.hash = 'admin-dashboard';
        } else {
          errorMsg.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
        }
      });
    }

    const logoutBtn = document.getElementById('btnAdminLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        isAdminLoggedIn = false;
        sessionStorage.removeItem('sungman_admin_logged_in');
        window.location.hash = 'home';
      });
    }
  }
  ```

- [x] **Step 3: renderAdminLogin() 및 renderAdminDashboard() 기초 구현**
  `js/app.js`에 대시보드 렌더러와 좌측 탭 변경 리스너를 구현합니다.
  ```javascript
  function renderAdminLogin() {
    const errorMsg = document.getElementById('adminLoginError');
    if (errorMsg) errorMsg.textContent = '';
  }

  function renderAdminDashboard() {
    renderAdminWorkArea();
    
    // 좌측 메뉴 클릭 감지
    const navButtons = document.querySelectorAll('.admin-nav-btn:not(.logout-btn)');
    navButtons.forEach(btn => {
      // 기존 리스너 제거 효과를 위해 교체
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.classList.toggle('active', newBtn.getAttribute('data-admin-tab') === activeAdminTab);
      newBtn.addEventListener('click', () => {
        activeAdminTab = newBtn.getAttribute('data-admin-tab');
        renderAdminDashboard();
      });
    });
  }

  function renderAdminWorkArea() {
    const workContent = document.getElementById('adminWorkContent');
    if (!workContent) return;

    if (activeAdminTab === 'news') {
      renderAdminNews(workContent);
    } else if (activeAdminTab === 'squad') {
      renderAdminSquad(workContent);
    } else if (activeAdminTab === 'matches') {
      renderAdminMatches(workContent);
    }
  }
  ```

- [x] **Step 4: 뉴스 CRUD 기능 구현**
  `renderAdminNews(workContent)` 함수를 추가하여 로컬 스토리지에 동적 동기화되는 뉴스 추가, 편집 및 삭제 기능을 구축합니다.
  ```javascript
  function renderAdminNews(container) {
    container.innerHTML = `
      <div class="admin-section-header">
        <h3>뉴스 관리</h3>
        <button class="btn btn-gold btn-sm" id="btnAdminAddNews">뉴스 등록</button>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>제목</th>
              <th style="width:120px;">작업</th>
            </tr>
          </thead>
          <tbody>
            ${newsList.map(news => `
              <tr>
                <td>${escapeHTML(news.date)}</td>
                <td>${escapeHTML(news.title)}</td>
                <td>
                  <div class="admin-actions">
                    <button class="btn btn-gold btn-sm btn-edit-news" data-id="${news.id}">수정</button>
                    <button class="btn btn-sm btn-delete-news" style="background:#ff4a4a;" data-id="${news.id}">삭제</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="adminNewsFormContainer"></div>
    `;

    // 등록 버튼 이벤트
    document.getElementById('btnAdminAddNews').addEventListener('click', () => {
      showNewsForm();
    });

    // 수정 및 삭제 바인딩
    container.querySelectorAll('.btn-edit-news').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        showNewsForm(id);
      });
    });

    container.querySelectorAll('.btn-delete-news').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        if (confirm('정말로 이 뉴스를 삭제하시겠습니까?')) {
          newsList = newsList.filter(n => n.id !== id);
          localStorage.setItem('sungman_news', JSON.stringify(newsList));
          renderAdminNews(container);
          bindNewsWidget(); // 공개 화면 즉시 갱신
        }
      });
    });
  }

  function showNewsForm(id = null) {
    const formContainer = document.getElementById('adminNewsFormContainer');
    if (!formContainer) return;

    const news = id ? newsList.find(n => n.id === id) : null;

    formContainer.innerHTML = `
      <div class="card" style="margin-top:20px; border:1px solid var(--color-glass-border); padding:20px;">
        <h4>${id ? '뉴스 수정' : '새 뉴스 등록'}</h4>
        <form id="adminNewsForm">
          <div class="admin-form-group">
            <label for="newsFormTitle">제목</label>
            <input type="text" id="newsFormTitle" required value="${news ? escapeHTML(news.title) : ''}">
          </div>
          <div class="admin-form-group">
            <label for="newsFormDate">날짜</label>
            <input type="text" id="newsFormDate" required placeholder="YYYY.MM.DD" value="${news ? escapeHTML(news.date) : new Date().toLocaleDateString('ko-KR').replace(/\s/g, '').slice(0, -1)}">
          </div>
          <div class="admin-form-group">
            <label for="newsFormContent">본문 내용</label>
            <textarea id="newsFormContent" required style="height:150px;">${news ? escapeHTML(news.content) : ''}</textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-sm" id="btnCancelNewsForm">취소</button>
            <button type="submit" class="btn btn-gold btn-sm">저장</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('btnCancelNewsForm').addEventListener('click', () => {
      formContainer.innerHTML = '';
    });

    document.getElementById('adminNewsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('newsFormTitle').value;
      const date = document.getElementById('newsFormDate').value;
      const content = document.getElementById('newsFormContent').value;

      if (id) {
        // 수정
        const target = newsList.find(n => n.id === id);
        if (target) {
          target.title = title;
          target.date = date;
          target.content = content;
        }
      } else {
        // 추가
        const nextId = newsList.length > 0 ? Math.max(...newsList.map(n => n.id)) + 1 : 1;
        newsList.push({ id: nextId, date, title, content });
      }

      localStorage.setItem('sungman_news', JSON.stringify(newsList));
      bindNewsWidget(); // 공개 화면 위젯 갱신
      renderAdminWorkArea(); // 관리자 작업 영역 리렌더링
    });
  }
  ```

- [x] **Step 5: 선수단 CRUD 기능 구현**
  선수 추가, 수정, 삭제 폼을 렌더링하는 `renderAdminSquad(container)`와 세부 헬퍼 함수를 추가합니다.
  ```javascript
  function renderAdminSquad(container) {
    container.innerHTML = `
      <div class="admin-section-header">
        <h3>선수단 관리</h3>
        <button class="btn btn-gold btn-sm" id="btnAdminAddSquad">선수 추가</button>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>이름</th>
              <th>포지션</th>
              <th style="width:120px;">작업</th>
            </tr>
          </thead>
          <tbody>
            ${squadList.map(p => `
              <tr>
                <td>${p.number}</td>
                <td>${escapeHTML(p.name)}</td>
                <td>${escapeHTML(p.position)}</td>
                <td>
                  <div class="admin-actions">
                    <button class="btn btn-gold btn-sm btn-edit-squad" data-id="${p.id}">수정</button>
                    <button class="btn btn-sm btn-delete-squad" style="background:#ff4a4a;" data-id="${p.id}">삭제</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="adminSquadFormContainer"></div>
    `;

    document.getElementById('btnAdminAddSquad').addEventListener('click', () => {
      showSquadForm();
    });

    container.querySelectorAll('.btn-edit-squad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        showSquadForm(id);
      });
    });

    container.querySelectorAll('.btn-delete-squad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        if (confirm('정말로 이 선수를 삭제하시겠습니까?')) {
          squadList = squadList.filter(p => p.id !== id);
          localStorage.setItem('sungman_squad', JSON.stringify(squadList));
          renderSquad(); // 공개 뷰 리렌더링
          renderAdminSquad(container);
        }
      });
    });
  }

  function showSquadForm(id = null) {
    const formContainer = document.getElementById('adminSquadFormContainer');
    if (!formContainer) return;

    const player = id ? squadList.find(p => p.id === id) : null;

    formContainer.innerHTML = `
      <div class="card" style="margin-top:20px; border:1px solid var(--color-glass-border); padding:20px;">
        <h4>${id ? '선수 프로필 수정' : '새 선수 등록'}</h4>
        <form id="adminSquadForm">
          <div class="admin-form-group">
            <label for="squadFormName">이름</label>
            <input type="text" id="squadFormName" required value="${player ? escapeHTML(player.name) : ''}">
          </div>
          <div class="admin-form-group">
            <label for="squadFormEngName">영문 이름</label>
            <input type="text" id="squadFormEngName" required value="${player ? escapeHTML(player.engName) : ''}">
          </div>
          <div class="admin-form-group">
            <label for="squadFormNumber">등번호</label>
            <input type="number" id="squadFormNumber" required value="${player ? player.number : ''}">
          </div>
          <div class="admin-form-group">
            <label for="squadFormPosition">포지션</label>
            <select id="squadFormPosition">
              <option value="GK" ${player && player.position === 'GK' ? 'selected' : ''}>GK</option>
              <option value="DF" ${player && player.position === 'DF' ? 'selected' : ''}>DF</option>
              <option value="MF" ${player && player.position === 'MF' ? 'selected' : ''}>MF</option>
              <option value="FW" ${player && player.position === 'FW' ? 'selected' : ''}>FW</option>
            </select>
          </div>
          <h5>상세 능력치 및 신체조건</h5>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div class="admin-form-group">
              <label for="squadFormBirth">생년월일</label>
              <input type="text" id="squadFormBirth" placeholder="YYYY-MM-DD" value="${player ? escapeHTML(player.details.birth) : ''}">
            </div>
            <div class="admin-form-group">
              <label for="squadFormHeight">신장 (cm)</label>
              <input type="number" id="squadFormHeight" value="${player ? player.details.height : ''}">
            </div>
            <div class="admin-form-group">
              <label for="squadFormWeight">체중 (kg)</label>
              <input type="number" id="squadFormWeight" value="${player ? player.details.weight : ''}">
            </div>
            <div class="admin-form-group">
              <label for="squadFormMatches">출장 수</label>
              <input type="number" id="squadFormMatches" value="${player ? player.stats.matches : 0}">
            </div>
            <div class="admin-form-group">
              <label for="squadFormGoals">득점 수</label>
              <input type="number" id="squadFormGoals" value="${player ? player.stats.goals : 0}">
            </div>
            <div class="admin-form-group">
              <label for="squadFormAssists">도움 수</label>
              <input type="number" id="squadFormAssists" value="${player ? player.stats.assists : 0}">
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-sm" id="btnCancelSquadForm">취소</button>
            <button type="submit" class="btn btn-gold btn-sm">저장</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('btnCancelSquadForm').addEventListener('click', () => {
      formContainer.innerHTML = '';
    });

    document.getElementById('adminSquadForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('squadFormName').value;
      const engName = document.getElementById('squadFormEngName').value;
      const number = parseInt(document.getElementById('squadFormNumber').value, 10);
      const position = document.getElementById('squadFormPosition').value;
      const birth = document.getElementById('squadFormBirth').value;
      const height = parseInt(document.getElementById('squadFormHeight').value, 10) || 0;
      const weight = parseInt(document.getElementById('squadFormWeight').value, 10) || 0;
      const matches = parseInt(document.getElementById('squadFormMatches').value, 10) || 0;
      const goals = parseInt(document.getElementById('squadFormGoals').value, 10) || 0;
      const assists = parseInt(document.getElementById('squadFormAssists').value, 10) || 0;

      if (id) {
        const target = squadList.find(p => p.id === id);
        if (target) {
          target.name = name;
          target.engName = engName;
          target.number = number;
          target.position = position;
          target.details = { birth, height, weight };
          target.stats = { matches, goals, assists };
        }
      } else {
        const nextId = squadList.length > 0 ? Math.max(...squadList.map(p => p.id)) + 1 : 1;
        squadList.push({
          id: nextId,
          name,
          engName,
          number,
          position,
          stats: { matches, goals, assists },
          details: { height, weight, birth },
          image: "player_placeholder"
        });
      }

      localStorage.setItem('sungman_squad', JSON.stringify(squadList));
      renderSquad();
      renderAdminWorkArea();
    });
  }
  ```

- [x] **Step 6: 경기 일정 CRUD 기능 구현**
  매치 데이터를 동적 동기화하고 추가, 수정, 삭제 폼을 처리하는 `renderAdminMatches(container)`를 작성합니다.
  ```javascript
  function renderAdminMatches(container) {
    container.innerHTML = `
      <div class="admin-section-header">
        <h3>경기 일정 및 결과 관리</h3>
        <button class="btn btn-gold btn-sm" id="btnAdminAddMatch">경기 등록</button>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>날짜/시간</th>
              <th>상대 팀</th>
              <th>구분</th>
              <th>상태/스코어</th>
              <th style="width:120px;">작업</th>
            </tr>
          </thead>
          <tbody>
            ${matchList.map(m => {
              let statusText = m.time;
              if (m.status === 'finished') {
                statusText = `종료 (${m.score.home} - ${m.score.away})`;
              }
              return `
                <tr>
                  <td>${escapeHTML(m.date)} ${escapeHTML(m.time)}</td>
                  <td>${escapeHTML(m.opponent)}</td>
                  <td>${m.type === 'Home' ? '홈' : '원정'}</td>
                  <td>${statusText}</td>
                  <td>
                    <div class="admin-actions">
                      <button class="btn btn-gold btn-sm btn-edit-match" data-id="${m.id}">수정</button>
                      <button class="btn btn-sm btn-delete-match" style="background:#ff4a4a;" data-id="${m.id}">삭제</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div id="adminMatchFormContainer"></div>
    `;

    document.getElementById('btnAdminAddMatch').addEventListener('click', () => {
      showMatchForm();
    });

    container.querySelectorAll('.btn-edit-match').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        showMatchForm(id);
      });
    });

    container.querySelectorAll('.btn-delete-match').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        if (confirm('정말로 이 경기 일정을 삭제하시겠습니까?')) {
          matchList = matchList.filter(m => m.id !== id);
          localStorage.setItem('sungman_matches', JSON.stringify(matchList));
          bindNextMatchWidget(); // 공개 위젯 갱신
          bindMatchCenter(); // 공개 일정 리스트 갱신
          renderAdminMatches(container);
        }
      });
    });
  }

  function showMatchForm(id = null) {
    const formContainer = document.getElementById('adminMatchFormContainer');
    if (!formContainer) return;

    const match = id ? matchList.find(m => m.id === id) : null;

    formContainer.innerHTML = `
      <div class="card" style="margin-top:20px; border:1px solid var(--color-glass-border); padding:20px;">
        <h4>${id ? '경기 일정 수정' : '새 경기 등록'}</h4>
        <form id="adminMatchForm">
          <div class="admin-form-group">
            <label for="matchFormOpponent">상대 팀</label>
            <input type="text" id="matchFormOpponent" required value="${match ? escapeHTML(match.opponent) : ''}">
          </div>
          <div class="admin-form-group">
            <label for="matchFormDate">경기 날짜</label>
            <input type="text" id="matchFormDate" required placeholder="YYYY-MM-DD" value="${match ? escapeHTML(match.date) : ''}">
          </div>
          <div class="admin-form-group">
            <label for="matchFormTime">경기 시간</label>
            <input type="text" id="matchFormTime" required placeholder="HH:MM" value="${match ? escapeHTML(match.time) : ''}">
          </div>
          <div class="admin-form-group">
            <label for="matchFormVenue">경기 장소</label>
            <input type="text" id="matchFormVenue" required value="${match ? escapeHTML(match.venue) : '성만 아레나'}">
          </div>
          <div class="admin-form-group">
            <label for="matchFormType">홈/원정 구분</label>
            <select id="matchFormType">
              <option value="Home" ${match && match.type === 'Home' ? 'selected' : ''}>홈 경기 (Home)</option>
              <option value="Away" ${match && match.type === 'Away' ? 'selected' : ''}>원정 경기 (Away)</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label for="matchFormStatus">경기 상태</label>
            <select id="matchFormStatus">
              <option value="upcoming" ${match && match.status === 'upcoming' ? 'selected' : ''}>경기 예정 (upcoming)</option>
              <option value="finished" ${match && match.status === 'finished' ? 'selected' : ''}>경기 종료 (finished)</option>
            </select>
          </div>
          <div id="matchFormScoreFields" style="display:${match && match.status === 'finished' ? 'grid' : 'none'}; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
            <div class="admin-form-group">
              <label for="matchFormScoreHome">성만 FC 득점</label>
              <input type="number" id="matchFormScoreHome" value="${match && match.score ? match.score.home : 0}">
            </div>
            <div class="admin-form-group">
              <label for="matchFormScoreAway">상대 팀 득점</label>
              <input type="number" id="matchFormScoreAway" value="${match && match.score ? match.score.away : 0}">
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-sm" id="btnCancelMatchForm">취소</button>
            <button type="submit" class="btn btn-gold btn-sm">저장</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('matchFormStatus').addEventListener('change', (e) => {
      document.getElementById('matchFormScoreFields').style.display = e.target.value === 'finished' ? 'grid' : 'none';
    });

    document.getElementById('btnCancelMatchForm').addEventListener('click', () => {
      formContainer.innerHTML = '';
    });

    document.getElementById('adminMatchForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const opponent = document.getElementById('matchFormOpponent').value;
      const date = document.getElementById('matchFormDate').value;
      const time = document.getElementById('matchFormTime').value;
      const venue = document.getElementById('matchFormVenue').value;
      const type = document.getElementById('matchFormType').value;
      const status = document.getElementById('matchFormStatus').value;

      let score = undefined;
      if (status === 'finished') {
        score = {
          home: parseInt(document.getElementById('matchFormScoreHome').value, 10) || 0,
          away: parseInt(document.getElementById('matchFormScoreAway').value, 10) || 0
        };
      }

      if (id) {
        const target = matchList.find(m => m.id === id);
        if (target) {
          target.opponent = opponent;
          target.date = date;
          target.time = time;
          target.venue = venue;
          target.type = type;
          target.status = status;
          target.score = score;
        }
      } else {
        const nextId = matchList.length > 0 ? Math.max(...matchList.map(m => m.id)) + 1 : 1;
        matchList.push({ id: nextId, opponent, date, time, venue, type, status, score });
      }

      localStorage.setItem('sungman_matches', JSON.stringify(matchList));
      bindNextMatchWidget();
      bindMatchCenter();
      renderAdminWorkArea();
    });
  }
  ```

- [x] **Step 7: DOM 로드 및 초기 이벤트 릴레이션 처리**
  `js/app.js`에서 세션체크 및 관리자 로그인/로그아웃 폼 바인딩을 `DOMContentLoaded` 꼬리에 연결합니다.
  ```javascript
  // DOMContentLoaded 마지막 영역에 추가
  bindAdminFeatures();
  ```

---

### Task 5: Test updates & Verification

**Files:**
- Modify: `tests/run_tests.js`

- [x] **Step 1: tests/run_tests.js 테스트 파일 라우터 체크 통과 수정**
  로컬 스토리지에 데이터를 초기화하고 검증하는 코드가 `tests/run_tests.js` 상단에 문제없도록 결합하고, Router Syntax Verification 에 `renderAdminLogin` 존재 여부를 Assert 에 추가합니다.
  ```javascript
  // tests/run_tests.js 수정 사항
  function runRouterTests() {
    const fs = require('fs');
    const path = require('path');
    const appJsPath = path.join(__dirname, '../js/app.js');
    const appJsCode = fs.readFileSync(appJsPath, 'utf8');
    assert.ok(appJsCode.includes('switchTab'), 'app.js should contain switchTab logic');
    assert.ok(appJsCode.includes('window.location.hash'), 'app.js should use window.location.hash');
    assert.ok(appJsCode.includes('renderNewsPage'), 'app.js should contain renderNewsPage');
    assert.ok(appJsCode.includes('renderAdminLogin'), 'app.js should contain renderAdminLogin');
  }
  ```

- [x] **Step 2: 테스트 슈트 실행 및 전체 통과 검증**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [x] **Step 3: Git 변경사항 커밋**
  Run:
  ```bash
  git add index.html css/components.css js/app.js js/community.js tests/run_tests.js
  git commit -m "feat: implement client-side admin page with localstorage CRUD for news, squad, and matches"
  ```
