# 뉴스(News) 전용 메뉴 신설 및 링크 이동 기능 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 성만 FC 홈페이지에 독립적인 'News' 탭 메뉴를 신설하고, 홈 탭의 뉴스 위젯 기사 클릭 시 해당 뉴스 탭으로 이동하여 활성화된 뉴스의 상세 내용을 볼 수 있게 합니다.

**Architecture:** 
Single Page App(SPA) 구조에 맞게 `#news` 섹션을 추가하고, 2단 레이아웃(좌측: 목록, 우측: 상세 내용)을 구축합니다. 홈화면 뉴스 링크 클릭 시 전역 상태 `activeNewsId`를 설정하고 URL 해시를 `#news`로 전환하며, 뉴스 페이지의 클릭된 항목에 맞춰 리스트 뷰 및 상세 본문을 동적으로 렌더링하고 모바일 화면일 경우 스크롤을 이동시킵니다. 기존의 모달창 제어 코드 및 마크업은 완전히 제거합니다.

**Tech Stack:** HTML5, Vanilla CSS (Theme/Components), Vanilla JavaScript

---

### Task 1: Navigation Menu Updates

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 데스크톱 헤더 네비게이션에 News 메뉴 추가**
  `index.html`의 `<header>` 영역 내 `nav` 목록에서 Matches 뒤, Fan Zone 앞에 News 링크를 추가합니다.
  ```html
  <li><a href="#matches" class="nav-link" data-tab="matches">Matches</a></li>
  <li><a href="#news" class="nav-link" data-tab="news">News</a></li>
  <li><a href="#fanzone" class="nav-link" data-tab="fanzone">Fan Zone</a></li>
  ```

- [ ] **Step 2: 모바일 하단 네비게이션 바에 뉴스 메뉴 추가**
  `index.html` 하단의 `<nav class="mobile-nav-bar">` 목록에서 경기(Matches) 뒤, 팬존(Fan Zone) 앞에 뉴스 링크를 추가하고 전용 SVG 아이콘을 설정합니다.
  ```html
  <li>
    <a href="#matches" class="mobile-nav-link" data-tab="matches">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
      </svg>
      <span>경기</span>
    </a>
  </li>
  <li>
    <a href="#news" class="mobile-nav-link" data-tab="news">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H5c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm-1-4H6v2h12v-2zm-4-4H6v2h8v-2zm4-4H6v2h12V7z"/>
      </svg>
      <span>뉴스</span>
    </a>
  </li>
  <li>
    <a href="#fanzone" class="mobile-nav-link" data-tab="fanzone">
  ```

---

### Task 2: News Section Layout & Styles

**Files:**
- Modify: `index.html`
- Modify: `css/components.css`

- [ ] **Step 1: index.html에서 기존 뉴스 상세 모달 제거 및 #news 탭 섹션 추가**
  `id="newsModal"` 모달 마크업 전체를 제거하고, `<section id="matches">` 뒤에 `#news` 탭 섹션을 추가합니다.
  ```html
  <!-- News Tab -->
  <section id="news" class="tab-section">
    <div class="container news-container">
      <div class="section-header">
        <h2>NEWS</h2>
      </div>
      <div class="news-layout">
        <!-- 왼쪽 영역: 뉴스 리스트 -->
        <div class="news-list-column">
          <div id="newsTabList" class="news-tab-list-items">
            <!-- JS 동적 렌더링 -->
          </div>
        </div>
        <!-- 오른쪽 영역: 동적 뉴스 상세 본문 -->
        <div id="newsDetailColumn" class="news-detail-column">
          <!-- JS 동적 렌더링 -->
        </div>
      </div>
    </div>
  </section>
  ```

- [ ] **Step 2: css/components.css에 뉴스 레이아웃 스타일 및 모바일 미디어 쿼리 추가**
  `css/components.css` 파일 끝에 뉴스 탭용 스타일을 추가하고 모바일 환경 반응형 스타일 미디어 쿼리도 함께 정의합니다.
  ```css
  /* News Layout & Components */
  .news-container {
    padding-bottom: 60px;
  }
  .news-layout {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 30px;
    align-items: start;
  }
  .news-list-column {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-glass-border);
    border-radius: 12px;
    padding: 20px;
  }
  .news-tab-list-items {
    max-height: 600px;
    overflow-y: auto;
  }
  .news-item-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: var(--transition-smooth);
  }
  .news-item-card:hover, .news-item-card.active {
    border-color: var(--color-gold-solid);
    background: rgba(212, 175, 55, 0.05);
    transform: translateY(-2px);
  }
  .news-item-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .news-item-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--color-text-muted);
  }
  .news-detail-column {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-glass-border);
    border-radius: 12px;
    padding: 25px;
    min-height: 400px;
  }
  .news-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 350px;
    color: var(--color-text-muted);
    text-align: center;
  }
  .news-detail-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  .news-detail-title {
    font-family: var(--font-header);
    font-size: 22px;
    color: var(--color-gold-solid);
    margin-bottom: 10px;
    line-height: 1.4;
  }
  .news-detail-date {
    font-size: 13px;
    color: var(--color-text-muted);
  }
  .news-detail-body {
    font-size: 15px;
    line-height: 1.8;
    color: var(--color-text-primary);
    white-space: pre-line;
  }

  @media (max-width: 768px) {
    .news-layout {
      grid-template-columns: 1fr;
      gap: 25px;
    }
    .news-detail-column {
      margin-bottom: 20px;
    }
  }
  ```

