# 뉴스 상세 모달(News Modal) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 메인 화면의 뉴스 기사 카드를 클릭하면 해당하는 상세 본문을 읽을 수 있는 뉴스 전용 모달창 팝업 기능을 완벽하게 추가한다.

**Architecture:** `js/data.js`에 뉴스 기사 데이터셋을 정의하고, `js/app.js`에서 이를 로드하여 홈화면에 동적으로 바인딩하며 모달 오픈/클로즈 이벤트를 관리한다.

**Tech Stack:** HTML5, CSS3, JavaScript

---

### Task 1: 뉴스 데이터셋 정의 및 유닛 테스트 추가

**Files:**
- Modify: `js/data.js`
- Modify: `tests/run_tests.js`

- [ ] **Step 1: js/data.js에 newsData 배열 추가**
  구단 기사 목록 데이터를 `newsData` 상수로 정의하고 외부 모듈로 내보냅니다.
  ```javascript
  // js/data.js 수정사항
  const newsData = [
    {
      id: 1,
      date: "2026.06.12",
      title: "성만 FC, 하반기 전력 강화를 위한 국가대표 공격수 영입 임박",
      content: "성만 FC가 팀의 전력 강화를 위해 국가대표 출신 공격수 영입에 임박한 것으로 알려졌습니다.\n\n구단 관계자에 따르면 최근 공격진의 득점력 보강을 위해 해외 리그에서 활약 중인 국가대표 출신 공격수와 긴밀한 협상을 진행해 왔으며, 현재 이적료 및 세부 계약 조항 조율만을 남겨두고 있습니다.\n\n구단 측은 \"다가오는 하반기 일정에 대비해 공격력을 대폭 강화할 수 있는 적임자를 찾아왔다\"며, \"공식 발표는 계약서 조율이 완료되는 대로 며칠 내로 진행할 계획\"이라고 전했습니다.\n\n서포터즈들의 뜨거운 열망에 보답하기 위해 최고 수준의 전력 보강을 꾀하고 있는 성만 FC의 다음 행보가 주목됩니다."
    },
    {
      id: 2,
      date: "2026.06.10",
      title: "성만 아레나 홈 경기 가족 특별석 패키지 티켓 오픈 안내",
      content: "성만 FC의 홈구장인 '성만 아레나'에서 진행되는 다음 홈 경기를 맞아, 가족 서포터즈들을 위한 특별 패키지 티켓을 오픈합니다.\n\n이번 특별 패키지는 가족 구성원 전체가 안락하게 경기를 관람할 수 있는 지정 테이블석과 구단 공식 푸드존 쿠폰, 그리고 한정판 성만 FC 응원 머플러가 포함된 구성입니다.\n\n패키지 티켓 예매는 6월 15일 월요일 오전 10시부터 구단 공식 온라인 예매 사이트를 통해 선착순으로 가능하며, 성만 FC 유료 멤버십 회원은 1시간 먼저 선예매 혜택을 제공받을 수 있습니다.\n\n서포터즈 여러분의 많은 관심과 응원 부탁드립니다."
    }
  ];

  // 최하단 exports 업데이트
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { squadData, matchData, standingData, newsData }; // newsData 추가
  }
  ```

- [ ] **Step 2: tests/run_tests.js에 뉴스 데이터 유닛 테스트 추가**
  데이터 유효성 스키마 테스트 및 데이터 개수 검증을 추가합니다.
  ```javascript
  // tests/run_tests.js 수정사항
  // 상단 require 구문 업데이트
  const { squadData, matchData, standingData, newsData } = require('../js/data.js');

  // 뉴스 테스트 블록 정의
  function runNewsTests() {
    assert.ok(Array.isArray(newsData), 'newsData should be an array');
    assert.strictEqual(newsData.length, 2, 'newsData should have exactly 2 news items');
    
    newsData.forEach((news, index) => {
      const nStr = `News at index ${index} (${news.title || 'Unknown'})`;
      assert.strictEqual(typeof news.id, 'number', `${nStr} must have a numeric id`);
      assert.strictEqual(typeof news.date, 'string', `${nStr} must have a string date`);
      assert.strictEqual(typeof news.title, 'string', `${nStr} must have a string title`);
      assert.strictEqual(typeof news.content, 'string', `${nStr} must have a string content`);
    });
  }

  // 테스트 실행 부에 추가
  // runTestBlock('News Data Schema Tests (runNewsTests)', runNewsTests);
  ```
  *참고: `run_tests.js`에 테스트 블록 `runTestBlock('News Data Schema Tests (runNewsTests)', runNewsTests);`을 하단에 추가합니다.*

- [ ] **Step 3: 테스트 실행하여 실패(또는 아직 구현 안 됨으로 에러)하는지 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL (newsData is undefined)

- [ ] **Step 4: 변경사항 커밋** (로직 구현 전 데이터 스텁 단계 저장)
  ```bash
  git add js/data.js tests/run_tests.js
  git commit -m "test: add newsData schema assertions and dataset skeleton"
  ```

---

### Task 2: 뉴스 데이터 정의 반영 및 테스트 통과

**Files:**
- Modify: `js/data.js`

- [ ] **Step 1: js/data.js 데이터 반영**
  `js/data.js` 상단 또는 중간에 `newsData` 정의를 완성하고 저장합니다.
  
