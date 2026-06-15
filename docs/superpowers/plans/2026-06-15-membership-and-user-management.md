# 회원 가입 및 관리자 회원 관리 연동 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 성만 FC 홈페이지에 통합 로그인/회원가입 기능과 로컬 스토리지 연동 회원 데이터베이스를 신설하고, 관리자 페이지에 회원 관리(조회, 등급 수정, 탈퇴) 기능을 구현합니다.

**Architecture:**
- `localStorage`를 활용하여 `userData` 키에 전체 회원 데이터를 보관하며, 최초 로드 시 관리자 및 테스트용 일반 회원 계정을 초기 설정합니다.
- `sessionStorage`의 `currentUser` 키를 통해 실시간 로그인 세션을 추적하며, 역할(Role)에 따른 라우팅 접근 차단(Router Guard)을 구축합니다.
- 팬존(커뮤니티) 글/댓글 작성을 로그인된 사용자 전용으로 제한하고, 글 작성자 정보를 회원 계정과 동적 바인딩 처리합니다.

**Tech Stack:** HTML5, Vanilla CSS, Vanilla JavaScript

---

### Task 1: UI HTML Markup for Login & Signup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 로그인 및 회원가입 화면 HTML 구조 추가**
  `index.html` 내의 `#admin-dashboard` 아래에 새로운 `#login` 및 `#signup` 탭 섹션을 추가합니다.
  ```html
  <!-- index.html 수정 (라인 238-239 부근, #admin-dashboard 아래에 추가) -->
  <!-- Login Tab -->
  <section id="login" class="tab-section" aria-labelledby="login-heading">
    <div class="container admin-login-container">
      <div class="card admin-login-card">
        <h2 id="login-heading">MEMBER LOGIN</h2>
        <form id="memberLoginForm">
          <div class="admin-form-group">
            <label for="loginEmail">이메일 주소</label>
            <input type="email" id="loginEmail" required placeholder="example@sungmanfc.com">
          </div>
          <div class="admin-form-group">
            <label for="loginPassword">비밀번호</label>
            <input type="password" id="loginPassword" required placeholder="비밀번호를 입력하세요">
          </div>
          <div class="admin-error-msg" id="loginErrorMsg" aria-live="assertive"></div>
          <button type="submit" class="btn btn-gold w-100">로그인</button>
          <div style="text-align: center; margin-top: 15px; font-size: 13px;">
            <span style="color: var(--color-text-muted);">아직 회원이 아니신가요? </span>
            <a href="#signup" style="color: var(--color-gold-solid); text-decoration: none; font-weight: 500;">회원가입</a>
          </div>
        </form>
      </div>
    </div>
  </section>

  <!-- Signup Tab -->
  <section id="signup" class="tab-section" aria-labelledby="signup-heading">
    <div class="container admin-login-container" style="padding: 40px 0;">
      <div class="card admin-login-card">
        <h2 id="signup-heading">MEMBER SIGNUP</h2>
        <form id="memberSignupForm">
          <div class="admin-form-group">
            <label for="signupEmail">이메일 주소</label>
            <input type="email" id="signupEmail" required placeholder="example@sungmanfc.com">
          </div>
          <div class="admin-form-group">
            <label for="signupNickname">닉네임</label>
            <input type="text" id="signupNickname" required placeholder="게시판에 노출될 이름">
          </div>
          <div class="admin-form-group">
            <label for="signupPassword">비밀번호</label>
            <input type="password" id="signupPassword" required placeholder="비밀번호를 입력하세요">
          </div>
          <div class="admin-form-group">
            <label for="signupPasswordConfirm">비밀번호 확인</label>
            <input type="password" id="signupPasswordConfirm" required placeholder="비밀번호를 한 번 더 입력하세요">
          </div>
          <div class="admin-error-msg" id="signupErrorMsg" aria-live="assertive"></div>
          <button type="submit" class="btn btn-gold w-100">회원가입</button>
          <div style="text-align: center; margin-top: 15px; font-size: 13px;">
            <span style="color: var(--color-text-muted);">이미 회원이신가요? </span>
            <a href="#login" style="color: var(--color-gold-solid); text-decoration: none; font-weight: 500;">로그인</a>
          </div>
        </form>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 2: 기존 admin-login 섹션 및 푸터 Admin 링크 제거/변경**
  `index.html`에서 기존 `#admin-login` 섹션을 완전히 제거하고, 푸터에 있는 `Admin` 링크를 `#login` 해시로 통합 변경합니다.
  * 기존 `#admin-login` `<section>` 전체 삭제.
  * 푸터 링크 수정:
    ```html
    <!-- index.html 푸터 수정 -->
    <footer>
      <div class="container">
        <p>&copy; 2026 SUNGMAN FC. All Rights Reserved. | <a href="#login" class="admin-link" aria-label="로그인 페이지로 이동">Admin</a></p>
      </div>
    </footer>
    ```