---

### Task 3: JS Controller Integration

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: js/app.js 라우터 및 뉴스 바인딩 로직 업데이트**
  `switchTab` 내에 `news`일 때 렌더링 호출을 추가하고, 기존 `bindNewsWidget`의 모달 이벤트 삭제 및 뉴스 상세 모달 제어 함수를 제거합니다. 그리고 `activeNewsId` 전역 상태 및 `renderNewsPage`, `scrollNewsDetailIntoViewOnMobile` 함수를 새롭게 정의합니다. XSS 예방을 위해 `escapeHTML` 유틸리티 함수도 추가합니다.
  ```javascript
  // js/app.js 수정 사항
  
  // 파일 최상단 또는 적절한 위치에 추가
  let activeNewsId = null;

  // switchTab 내에 탭별 추가 액션 수정
  function switchTab(tabId) {
    // ... [기존 탭 액티브 처리 유지] ...
    
    // 탭 이동 시 상단 스크롤 복구
    window.scrollTo(0, 0);

    // 탭별 추가 액션
    if (tabId === 'fanzone' && typeof window.renderCommunity === 'function') {
      window.renderCommunity();
    }
    if (tabId === 'news') {
      renderNewsPage();
    }
  }

  // bindNewsWidget 및 모달 함수 제거 후 새로운 구현 추가
  function bindNewsWidget() {
    const container = document.getElementById('newsListContainer');
    if (!container || typeof newsData === 'undefined') return;

    container.innerHTML = '';
    newsData.forEach(news => {
      const item = document.createElement('div');
      item.className = 'news-item';
      item.innerHTML = `
        <div class="news-date">${escapeHTML(news.date)}</div>
        <div class="news-title">${escapeHTML(news.title)}</div>
      `;
      
      const titleEl = item.querySelector('.news-title');
      if (titleEl) {
        titleEl.addEventListener('click', () => {
          activeNewsId = news.id;
          window.location.hash = 'news';
        });
      }
      container.appendChild(item);
    });
  }

  function renderNewsPage() {
    const listContainer = document.getElementById('newsTabList');
    const detailContainer = document.getElementById('newsDetailColumn');
    if (!listContainer || !detailContainer || typeof newsData === 'undefined') return;

    if (newsData.length > 0) {
      const exists = newsData.some(n => n.id === activeNewsId);
      if (!exists) {
        activeNewsId = newsData[0].id;
      }
    }

    listContainer.innerHTML = '';
    newsData.forEach(news => {
      const card = document.createElement('div');
      card.className = `news-item-card${news.id === activeNewsId ? ' active' : ''}`;
      card.setAttribute('data-id', news.id);
      card.innerHTML = `
        <div class="news-item-title">${escapeHTML(news.title)}</div>
        <div class="news-item-meta">
          <span>성만 FC 뉴스</span>
          <span>${escapeHTML(news.date)}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        activeNewsId = news.id;
        renderNewsPage();
        scrollNewsDetailIntoViewOnMobile();
      });
      listContainer.appendChild(card);
    });

    const activeNews = newsData.find(n => n.id === activeNewsId);
    if (activeNews) {
      detailContainer.innerHTML = `
        <div class="news-detail-header">
          <h3 class="news-detail-title">${escapeHTML(activeNews.title)}</h3>
          <div class="news-detail-date">등록일: ${escapeHTML(activeNews.date)} | Sungman FC Media</div>
        </div>
        <div class="news-detail-body">${escapeHTML(activeNews.content)}</div>
      `;
    } else {
      detailContainer.innerHTML = `
        <div class="news-placeholder">
          <div class="placeholder-icon" aria-hidden="true">📰</div>
          <p>선택된 뉴스 기사가 없거나 삭제되었습니다.</p>
        </div>
      `;
    }
  }

  function scrollNewsDetailIntoViewOnMobile() {
    if (window.innerWidth <= 768) {
      const detailColumn = document.getElementById('newsDetailColumn');
      if (detailColumn) {
        detailColumn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  ```

---

### Task 4: Unit Testing & Verification

**Files:**
- Modify: `tests/run_tests.js`

- [ ] **Step 1: tests/run_tests.js 라우터 문구 검증 수정 및 뉴스 검증 케이스 강화**
  `tests/run_tests.js`에서 제거된 `openNewsModal`에 대한 참조가 없는지 확인하고, 뉴스 탭 및 라우터에 관한 정적 테스트 검증을 업데이트합니다.
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
    assert.ok(!appJsCode.includes('openNewsModal'), 'app.js should not contain openNewsModal');
  }
  ```

- [ ] **Step 2: 테스트 슈트 실행 및 전체 통과 검증**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 3: Git에 변경사항 커밋**
  Run:
  ```bash
  git add index.html css/components.css js/app.js tests/run_tests.js docs/superpowers/specs/2026-06-15-news-tab-menu-design.md
  git commit -m "feat: implement dedicated news tab menu and redirect click actions from home news widget"
  ```