- [ ] **Step 2: 테스트 재실행**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 3: 변경사항 커밋**
  ```bash
  git add js/data.js
  git commit -m "feat: define newsData mock dataset and pass tests"
  ```

---

### Task 3: 뉴스 상세 모달 마크업 및 스타일링 추가

**Files:**
- Modify: `index.html`
- Modify: `css/components.css`

- [ ] **Step 1: index.html에 뉴스 모달 마크업 배치**
  `#squadModal` 바로 뒷부분에 `#newsModal` 구조를 삽입하고, 기존 정적 `.news-list` 하위의 뉴스 기사 두 카드를 제거하거나 동적 주입을 위해 `#newsListContainer` 영역으로 대체합니다.
  ```html
  <!-- index.html 수정사항 1: 뉴스 목록 영역 변경 -->
  <!-- 기존 class="news-list" 하위의 정적 아이템들을 id="newsListContainer"로 대체 -->
  <div class="news-list">
    <h3>LATEST NEWS</h3>
    <div id="newsListContainer">
      <!-- JS 동적 렌더링 -->
    </div>
  </div>

  <!-- index.html 수정사항 2: 모달 추가 (body 닫는 태그 직전 또는 squadModal 뒤에 추가) -->
  <!-- News Modal -->
  <div id="newsModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="newsModalTitle">
    <div class="modal-wrapper">
      <div class="modal-content">
        <button class="modal-close" id="closeNewsModal" aria-label="닫기">&times;</button>
        <div class="modal-body">
          <div class="news-modal-date" id="newsModalDate"></div>
          <h2 class="news-modal-title" id="newsModalTitle"></h2>
          <div class="news-modal-content" id="newsModalContent"></div>
        </div>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 2: css/components.css에 뉴스 전용 상세 모달 타이포그래피 추가**
  ```css
  /* css/components.css 추가사항 */
  .news-modal-date {
    font-size: 14px;
    color: var(--color-gold-solid);
    margin-bottom: 10px;
  }
  .news-modal-title {
    font-family: var(--font-header);
    font-size: 24px;
    color: #fff;
    margin-bottom: 20px;
    line-height: 1.4;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 15px;
  }
  .news-modal-content {
    font-size: 15px;
    line-height: 1.8;
    color: #ddd;
    white-space: pre-wrap;
    word-break: break-all;
  }
  ```

- [ ] **Step 3: 변경사항 커밋**
  ```bash
  git add index.html css/components.css
  git commit -m "feat: add news modal markup in HTML and typography styles in CSS"
  ```

---

### Task 4: 뉴스 목록 동적 렌더링 및 모달 팝업 액션 바인딩

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: js/app.js에 bindNewsWidget 함수 구현 및 DOMContentLoaded 바인딩**
  ```javascript
  // js/app.js 수정사항
  // DOMContentLoaded 에 bindNewsWidget() 추가
  document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    bindNextMatchWidget();
    bindNewsWidget(); // 뉴스 동적 바인딩 추가
    initSquadFeatures();
    bindMatchCenter();
    if (typeof initCommunity === 'function') {
      initCommunity();
    }
  });

  // bindNewsWidget 구현
  function bindNewsWidget() {
    const container = document.getElementById('newsListContainer');
    if (!container || typeof newsData === 'undefined') return;

    container.innerHTML = '';
    newsData.forEach(news => {
      const item = document.createElement('div');
      item.className = 'news-item';
      item.innerHTML = `
        <div class="news-date">${news.date}</div>
        <div class="news-title">${news.title}</div>
      `;
      
      // 클릭 시 모달 띄우기
      const titleEl = item.querySelector('.news-title');
      if (titleEl) {
        titleEl.addEventListener('click', () => {
          openNewsModal(news);
        });
      }
      container.appendChild(item);
    });

    // 뉴스 모달 제어 이벤트 바인딩
    const modal = document.getElementById('newsModal');
    const closeBtn = document.getElementById('closeNewsModal');
    if (modal && closeBtn) {
      // 닫기 버튼
      closeBtn.addEventListener('click', closeNewsModal);
      // 배경 클릭
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-wrapper')) {
          closeNewsModal();
        }
      });
      // ESC 키 감지
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          closeNewsModal();
        }
      });
    }
  }

  function openNewsModal(news) {
    const modal = document.getElementById('newsModal');
    const dateEl = document.getElementById('newsModalDate');
    const titleEl = document.getElementById('newsModalTitle');
    const contentEl = document.getElementById('newsModalContent');

    if (modal && dateEl && titleEl && contentEl) {
      dateEl.textContent = news.date;
      titleEl.textContent = news.title;
      // HTML escaping이 이미 되어 있다면 textContent 사용, 개행 문자 유지를 위해 CSS pre-wrap 연동
      contentEl.textContent = news.content;
      modal.classList.add('active');
      modal.setAttribute('tabindex', '-1');
      modal.focus();
    }
  }

  function closeNewsModal() {
    const modal = document.getElementById('newsModal');
    if (modal) {
      modal.classList.remove('active');
      modal.removeAttribute('tabindex');
    }
  }
  ```

- [ ] **Step 2: 테스트 재실행 및 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 3: 변경사항 커밋**
  ```bash
  git add js/app.js
  git commit -m "feat: implement dynamic news rendering and modal popup events"
  ```
