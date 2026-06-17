# 성만 FC 기능 개선 및 추가 시스템 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 성만 FC 공식 웹사이트의 UI 개선, 선수단 배번/썸네일 적용, Carousel 다중 팝업, 경기 일정 달력 및 외부 링크 단추 연동, 팬 예약 신청(에스코트/원정버스) 및 관리 어드민 탭 구현을 순차적으로 수행합니다.

**Architecture:** 
- `index.html`과 `css/components.css`를 수정하여 배너 z-index, 어드민 가로 탭, 선수 카드/테이블 썸네일, Matches 3열 링크 단추, Fanzone 신청 탭 및 모달 마크업을 반영합니다.
- `js/app.js`에서 다중 팝업 Carousel 연동, Matches 달력 입력 및 3열 링크 파싱, Fanzone 신청 현황 관리자 탭을 바인딩합니다.
- `js/community.js`에서 Fanzone의 예약 신청 모달 팝업 제출 핸들러를 연동하고 로컬스토리지(`fanApplicationsData`)에 상태를 기록합니다.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Node.js Test Runner

---

### Task 1: 메인 배너 문구 고정 및 'WE ARE SUNGMAN FC' 수정 (1번)

**Files:**
- Modify: `index.html:34-41` (WE ARE SUNGMAN FC 텍스트 교체)
- Modify: `css/components.css:12-30` (`.hero-content` 및 `.hero-overlay` z-index 적용)
- Test: `tests/run_tests.js` (`runHeroTextLayerTests` 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js` 하단에 `runHeroTextLayerTests()` 함수를 추가하여 메인 배너 텍스트가 `'WE ARE SUNGMAN FC'`로 갱신되었는지 검사하고, 배너 레이아웃 z-index가 올바르게 입혀져 있는지 파일 내용을 검증하는 테스트를 작성합니다.
  ```javascript
  function runHeroTextLayerTests() {
    const fs = require('fs');
    const path = require('path');
    
    const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
    const cssContent = fs.readFileSync(path.join(__dirname, '../css/components.css'), 'utf8');
    
    assert.ok(htmlContent.includes('WE ARE SUNGMAN FC'), 'Main banner text should be SUNGMAN FC');
    assert.ok(cssContent.includes('z-index: 2'), 'hero-content should have z-index: 2');
    assert.ok(cssContent.includes('z-index: 1'), 'hero-overlay should have z-index: 1');
  }
  ```
  그리고 파일 끝에 `runTestBlock('Hero Text & Layer Tests (runHeroTextLayerTests)', runHeroTextLayerTests);`를 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL (WE ARE SUNGMAN FC 불일치)

- [ ] **Step 3: HTML 배너 텍스트 수정**
  `index.html` 38라인의 문구를 수정합니다.
  ```html
  <h2>WE ARE SUNGMAN FC</h2>
  ```

- [ ] **Step 4: CSS z-index 스타일 적용**
  `css/components.css`에서 `.hero-banner`와 `.hero-content h2` 사이의 빈 영역 혹은 하단에 다음 스타일을 수정 또는 추가합니다.
  ```css
  .hero-content {
    position: relative;
    z-index: 2;
  }
  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
  ```

- [ ] **Step 5: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 6: Git 커밋**
  Run: `git commit -am "feat: update main banner text and fix z-index overlay issue"`

---

### Task 2: 관리자 대시보드 메뉴 레이아웃 상단 탭 구조로 전환 (2번)

**Files:**
- Modify: `css/components.css` (`.admin-layout` 구조 및 상단 가로 탭 CSS 개편)
- Test: `tests/run_tests.js` (`runAdminDashboardLayoutTests` 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js`에 `runAdminDashboardLayoutTests()` 함수를 추가하여 `.admin-layout` 스타일 속성이 세로형에서 가로형 상단 탭 구조로 flex 변경되었는지 검사하는 테스트를 작성합니다.
  ```javascript
  function runAdminDashboardLayoutTests() {
    const fs = require('fs');
    const path = require('path');
    const cssContent = fs.readFileSync(path.join(__dirname, '../css/components.css'), 'utf8');
    
    assert.ok(cssContent.includes('flex-direction: column'), 'admin-layout should change to column flex');
    assert.ok(cssContent.includes('display: flex'), 'admin-nav-column should be flex');
  }
  ```
  그리고 `runTestBlock('Admin Dashboard Layout Tests (runAdminDashboardLayoutTests)', runAdminDashboardLayoutTests);`를 하단에 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 3: CSS 관리자 레이아웃 스타일 수정**
  `css/components.css`에서 기존 `.admin-layout` 관련 스타일(917~977 라인 부근)을 찾아 다음과 같이 변경합니다.
  ```css
  .admin-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  .admin-nav-column {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-glass-border);
    border-radius: 12px;
    padding: 15px;
  }
  .admin-nav-column ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  .admin-nav-column li {
    margin-bottom: 0;
  }
  .admin-nav-logout-wrapper {
    border-top: none;
    padding-top: 0;
    margin-top: 0;
    margin-left: auto; /* 로그아웃 버튼을 우측 끝으로 밀어냄 */
  }
  .admin-nav-btn {
    width: auto;
    padding: 8px 16px;
  }
  .admin-work-column {
    width: 100%;
  }
  ```

- [ ] **Step 4: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 5: Git 커밋**
  Run: `git commit -am "style: convert admin dashboard layout to responsive horizontal top-tab structure"`

---

### Task 3: 관리자 선수단 리스트 썸네일(32x32) 추가 (3번)

**Files:**
- Modify: `js/app.js:996-1036` (`renderAdminSquad` 테이블 헤더 및 로우 렌더링 수정)
- Test: `tests/run_tests.js` (`runSquadThumbnailTests` 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js`에 `runSquadThumbnailTests()` 함수를 추가하여 관리자 선수단 목록을 렌더링할 때 `写真` 또는 `이미지` 썸네일 컬럼이 추가되고, `<img` 태그나 포지션 placeholder 가 렌더링되는지 검사하는 테스트를 작성합니다.
  ```javascript
  function runSquadThumbnailTests() {
    const originalDocument = global.document;
    let appendedHTML = '';
    const mockContainer = {
      set innerHTML(val) { appendedHTML = val; },
      get innerHTML() { return appendedHTML; },
      querySelectorAll: () => []
    };
    global.document = {
      getElementById: (id) => {
        if (id === 'adminWorkContent') return mockContainer;
        return { value: '', addEventListener: () => {}, style: {} };
      },
      createElement: () => ({ setAttribute: () => {}, style: {} }),
      querySelectorAll: () => []
    };
    global.squadList = [{ id: 1, name: '이성만', engName: 'LEE Sungman', number: 10, position: 'FW', image: 'data:image/png;base64,...', details: { birth: '1998-05-12' } }];
    try {
      global.renderAdminSquad();
      assert.ok(appendedHTML.includes('<th>사진</th>'), 'Should render photo table header');
      assert.ok(appendedHTML.includes('<img src="data:image/png;base64,...'), 'Should render image tag with player source');
    } finally {
      global.document = originalDocument;
      delete global.squadList;
    }
  }
  ```
  그리고 `runTestBlock('Squad Admin Thumbnail Tests (runSquadThumbnailTests)', runSquadThumbnailTests);`를 하단에 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 3: renderAdminSquad() 수정**
  `js/app.js`에서 `renderAdminSquad()` 함수 내부의 테이블 템플릿 문자열을 수정하여 사진 컬럼을 추가합니다.
  ```javascript
  // 템플릿 헤더
  <thead>
    <tr>
      <th style="width: 70px;">사진</th>
      <th style="width: 80px; text-align: center;">등번호</th>
      <th>이름</th>
      <th style="width: 120px;">포지션</th>
      <th style="width: 150px; text-align: center;">작업</th>
    </tr>
  </thead>
  
  // 데이터 로우 순회
  squadList.forEach(player => {
    const hasImage = player.image && player.image.startsWith('data:image/');
    const thumbnailHtml = hasImage 
      ? `<img src="${escapeHTML(player.image)}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; display: block; border: 1px solid var(--color-glass-border);">`
      : `<div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--color-glass-border); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: var(--color-gold-solid);">${escapeHTML(player.position)}</div>`;

    html += `
      <tr>
        <td>${thumbnailHtml}</td>
        <td style="text-align: center; font-weight: bold; color: var(--color-gold-solid);">No. ${escapeHTML(String(player.number))}</td>
        ...
    `;
  });
  ```

- [ ] **Step 4: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 5: Git 커밋**
  Run: `git commit -am "feat: add 32x32 player profile thumbnail to admin squad list"`

---

### Task 4: 사용자 스쿼드 카드 내 등번호 및 포지션 배지 추가 (4번)

**Files:**
- Modify: `js/app.js:255-270` (`renderSquad` 카드 템플릿 수정)
- Test: `tests/run_tests.js` (`runSquadCardBadgeTests` 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js`에 `runSquadCardBadgeTests()` 함수를 추가하여 사용자 스쿼드 카드 내 등번호 배지(`No. [배번]`)가 정상 렌더링되는지 검증하는 테스트를 작성합니다.
  ```javascript
  function runSquadCardBadgeTests() {
    const originalDocument = global.document;
    let appendedHTML = '';
    const mockContainer = {
      innerHTML: '',
      appendChild: (child) => { appendedHTML += child.innerHTML; }
    };
    global.document = {
      getElementById: (id) => {
        if (id === 'squadGrid') return mockContainer;
        return { value: '', addEventListener: () => {}, style: {} };
      },
      createElement: () => ({ setAttribute: () => {}, style: {}, addEventListener: () => {} }),
      querySelectorAll: () => []
    };
    global.squadList = [{ id: 1, name: '이성만', engName: 'LEE Sungman', number: 10, position: 'FW', image: 'data:image/png;base64,...', details: { birth: '1998-05-12' } }];
    try {
      global.renderSquad('ALL');
      assert.ok(appendedHTML.includes('No. 10'), 'Player card should contain No. 10 badge');
    } finally {
      global.document = originalDocument;
      delete global.squadList;
    }
  }
  ```
  그리고 `runTestBlock('Squad Card Badge Tests (runSquadCardBadgeTests)', runSquadCardBadgeTests);`를 하단에 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 3: renderSquad() 내 카드 생성 코드 수정**
  `js/app.js`에서 `renderSquad()` 내부의 선수 카드 템플릿(255라인 부근)을 수정하여 이름 아래에 배번 배지를 삽입합니다.
  ```javascript
  card.innerHTML = `
    ${player.image 
      ? `<div class="player-img-wrapper"><img src="${escapeHTML(player.image)}" alt="${escapeHTML(player.name)} 선수 프로필" class="player-img" onerror="this.onerror=null; this.outerHTML='<div class=\&quot;player-img-placeholder\&quot;>${escapeHTML(String(player.number))}</div>';"></div>`
      : `<div class="player-img-placeholder">${escapeHTML(String(player.number))}</div>`
    }
    <div class="player-info">
      <div class="player-name">${escapeHTML(player.name)}</div>
      <div style="display: flex; justify-content: center; gap: 6px; font-size: 11px; margin-top: 4px;">
        <span style="background: rgba(212,175,55,0.15); color: var(--color-gold-solid); padding: 1px 6px; border-radius: 4px; font-weight: bold; font-family: var(--font-header);">No. ${escapeHTML(String(player.number))}</span>
        <span style="color: var(--color-text-muted);">${escapeHTML(player.position)}</span>
      </div>
    </div>
  `;
  ```

- [ ] **Step 4: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 5: Git 커밋**
  Run: `git commit -am "feat: add squad card back-number badge and style under name"`

---

### Task 5: 다중 팝업 시스템 Carousel 모달 구축 (5번)

**Files:**
- Modify: `index.html:345-361` (Carousel 모달창 화살표 단추 추가)
- Modify: `js/app.js` (Carousel 상태값 제어, 팝업 리스트 관리 탭 렌더링)
- Test: `tests/run_tests.js` (`runMultiPopupCarouselTests` 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js`에 `runMultiPopupCarouselTests()` 함수를 추가하여 다중 팝업 데이터가 로컬스토리지 배열 형태로 적재 및 조회되고, 팝업창에서 다음 팝업으로의 Carousel 인덱스 순환이 가능한지 검증하는 테스트를 작성합니다.
  ```javascript
  function runMultiPopupCarouselTests() {
    const originalDocument = global.document;
    const originalWindow = global.window;
    
    let appendedHTML = '';
    const mockContainer = {
      set innerHTML(val) { appendedHTML = val; },
      get innerHTML() { return appendedHTML; }
    };
    
    global.document = {
      getElementById: (id) => {
        if (id === 'popupBodyContent' || id === 'mainNoticePopup') return mockContainer;
        return { value: '', addEventListener: () => {}, style: {}, textContent: '' };
      },
      createElement: () => ({ setAttribute: () => {}, style: {}, className: '', appendChild: () => {} }),
      querySelectorAll: () => []
    };
    
    const popupList = [
      { id: 1, active: true, title: '공지 1', type: 'image', mediaUrl: 'img1.png', link: '' },
      { id: 2, active: true, title: '공지 2', type: 'image', mediaUrl: 'img2.png', link: '' }
    ];
    global.localStorage.setItem('mainPopupData', JSON.stringify(popupList));
    
    try {
      global.checkAndShowPopup();
      // 첫 번째 공지 활성화 확인
      assert.ok(appendedHTML.includes('img1.png'), 'Should render first popup image');
    } finally {
      global.document = originalDocument;
      global.window = originalWindow;
      global.localStorage.removeItem('mainPopupData');
    }
  }
  ```
  그리고 `runTestBlock('Multi Popup Carousel Tests (runMultiPopupCarouselTests)', runMultiPopupCarouselTests);`를 하단에 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 3: index.html 팝업 모달 마크업 수정**
  `index.html` 의 `mainNoticePopup` 마크업(345라인 부근)을 화살표 조작 및 인디케이터가 포함된 구조로 수정합니다.
  ```html
  <div id="mainNoticePopup" class="main-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popupTitle">
    <div class="main-popup-container">
      <div class="main-popup-header">
        <h3 id="popupTitle">SUNGMAN FC 공지</h3>
      </div>
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 100%;">
        <!-- 좌우 슬라이드 화살표 -->
        <button type="button" id="btnPrevPopup" class="btn-popup-arrow" style="position: absolute; left: 10px; z-index: 10; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">&lt;</button>
        
        <div class="main-popup-body" id="popupBodyContent" style="width: 100%;">
          <!-- 동적 미디어 삽입 -->
        </div>
        
        <button type="button" id="btnNextPopup" class="btn-popup-arrow" style="position: absolute; right: 10px; z-index: 10; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">&gt;</button>
      </div>
      <!-- 슬라이드 페이지 인디케이터 -->
      <div id="popupIndicators" style="display: flex; justify-content: center; gap: 6px; padding-bottom: 12px;"></div>
      <div class="main-popup-footer">
        <label class="main-popup-checkbox-label">
          <input type="checkbox" id="chkHidePopup24h">
          오늘 하루 이 창 열지 않기
        </label>
        <button type="button" class="btn-popup-close" id="btnCloseNoticePopup">닫기</button>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 4: js/app.js 다중 팝업 Carousel 로직 작성**
  `js/app.js`에서 `checkAndShowPopup()` 및 `initPopupEvents()`를 여러 개 노출 가능하게 수정합니다.
  - 전역 인덱스 추가: `let currentPopupIdx = 0; let activePopups = [];`
  - `checkAndShowPopup()` 수정:
    ```javascript
    function checkAndShowPopup() {
      const activeTab = window.location.hash.substring(1) || 'home';
      if (activeTab !== 'home') return;
      
      const hideUntil = localStorage.getItem('popup_hide_until');
      if (hideUntil && Date.now() < Number(hideUntil)) return;

      let allPopups = [];
      try {
        allPopups = JSON.parse(localStorage.getItem('mainPopupData')) || [];
      } catch (e) {
        allPopups = [];
      }

      activePopups = allPopups.filter(p => p.active);
      if (activePopups.length === 0) return;

      if (currentPopupIdx >= activePopups.length) currentPopupIdx = 0;
      
      renderActivePopupSlide();
    }
    
    function renderActivePopupSlide() {
      const overlay = document.getElementById('mainNoticePopup');
      const title = document.getElementById('popupTitle');
      const body = document.getElementById('popupBodyContent');
      const indicators = document.getElementById('popupIndicators');
      if (!overlay || !body) return;

      const popup = activePopups[currentPopupIdx];
      title.textContent = popup.title || 'SUNGMAN FC 공지';
      body.innerHTML = '';

      const wrapper = document.createElement('div');
      wrapper.className = 'main-popup-media-wrapper';

      if (popup.type === 'image') {
        const img = document.createElement('img');
        img.src = popup.mediaUrl;
        img.className = 'main-popup-img';
        if (popup.link && isValidUrl(popup.link)) {
          const anchor = document.createElement('a');
          anchor.href = popup.link;
          anchor.target = '_blank';
          anchor.appendChild(img);
          wrapper.appendChild(anchor);
        } else {
          wrapper.appendChild(img);
        }
      } else {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'main-popup-video-container';
        const parsedUrl = parseYoutubeEmbedUrl(popup.mediaUrl);
        if (parsedUrl.startsWith('https://www.youtube.com/embed/')) {
          const iframe = document.createElement('iframe');
          iframe.src = parsedUrl;
          iframe.sandbox = 'allow-scripts allow-same-origin allow-presentation';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          videoContainer.appendChild(iframe);
        } else if (isValidUrl(popup.mediaUrl)) {
          const video = document.createElement('video');
          video.src = popup.mediaUrl;
          video.controls = true;
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
          videoContainer.appendChild(video);
        }
        wrapper.appendChild(videoContainer);
      }
      body.appendChild(wrapper);

      // 인디케이터 점 렌더링
      if (indicators) {
        indicators.innerHTML = '';
        if (activePopups.length > 1) {
          activePopups.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.style.width = '6px';
            dot.style.height = '6px';
            dot.style.borderRadius = '50%';
            dot.style.background = idx === currentPopupIdx ? 'var(--color-gold-solid)' : '#444';
            dot.style.display = 'inline-block';
            indicators.appendChild(dot);
          });
        }
      }

      overlay.classList.add('is-visible');
    }
    ```
  - `initPopupEvents()` 에 화살표 이벤트 바인딩 추가:
    ```javascript
    function initPopupEvents() {
      const overlay = document.getElementById('mainNoticePopup');
      const closeBtn = document.getElementById('btnCloseNoticePopup');
      const chk24h = document.getElementById('chkHidePopup24h');
      const prevBtn = document.getElementById('btnPrevPopup');
      const nextBtn = document.getElementById('btnNextPopup');

      if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
          if (chk24h && chk24h.checked) {
            const expiry = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem('popup_hide_until', String(expiry));
          }
          overlay.classList.remove('is-visible');
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (activePopups.length <= 1) return;
          currentPopupIdx = (currentPopupIdx - 1 + activePopups.length) % activePopups.length;
          renderActivePopupSlide();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (activePopups.length <= 1) return;
          currentPopupIdx = (currentPopupIdx + 1) % activePopups.length;
          renderActivePopupSlide();
        });
      }
    }
    ```

- [ ] **Step 5: 관리자 페이지 다중 팝업 목록 관리 탭 구현**
  - `renderAdminPopup()` 개편:
    목록 테이블을 보여주고 팝업 설정(제목, 콘텐츠 경로, 링크, 활성 토글)을 어드민 CRUD로 할 수 있게 구현합니다.
    (자세한 폼 제출 리스너 및 팝업 리스트 렌더링 마크업은 기존의 `renderAdminNews` 테이블 구조와 슬라이더 CRUD 폼 구조를 융합하여 구현)

- [ ] **Step 6: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 7: Git 커밋**
  Run: `git commit -am "feat: implement multi-popup carousel model and admin popup dashboard CRUD manager"`

---

### Task 6: 경기 관리 일정 달력(Date picker) 입력으로 전환 (6번)

**Files:**
- Modify: `js/app.js:1430-1500` (경기 일정 폼 `matchFormDate` input type="date" 변경 및 파싱)
- Test: `tests/run_tests.js` (`runMatchCalendarTests` 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js`에 `runMatchCalendarTests()` 함수를 추가하여 경기 일정 작성 모달 렌더링 시 날짜 입력 칸이 `<input type="date"` 형태이고 달력 컨트롤이 반환하는 `YYYY-MM-DD` 데이터 파싱이 정상적으로 이루어지는지 검증하는 테스트를 작성합니다.
  ```javascript
  function runMatchCalendarTests() {
    const originalDocument = global.document;
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
    try {
      global.showMatchForm();
      assert.ok(appendedHTML.includes('type="date"'), 'Should render date input type');
    } finally {
      global.document = originalDocument;
    }
  }
  ```
  그리고 `runTestBlock('Match Calendar Picker Tests (runMatchCalendarTests)', runMatchCalendarTests);`를 하단에 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 3: showMatchForm() 의 HTML 템플릿 수정**
  `js/app.js`에서 `showMatchForm()`의 날짜 입력 필드 HTML을 수정합니다.
  ```html
  <div class="admin-form-group">
    <label for="matchFormDate">날짜</label>
    <input type="date" id="matchFormDate" required value="${escapeHTML(dateVal)}">
  </div>
  ```

- [ ] **Step 4: 저장 리스너에서 날짜 포맷팅 가공 처리**
  `submit` 리스너에서 `date`가 `YYYY-MM-DD` 포맷이 아닌 경우(또는 기존 YYYY.MM.DD 포맷으로 하려면) 파싱하여 저장하는 코드를 폼 서브밋 핸들러에 삽입합니다.
  (달력 타입은 `2026-06-25` 형태로 값을 반환하므로, 기존 목록 보기와 정렬과의 일관성을 위해 `-`를 `.`으로 바꾸거나 혹은 통일성 있게 가공하여 저장)
  ```javascript
  const rawDate = document.getElementById('matchFormDate').value.trim();
  const date = rawDate.replace(/-/g, '.'); // YYYY.MM.DD 로 가공
  ```

- [ ] **Step 5: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 6: Git 커밋**
  Run: `git commit -am "feat: replace match date text input with HTML5 date picker calendar control"`

---

### Task 7: 경기 외부 링크 관련 3개 필드 추가 및 matches 카드 반영 (7번)

**Files:**
- Modify: `js/app.js` (경기 폼 ticketUrl/videoUrl/newsUrl 필드 추가, Matches 카드 3열 꽉 찬 버튼 배치 렌더링)
- Test: `tests/run_tests.js` (`runMatchUrlFieldsTests` 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js`에 `runMatchUrlFieldsTests()` 함수를 추가하여 사용자 Matches 일정 카드 하단에 티켓예매, 하이라이트(영상), 관련뉴스 링크 3열 버튼이 정상적으로 렌더링되는지 검증하는 테스트를 작성합니다.
  ```javascript
  function runMatchUrlFieldsTests() {
    const originalDocument = global.document;
    let appendedHTML = '';
    const mockContainer = {
      innerHTML: '',
      appendChild: (child) => { appendedHTML += child.innerHTML; }
    };
    global.document = {
      getElementById: (id) => {
        if (id === 'upcomingMatchesList') return mockContainer;
        return { value: '', addEventListener: () => {}, style: {} };
      },
      createElement: () => ({ setAttribute: () => {}, style: {}, addEventListener: () => {} }),
      querySelectorAll: () => []
    };
    global.matchList = [{ id: 1, opponent: '수원', venue: '성만', date: '2026.06.25', time: '19:00', ticketUrl: 'https://ex.com/ticket' }];
    try {
      global.renderMatchesPage();
      assert.ok(appendedHTML.includes('티켓 예매'), 'Should contain Ticket booking button');
    } finally {
      global.document = originalDocument;
      delete global.matchList;
    }
  }
  ```
  그리고 `runTestBlock('Match URL Fields Tests (runMatchUrlFieldsTests)', runMatchUrlFieldsTests);`를 하단에 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 3: showMatchForm()에 3개 URL 입력 필드 탑재 및 저장**
  `js/app.js`에서 경기 정보 추가/수정 폼에 URL 입력란을 만들고, 제출 시 로컬스토리지 데이터에 바인딩합니다.

- [ ] **Step 4: renderMatchesPage() 및 bindNextMatchWidget() 에 3열 버튼 주입**
  Matches 탭 경기 카드 렌더링 시 하단에 가로 꽉 찬 아웃라인 단추들을 렌더링합니다:
  ```javascript
  const linksHtml = `
    <div style="display: flex; gap: 6px; margin-top: 12px; width: 100%;">
      ${match.ticketUrl ? `<a href="${escapeHTML(match.ticketUrl)}" target="_blank" class="btn btn-gold btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 0;">티켓 예매</a>` : ''}
      ${match.videoUrl ? `<a href="${escapeHTML(match.videoUrl)}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 0; border: 1px solid var(--color-glass-border); color: #fff;">영상 보기</a>` : ''}
      ${match.newsUrl ? `<a href="${escapeHTML(match.newsUrl)}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 0; border: 1px solid var(--color-glass-border); color: #fff;">관련 뉴스</a>` : ''}
    </div>
  `;
  ```

- [ ] **Step 5: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 6: Git 커밋**
  Run: `git commit -am "feat: add matches ticket, video, and news URLs inputs and render full 3-column buttons on match cards"`

---

### Task 8: 팬존 내 에스코트 키즈 및 원정 버스 예약 신청 모달 폼 구현 및 어드민 연동 (8번)

**Files:**
- Modify: `index.html` (에스코트 키즈/원정 버스 신청 버튼 마크업 및 모달 폼 골격 추가)
- Modify: `js/community.js` (신청 모달 폼 팝업 띄우기, 로컬스토리지 신청 데이터 접수 연동)
- Modify: `js/app.js` (관리자 대시보드 내 "신청 현황 관리" 탭 렌더링 및 상태 승인/반려/삭제 조작 연동)
- Test: `tests/run_tests.js` (`runFanApplicationsTests` 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js`에 `runFanApplicationsTests()` 함수를 추가하여 팬 예약 신청 폼 제출 시 `fanApplicationsData` 로컬스토리지에 데이터가 쌓이고 어드민 탭에서 신청 목록 조회가 가능한지 확인하는 테스트를 작성합니다.
  ```javascript
  function runFanApplicationsTests() {
    const originalDocument = global.document;
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
    const appList = [{ id: 1, type: 'escort', name: '홍길동', phone: '010-1234-5678', detail: '8세', status: 'pending', createdAt: '2026-06-17' }];
    global.localStorage.setItem('fanApplicationsData', JSON.stringify(appList));
    try {
      // 관리자 신청자 조회 탭 렌더링 검사
      global.renderAdminApplications();
      assert.ok(appendedHTML.includes('홍길동'), 'Should render application name');
      assert.ok(appendedHTML.includes('에스코트'), 'Should render application type label');
    } finally {
      global.document = originalDocument;
      global.localStorage.removeItem('fanApplicationsData');
    }
  }
  ```
  그리고 `runTestBlock('Fan Applications Integration Tests (runFanApplicationsTests)', runFanApplicationsTests);`를 하단에 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL

- [ ] **Step 3: index.html 마크업 추가**
  - 팬존 탭 사이드바 영역(175라인 부근)에 "에스코트 키즈 신청", "원정 버스 신청" 버튼을 추가합니다.
  - 바디 하단에 신청을 받는 팝업 모달 골격 마크업을 추가합니다. (이름, 연락처, 나이/탑승지 등 기재)

- [ ] **Step 4: js/community.js 모달 제어 및 신청서 접수 로직 작성**
  - 팬존 신청 버튼 클릭 시 모달 팝업을 열고, 신청 유형(escort / bus)에 맞게 폼 라벨을 갱신합니다.
  - 제출(submit) 시 입력 유효성 검사 후 `fanApplicationsData` 로컬스토리지에 저장하고 알림 메시지를 띄웁니다.

- [ ] **Step 5: js/app.js 관리자 신청 현황 탭 구현**
  - 어드민 탭 리스트에 "신청 현황 관리" 버튼을 동적/정적 추가합니다.
  - `renderAdminApplications()`를 작성하여 접수 명단을 출력하고, 승인(status = 'approved'), 반려(status = 'rejected'), 삭제 버튼 리스너를 구현합니다.

- [ ] **Step 6: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 7: Git 최종 커밋**
  Run: `git commit -am "feat: implement escort kids and travel bus application booking system with admin dashboard list reviewer"`