- [ ] **Step 3: Git 커밋**
  ```bash
  git add index.html
  git commit -m "feat: add login and signup tab sections to HTML markup"
  ```

---

### Task 2: Styles for Login, Signup and Member Management Tab

**Files:**
- Modify: `css/components.css`

- [ ] **Step 1: 회원가입 폼 및 회원관리 탭 반응형 스타일 추가**
  `css/components.css` 파일 하단에 회원가입 특화 입력 폼 간격 및 회원 관리 테이블 배치를 위한 스타일을 기입합니다.
  ```css
  /* css/components.css 추가 내용 */
  .admin-form-group input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  .member-role-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .member-role-badge.admin {
    background: rgba(212, 175, 55, 0.2);
    color: var(--color-gold-solid);
    border: 1px solid rgba(212, 175, 55, 0.4);
  }
  
  .member-role-badge.user {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text-muted);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  ```

- [ ] **Step 2: Git 커밋**
  ```bash
  git add css/components.css
  git commit -m "style: add custom badge and placeholder styles for auth"
  ```

---

### Task 3: LocalStorage Database Initialization

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 회원 데이터 저장소 선언 및 초기화 로직 구현**
  `js/app.js` 파일에 `usersList` 전역 상태 배열을 추가하고, `initLocalStorageData` 함수 내에 회원 계정 데이터베이스(`userData`)를 초기 설정하는 코드를 이식합니다.
  * 기존 변수 선언부에 추가:
    ```javascript
    let usersList = [];
    ```
  * `initLocalStorageData()` 함수 하단에 이메일 기반 회원 초기화 추가:
    ```javascript
    // js/app.js: initLocalStorageData() 내부에 추가
    if (!localStorage.getItem('userData')) {
      const initialUsers = [
        {
          id: 1,
          email: "admin@sungmanfc.com",
          password: "admin1234",
          nickname: "관리자",
          role: "admin",
          createdAt: "2026-06-15"
        },
        {
          id: 2,
          email: "user@sungmanfc.com",
          password: "user1234",
          nickname: "성만팬",
          role: "user",
          createdAt: "2026-06-15"
        }
      ];
      localStorage.setItem('userData', JSON.stringify(initialUsers));
    }
    usersList = JSON.parse(localStorage.getItem('userData')) || [];
    ```

- [ ] **Step 2: Git 커밋**
  ```bash
  git add js/app.js
  git commit -m "feat: initialize userData in localStorage on startup"
  ```

---

### Task 4: Dynamic Navigation Header and Auth Guards

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 기존 로그인 세션 전역 변수를 sessionStorage에서 로드하는 방식으로 통합**
  `js/app.js` 상단 전역 변수에서 `isAdminLoggedIn` 대신 `currentUser` 세션 객체를 파싱하도록 수정합니다.
  ```javascript
  // 기존: let isAdminLoggedIn = false;
  // 변경:
  let currentUser = null;
  ```
  * `DOMContentLoaded` 리스너 상단 변경:
    ```javascript
    // DOMContentLoaded 수정
    document.addEventListener('DOMContentLoaded', () => {
      initLocalStorageData();
      try {
        currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
      } catch (e) {
        currentUser = null;
      }
      bindAdminFeatures();
      bindAuthFeatures(); // 새롭게 추가할 일반 회원 인증 바인딩
      initRouter();
      bindNextMatchWidget();
      bindNewsWidget();
      initSquadFeatures();
      bindMatchCenter();
      if (typeof initCommunity === 'function') {
        initCommunity();
      }
    });
    ```

- [ ] **Step 2: switchTab 함수에 인증/인가 라우터 가드(Router Guard) 로직 구현**
  * 로그인 여부와 역할(`admin`/`user`)에 따라 탭 이동 경로를 리다이렉트합니다.
  ```javascript
  // js/app.js: switchTab(tabId) 수정
  function switchTab(tabId) {
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isLoggedIn = currentUser !== null;

    if (tabId === 'admin-dashboard') {
      if (!isAdmin) {
        alert('관리자 권한이 없습니다.');
        window.location.hash = 'home';
        return;
      }
    }
    if (tabId === 'login' || tabId === 'signup') {
      if (isLoggedIn) {
        window.location.hash = 'home';
        return;
      }
    }
    
    // ... [기존 섹션 active 클래스 적용 및 스크롤 복구 로직] ...
    
    // 추가 호출
    if (tabId === 'login') {
      renderLoginTab();
    }
    if (tabId === 'signup') {
      renderSignupTab();
    }
    if (tabId === 'admin-dashboard') {
      renderAdminDashboard();
    }
  }
  ```

- [ ] **Step 3: 네비게이션 메뉴 동적 업데이트 함수 `updateNavbar()` 추가 및 적용**
  `updateNavbar()`를 호출하여 로그인 상태에 따라 헤더 및 모바일 메뉴의 로그인/로그아웃 버튼을 갱신합니다.
  ```javascript
  // js/app.js 에 추가
  function updateNavbar() {
    const isLoggedIn = currentUser !== null;
    const isAdmin = isLoggedIn && currentUser.role === 'admin';

    // 1. 데스크톱 네비게이션 갱신
    const navUl = document.querySelector('nav ul');
    if (navUl) {
      // 기존 로그인/로그아웃 관련 항목 제거 후 재생성
      const loginItems = navUl.querySelectorAll('.dynamic-auth-item');
      loginItems.forEach(el => el.remove());

      if (isLoggedIn) {
        // 관리자 대시보드 링크 추가
        if (isAdmin) {
          const dashboardLi = document.createElement('li');
          dashboardLi.className = 'dynamic-auth-item';
          dashboardLi.innerHTML = `<a href="#admin-dashboard" class="nav-link" data-tab="admin-dashboard">Admin</a>`;
          navUl.appendChild(dashboardLi);
        }
        
        // 로그아웃 링크 추가
        const logoutLi = document.createElement('li');
        logoutLi.className = 'dynamic-auth-item';
        logoutLi.innerHTML = `<a href="#logout" class="nav-link" id="navBtnLogout">로그아웃 (${escapeHTML(currentUser.nickname)}님)</a>`;
        navUl.appendChild(logoutLi);
      } else {
        const loginLi = document.createElement('li');
        loginLi.className = 'dynamic-auth-item';
        loginLi.innerHTML = `<a href="#login" class="nav-link" data-tab="login">로그인</a>`;
        navUl.appendChild(loginLi);
      }
    }

    // 2. 모바일 네비게이션 바 갱신
    const mobileNavBar = document.querySelector('.mobile-nav-bar');
    if (mobileNavBar) {
      const mobileAuthEl = mobileNavBar.querySelector('.dynamic-mobile-auth');
      if (mobileAuthEl) mobileAuthEl.remove();

      const newMobileAuth = document.createElement('a');
      newMobileAuth.className = 'mobile-nav-link dynamic-mobile-auth';
      
      if (isLoggedIn) {
        newMobileAuth.href = '#logout';
        newMobileAuth.id = 'mobileBtnLogout';
        newMobileAuth.innerHTML = `
          <div class="mobile-nav-icon">🔓</div>
          <span>로그아웃</span>
        `;
      } else {
        newMobileAuth.href = '#login';
        newMobileAuth.setAttribute('data-tab', 'login');
        newMobileAuth.innerHTML = `
          <div class="mobile-nav-icon">🔑</div>
          <span>로그인</span>
        `;
      }
      mobileNavBar.appendChild(newMobileAuth);
    }
    
    // 이벤트 바인딩 호출
    bindAuthNavEvents();
  }

  function bindAuthNavEvents() {
    // 로그아웃 버튼 이벤트 처리
    const handleLogout = (e) => {
      e.preventDefault();
      currentUser = null;
      sessionStorage.removeItem('currentUser');
      updateNavbar();
      alert('로그아웃 되었습니다.');
      window.location.hash = 'home';
    };

    const logoutBtn = document.getElementById('navBtnLogout');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const mobileLogoutBtn = document.getElementById('mobileBtnLogout');
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

    // 새로 바인딩된 링크들 이벤트 라우터와 연동
    const newLinks = document.querySelectorAll('.dynamic-auth-item a[data-tab], .dynamic-mobile-auth[data-tab]');
    newLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const tabId = this.getAttribute('data-tab');
        window.location.hash = tabId;
      });
    });
  }
  ```
  * `DOMContentLoaded` 리스너 안에 `updateNavbar();` 호출을 삽입합니다.

- [ ] **Step 4: Git 커밋**
  ```bash
  git add js/app.js
  git commit -m "feat: implement auth router guards and dynamic navigation header"
  ```

---

### Task 5: User Registration & Login Client-side Logic

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 로그인 및 회원가입 화면 렌더링 함수 구현**
  * `renderLoginTab()`, `renderSignupTab()` 함수 작성.
  ```javascript
  // js/app.js 에 추가
  function renderLoginTab() {
    const errorEl = document.getElementById('loginErrorMsg');
    if (errorEl) errorEl.textContent = '';
    const emailInput = document.getElementById('loginEmail');
    const pwInput = document.getElementById('loginPassword');
    if (emailInput) emailInput.value = '';
    if (pwInput) pwInput.value = '';
  }

  function renderSignupTab() {
    const errorEl = document.getElementById('signupErrorMsg');
    if (errorEl) errorEl.textContent = '';
    const emailInput = document.getElementById('signupEmail');
    const nickInput = document.getElementById('signupNickname');
    const pwInput = document.getElementById('signupPassword');
    const pwConfirmInput = document.getElementById('signupPasswordConfirm');
    if (emailInput) emailInput.value = '';
    if (nickInput) nickInput.value = '';
    if (pwInput) pwInput.value = '';
    if (pwConfirmInput) pwConfirmInput.value = '';
  }
  ```

- [ ] **Step 2: 회원가입 및 로그인 폼 이벤트 바인딩**
  * 이메일 중복 체크, 비밀번호 매칭, 정규식 이메일 유효성을 검증하는 회원가입 폼 제출 이벤트 바인딩.
  * 일치 계정 조회 후 세션 스토리지 `currentUser` 적재 및 네비게이션 헤더 변경을 처리하는 로그인 폼 제출 이벤트 바인딩.
  ```javascript
  // js/app.js 에 추가
  function bindAuthFeatures() {
    // 1. 로그인 핸들러
    const loginForm = document.getElementById('memberLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginErrorMsg');

        const user = usersList.find(u => u.email === email && u.password === password);
        if (user) {
          currentUser = {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            role: user.role,
            createdAt: user.createdAt
          };
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
          updateNavbar();
          
          if (errorEl) errorEl.textContent = '';
          alert(`${user.nickname}님, 환영합니다!`);
          
          if (user.role === 'admin') {
            window.location.hash = 'admin-dashboard';
          } else {
            window.location.hash = 'home';
          }
        } else {
          if (errorEl) errorEl.textContent = '이메일 주소 또는 비밀번호가 올바르지 않습니다.';
        }
      });
    }

    // 2. 회원가입 핸들러
    const signupForm = document.getElementById('memberSignupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value.trim();
        const nickname = document.getElementById('signupNickname').value.trim();
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        const errorEl = document.getElementById('signupErrorMsg');

        // 이메일 유효성 정규식 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          if (errorEl) errorEl.textContent = '올바른 이메일 형식이 아닙니다.';
          return;
        }

        if (password.length < 4) {
          if (errorEl) errorEl.textContent = '비밀번호는 최소 4자 이상이어야 합니다.';
          return;
        }

        if (password !== passwordConfirm) {
          if (errorEl) errorEl.textContent = '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
          return;
        }

        // 중복 가입 체크
        const emailExists = usersList.some(u => u.email === email);
        if (emailExists) {
          if (errorEl) errorEl.textContent = '이미 사용 중인 이메일 주소입니다.';
          return;
        }

        const nickExists = usersList.some(u => u.nickname === nickname);
        if (nickExists) {
          if (errorEl) errorEl.textContent = '이미 사용 중인 닉네임입니다.';
          return;
        }

        // 새 회원 생성 및 로컬스토리지 동기화
        const nextId = usersList.length > 0 ? Math.max(...usersList.map(u => u.id)) + 1 : 1;
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        usersList.push({
          id: nextId,
          email,
          password,
          nickname,
          role: 'user',
          createdAt: dateStr
        });
        localStorage.setItem('userData', JSON.stringify(usersList));

        if (errorEl) errorEl.textContent = '';
        alert('회원가입이 정상 완료되었습니다. 로그인해 주세요!');
        window.location.hash = 'login';
      });
    }
  }
  ```
  * 기존 `bindAdminFeatures()` 내부에 있던 기존 관리자 로그인 이벤트 리스너 관련 로직은 사용하지 않으므로, 충돌 방지를 위해 기존 `bindAdminFeatures()` 내부의 로그인/로그아웃 부분은 제거하고 일반 메뉴 탭 바인딩만 남겨둡니다.

- [ ] **Step 3: Git 커밋**
  ```bash
  git add js/app.js
  git commit -m "feat: implement client-side signup and login forms logic"
  ```

---

### Task 6: Fan Zone Authorization Integration

**Files:**
- Modify: `js/app.js`
- Modify: `js/community.js`

- [ ] **Step 1: js/community.js 내의 CommunityManager 로직 세션 기반으로 연동 수정**
  게시글 및 댓글 삭제 권한을 `authorEmail` 또는 `admin` 권한 체크로 변경하고, 글/댓글 쓰기 함수가 회원 정보를 바인딩하도록 고쳐 씁니다.
  * `createPost` 매개변수를 비밀번호 기반에서 사용자 객체 기반으로 개편합니다.
  ```javascript
  // js/community.js: createPost, addComment 변경
  createPost(title, content, user) {
    const posts = this.loadPosts();
    const nextId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newPost = {
      id: nextId,
      title,
      content,
      author: user.nickname,
      authorEmail: user.email,
      createdAt: dateStr,
      likes: 0,
      comments: []
    };
    
    posts.unshift(newPost);
    this.savePosts(posts);
    return newPost;
  }

  addComment(postId, content, user) {
    const posts = this.loadPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return null;
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const comments = posts[postIndex].comments;
    const nextId = comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1;
    
    const comment = {
      id: nextId,
      author: user.nickname,
      authorEmail: user.email,
      content,
      createdAt: dateStr
    };
    
    posts[postIndex].comments.push(comment);
    this.savePosts(posts);
    return comment;
  }
  ```
  * `deletePost`, `deleteComment`를 관리자(Admin) 권한이나 이메일 일치 검사로 제어하도록 변경:
  ```javascript
  deletePost(postId, user) {
    const posts = this.loadPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return false;
    
    const post = posts[postIndex];
    // 기존 글 하위호환성 유지 (authorEmail이 없을 때 기존 비밀번호 비교 - 테스트용)
    if (!post.authorEmail) {
      if (user.role === 'admin' || user.password === '1234') {
        posts.splice(postIndex, 1);
        this.savePosts(posts);
        return true;
      }
      return false;
    }
    
    // 일반 계정 작성자 검증 혹은 어드민 검증
    if (user.role === 'admin' || post.authorEmail === user.email) {
      posts.splice(postIndex, 1);
      this.savePosts(posts);
      return true;
    }
    return false;
  }

  deleteComment(postId, commentId, user) {
    const posts = this.loadPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return false;
    
    const comments = posts[postIndex].comments;
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;
    
    const comment = comments[commentIndex];
    if (!comment.authorEmail) {
      if (user.role === 'admin' || user.password === '1234') {
        comments.splice(commentIndex, 1);
        this.savePosts(posts);
        return true;
      }
      return false;
    }
    
    if (user.role === 'admin' || comment.authorEmail === user.email) {
      comments.splice(commentIndex, 1);
      this.savePosts(posts);
      return true;
    }
    return false;
  }
  ```

- [ ] **Step 2: js/app.js 커뮤니티(Fan Zone) 비회원 접근 및 비밀번호 폼 제거 갱신**
  * `renderCommunity()` 함수 안에서 글쓰기 폼 렌더링 시 현재 비밀번호 입력 필드를 완전히 제거하고, 글 작성 이벤트 동작 방식을 개정합니다.
  * "글쓰기" 버튼 클릭 핸들러 수정:
    ```javascript
    // js/app.js: renderCommunity() 바인딩 수정 부분
    const btnOpenWrite = document.getElementById('btnOpenWrite');
    if (btnOpenWrite) {
      btnOpenWrite.addEventListener('click', () => {
        if (!currentUser) {
          alert('로그인이 필요한 서비스입니다.');
          window.location.hash = 'login';
          return;
        }
        showWriteForm();
      });
    }
    ```
  * `showWriteForm()` 에서 작성자명과 비밀번호 인풋 필드를 제거하고 본인 닉네임만 표시하게 변경:
    ```javascript
    // js/app.js: showWriteForm() 수정
    function showWriteForm() {
      const detailCol = document.getElementById('boardDetailColumn');
      if (!detailCol || !currentUser) return;

      detailCol.innerHTML = `
        <div class="card board-form-card">
          <h4>새 글 작성</h4>
          <form id="boardWriteForm" style="display: flex; flex-direction: column; gap: 15px;">
            <div class="admin-form-group">
              <label>작성자</label>
              <input type="text" value="${escapeHTML(currentUser.nickname)} (${escapeHTML(currentUser.email)})" disabled style="background: rgba(255,255,255,0.05); color: var(--color-text-muted);">
            </div>
            <div class="admin-form-group">
              <label for="postFormTitle">제목</label>
              <input type="text" id="postFormTitle" required placeholder="제목을 입력하세요">
            </div>
            <div class="admin-form-group">
              <label for="postFormContent">내용</label>
              <textarea id="postFormContent" required rows="10" placeholder="내용을 입력하세요" style="width: 100%; min-height: 150px; background: rgba(0,0,0,0.2); border: 1px solid var(--color-glass-border); border-radius: 6px; padding: 10px; color: var(--color-text-primary); font-family: inherit; resize: vertical;"></textarea>
            </div>
            <div style="display: flex; gap: 10px;">
              <button type="submit" class="btn btn-gold" style="flex: 1;">등록</button>
              <button type="button" class="btn btn-outline" id="btnCancelWrite" style="flex: 1;">취소</button>
            </div>
          </form>
        </div>
      `;
      // ... [취소 및 폼 제출 바인딩 - 제출 시 communityManager.createPost(title, content, currentUser) 호출] ...
    }
    ```
  * `showPostDetail()` 에서 댓글 등록 폼의 비밀번호 삭제 및 삭제 버튼 활성화 로직 업데이트:
    ```javascript
    // js/app.js: showPostDetail() 내부의 댓글 폼 렌더링 수정
    // 비로그인 시 댓글 등록 폼 비활성화 또는 클릭 시 로그인 유도
    // 각 게시글 및 댓글 삭제 버튼 노출 여부 체크:
    const isPostAuthor = currentUser && (currentUser.email === post.authorEmail);
    const isAdmin = currentUser && (currentUser.role === 'admin');
    
    // 포스트 삭제 버튼 렌더링 (isPostAuthor || isAdmin 인 경우에만 노출)
    // 댓글 삭제 버튼 렌더링 (currentUser && (c.authorEmail === currentUser.email || currentUser.role === 'admin') 인 경우에만 노출)
    ```

- [ ] **Step 3: Git 커밋**
  ```bash
  git add js/app.js js/community.js
  git commit -m "feat: restrict fan zone actions to logged-in users and map author metadata"
  ```

---

### Task 7: Admin Member Management Dashboard Tab

**Files:**
- Modify: `index.html`
- Modify: `js/app.js`

- [ ] **Step 1: index.html 관리자 네비게이션 칼럼에 회원관리 버튼 추가**
  ```html
  <!-- index.html 관리자 사이드바 탭 리스트 수정 -->
  <ul role="tablist" aria-label="관리자 작업 메뉴">
    <li role="presentation"><button class="admin-nav-btn active" id="admin-tab-news" role="tab" aria-selected="true" aria-controls="adminWorkContent" data-admin-tab="news">뉴스 관리</button></li>
    <li role="presentation"><button class="admin-nav-btn" id="admin-tab-squad" role="tab" aria-selected="false" aria-controls="adminWorkContent" data-admin-tab="squad">선수단 관리</button></li>
    <li role="presentation"><button class="admin-nav-btn" id="admin-tab-matches" role="tab" aria-selected="false" aria-controls="adminWorkContent" data-admin-tab="matches">경기 관리</button></li>
    <li role="presentation"><button class="admin-nav-btn" id="admin-tab-members" role="tab" aria-selected="false" aria-controls="adminWorkContent" data-admin-tab="members">회원 관리</button></li>
  </ul>
  ```

- [ ] **Step 2: js/app.js 에 회원관리 목록 렌더링 및 기능 바인딩 구현**
  * `renderAdminMembers()`, `renderAdminWorkArea()`, `bindAdminFeatures()`를 회원 탭 분기에 매핑합니다.
  ```javascript
  // js/app.js: renderAdminWorkArea() 탭 조건 추가
  if (activeAdminTab === 'members') {
    renderAdminMembers();
  }
  ```
  * `renderAdminMembers()` 함수 작성:
  ```javascript
  function renderAdminMembers() {
    const container = document.getElementById('adminWorkContent');
    if (!container) return;

    let html = `
      <div class="admin-section-header">
        <h3>회원 관리</h3>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 120px;">가입일자</th>
              <th>이메일 주소</th>
              <th>닉네임</th>
              <th style="width: 100px; text-align: center;">등급</th>
              <th style="width: 200px; text-align: center;">관리 작업</th>
            </tr>
          </thead>
          <tbody>
    `;

    usersList.forEach(user => {
      const isSelf = currentUser && currentUser.email === user.email;
      const roleText = user.role === 'admin' ? '<span class="member-role-badge admin">ADMIN</span>' : '<span class="member-role-badge user">USER</span>';
      const toggleBtnText = user.role === 'admin' ? '일반회원으로 강등' : '관리자로 격상';

      html += `
        <tr>
          <td>${escapeHTML(user.createdAt)}</td>
          <td style="text-align: left;">${escapeHTML(user.email)} ${isSelf ? '<span style="font-size:11px;color:var(--color-gold-solid)">(본인)</span>' : ''}</td>
          <td style="text-align: left;">${escapeHTML(user.nickname)}</td>
          <td style="text-align: center;">${roleText}</td>
          <td style="text-align: center;">
            <div class="admin-actions" style="justify-content: center;">
              <button class="btn btn-outline btn-sm btn-toggle-role" data-id="${user.id}" ${isSelf ? 'disabled' : ''}>${toggleBtnText}</button>
              <button class="btn btn-outline btn-sm btn-delete-member" data-id="${user.id}" ${isSelf ? 'disabled' : ''} style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3);">강퇴</button>
            </div>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

    // 1. 권한 변경 토글 핸들러 바인딩
    container.querySelectorAll('.btn-toggle-role').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const targetUser = usersList.find(u => u.id === id);
        if (targetUser) {
          const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
          if (confirm(`회원 ${targetUser.nickname}님의 권한을 ${newRole === 'admin' ? '관리자' : '일반회원'}로 변경하시겠습니까?`)) {
            targetUser.role = newRole;
            localStorage.setItem('userData', JSON.stringify(usersList));
            renderAdminMembers();
          }
        }
      });
    });

    // 2. 강퇴(삭제) 핸들러 바인딩
    container.querySelectorAll('.btn-delete-member').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        const targetUser = usersList.find(u => u.id === id);
        if (targetUser) {
          if (confirm(`회원 ${targetUser.nickname}님을 정말 강제 탈퇴시키겠습니까?`)) {
            usersList = usersList.filter(u => u.id !== id);
            localStorage.setItem('userData', JSON.stringify(usersList));
            renderAdminMembers();
          }
        }
      });
    });
  }
  ```

- [ ] **Step 3: Git 커밋**
  ```bash
  git add index.html js/app.js
  git commit -m "feat: implement user list rendering and control in admin dashboard"
  ```

---

### Task 8: Tests Updates and Validation

**Files:**
- Modify: `tests/run_tests.js`

- [ ] **Step 1: tests/run_tests.js 테스트 파일 로드 오류 해결 및 라우터 테스트 추가**
  테스트 툴킷 내에서 `renderLoginTab`과 `renderSignupTab` 함수가 존재하고 올바르게 라우팅 동작에 매핑되는지 문자열 어설션 테스트를 삽입하고 수행합니다.
  ```javascript
  // tests/run_tests.js: runRouterTests() 에 추가
  assert.ok(appJsCode.includes('renderLoginTab'), 'app.js should contain renderLoginTab');
  assert.ok(appJsCode.includes('renderSignupTab'), 'app.js should contain renderSignupTab');
  assert.ok(appJsCode.includes('currentUser'), 'app.js should use currentUser session state');
  ```

- [ ] **Step 2: 테스트 슈트 실행 및 전체 통과 검증**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 3: Git 커밋 및 최종 정리**
  ```bash
  git add tests/run_tests.js
  git commit -m "test: verify authentication router configuration in tests"
  ```
