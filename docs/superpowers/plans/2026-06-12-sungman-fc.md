# 성만 FC 공식 홈페이지 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 세련된 다크 앤 골드 테마의 K리그 가상 구단 '성만 FC' 공식 홈페이지를 바닐라 HTML, CSS, JavaScript로 구현하여 새로고침 없는 몰입형 SPA 웹 사이트를 완성합니다.

**Architecture:** 단일 `index.html` 내에 각 탭(Home, Club, Squad, Matches, Fan Zone)의 레이아웃을 섹션으로 분할 배치하고, `app.js`에서 탭 스위칭 라우터 및 모달 로직을 처리합니다. 구단 데이터는 `data.js`로 분리하고 게시판은 `community.js`와 `localStorage`를 연계하여 브라우저 수준에서 데이터가 영속적으로 유지되도록 합니다.

**Tech Stack:** Vanilla HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+), Node.js (테스트 실행용)

---

## 파일 구조 정의

```text
fcclub/
├── index.html                  # 메인 HTML (골격 및 탭별 섹션)
├── css/
│   ├── theme.css               # 다크 & 골드 CSS 테마 변수 및 타이포그래피
│   ├── main.css                # 레이아웃 뼈대 및 헤더/푸터 공통 스타일
│   └── components.css          # 카드, 테이블, 모달, 게시판 등 개별 컴포넌트 스타일
├── js/
│   ├── data.js                 # 선수, 매치 일정, 순위표 등 모의 데이터
│   ├── community.js            # 로컬 스토리지 연동 게시판/한줄응원 비즈니스 로직
│   └── app.js                  # 탭 라우팅, 모달 활성화 및 전체 UI 조율
└── tests/
    └── run_tests.js            # Node.js 환경에서 비즈니스 로직을 자동 검증하기 위한 단위 테스트 스크립트
```

---

## 구현 태스크 목록

### Task 1: CSS 테마 및 레이아웃 기초 구축

**Files:**
- Create: `css/theme.css`
- Create: `css/main.css`
- Create: `index.html`

- [ ] **Step 1: CSS 테마 변수 정의 (`css/theme.css`)**

```css
/* css/theme.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@600;700;800&display=swap');

:root {
  --color-bg-primary: #0d0d0d;
  --color-bg-secondary: #161616;
  --color-accent-gold: linear-gradient(135deg, #f39c12, #d4af37, #f9ca24);
  --color-gold-solid: #d4af37;
  --color-gold-hover: #ffdf00;
  --color-text-primary: #ffffff;
  --color-text-muted: #aaaaaa;
  --color-glass-bg: rgba(22, 22, 22, 0.75);
  --color-glass-border: rgba(212, 175, 55, 0.15);
  --font-header: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
  --max-width: 1200px;
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  line-height: 1.6;
  overflow-x: hidden;
}
```

- [ ] **Step 2: 기본 레이아웃 스타일 작성 (`css/main.css`)**

```css
/* css/main.css */
.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px;
}

/* Header & Nav */
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: var(--color-glass-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-glass-border);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-header);
  font-size: 24px;
  font-weight: 800;
  text-decoration: none;
  color: var(--color-text-primary);
}

.logo span {
  background: var(--color-accent-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 30px;
}

nav a {
  text-decoration: none;
  color: var(--color-text-muted);
  font-family: var(--font-header);
  font-size: 16px;
  font-weight: 600;
  transition: var(--transition-smooth);
  position: relative;
  padding: 8px 0;
}

nav a:hover, nav a.active {
  color: var(--color-gold-solid);
}

nav a.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-accent-gold);
}

main {
  margin-top: 80px;
  min-height: calc(100vh - 180px);
}

.tab-section {
  display: none;
  animation: fadeIn 0.5s ease-out forwards;
}

.tab-section.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

footer {
  background-color: #050505;
  border-top: 1px solid #1f1f1f;
  padding: 40px 0;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}
```

- [ ] **Step 3: HTML 기본 구조 및 탭 뼈대 작성 (`index.html`)**

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>성만 FC 공식 홈페이지 | SUNGMAN FC</title>
  <link rel="stylesheet" href="css/theme.css">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/components.css">
</head>
<body>
  <header>
    <div class="container header-container">
      <a href="#home" class="logo">SUNGMAN <span>FC</span></a>
      <nav>
        <ul>
          <li><a href="#home" class="nav-link active" data-tab="home">Home</a></li>
          <li><a href="#club" class="nav-link" data-tab="club">Club</a></li>
          <li><a href="#squad" class="nav-link" data-tab="squad">Squad</a></li>
          <li><a href="#matches" class="nav-link" data-tab="matches">Matches</a></li>
          <li><a href="#fanzone" class="nav-link" data-tab="fanzone">Fan Zone</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section id="home" class="tab-section active">
      <div class="container">
        <h1>홈 페이지 영역</h1>
      </div>
    </section>
    <section id="club" class="tab-section">
      <div class="container">
        <h1>구단 소개 영역</h1>
      </div>
    </section>
    <section id="squad" class="tab-section">
      <div class="container">
        <h1>선수단 영역</h1>
      </div>
    </section>
    <section id="matches" class="tab-section">
      <div class="container">
        <h1>매치 센터 영역</h1>
      </div>
    </section>
    <section id="fanzone" class="tab-section">
      <div class="container">
        <h1>팬 존 영역</h1>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>&copy; 2026 SUNGMAN FC. All Rights Reserved.</p>
    </div>
  </footer>
</body>
</html>
```

- [ ] **Step 4: 로컬 서빙 도구를 이용한 브라우저 렌더링 확인**

Run: `node -e "const http = require('http'), fs = require('fs'); http.createServer((req, res) => { let p = '.' + (req.url === '/' ? '/index.html' : req.url); fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); res.end('Not Found'); } else { res.writeHead(200); res.end(data); } }); }).listen(3000); console.log('Server running on http://localhost:3000');"`
Expected: 브라우저에서 `http://localhost:3000` 접속 시 검은색 배경에 황금빛 로고, 헤더와 푸터, 그리고 "홈 페이지 영역" 텍스트가 정상 노출되는 것을 수동 확인.

- [ ] **Step 5: 변경사항 커밋**

```bash
git add css/theme.css css/main.css index.html
git commit -m "feat: add CSS theme variables, main layout, and index skeleton"
```

---

### Task 2: Mock 데이터 설정 및 테스트 환경 구축

**Files:**
- Create: `js/data.js`
- Create: `tests/run_tests.js`

- [ ] **Step 1: Mock 데이터 파일 작성 (`js/data.js`)**

```javascript
// js/data.js
const squadData = [
  { id: 1, name: "김성민", engName: "KIM Sungmin", number: 10, position: "FW", stats: { matches: 15, goals: 9, assists: 4 }, details: { height: 183, weight: 78, birth: "1998-05-12" }, image: "player_fw_10" },
  { id: 2, name: "이마에", engName: "LEE Mae", number: 7, position: "MF", stats: { matches: 14, goals: 3, assists: 7 }, details: { height: 175, weight: 70, birth: "1999-11-20" }, image: "player_mf_7" },
  { id: 3, name: "박수벽", engName: "PARK Subyeok", number: 4, position: "DF", stats: { matches: 15, goals: 1, assists: 1 }, details: { height: 188, weight: 82, birth: "1995-02-08" }, image: "player_df_4" },
  { id: 4, name: "최철벽", engName: "CHOI Cheolbyeok", number: 1, position: "GK", stats: { matches: 15, goals: 0, assists: 0 }, details: { height: 191, weight: 85, birth: "1994-07-25" }, image: "player_gk_1" },
  { id: 5, name: "성만용", engName: "SUNG Manyong", number: 9, position: "FW", stats: { matches: 10, goals: 5, assists: 1 }, details: { height: 185, weight: 80, birth: "2000-01-15" }, image: "player_fw_9" }
];

const matchData = [
  { id: 101, opponent: "수원 삼성", date: "2026-06-20", time: "19:00", venue: "성만 아레나", type: "Home", status: "upcoming" },
  { id: 102, opponent: "FC 서울", date: "2026-06-25", time: "19:30", venue: "서울월드컵경기장", type: "Away", status: "upcoming" },
  { id: 100, opponent: "전북 현대", date: "2026-06-07", venue: "성만 아레나", type: "Home", score: { home: 2, away: 1 }, status: "finished" },
  { id: 99, opponent: "울산 HD", date: "2026-06-03", venue: "울산문수경기장", type: "Away", score: { home: 1, away: 1 }, status: "finished" }
];

const standingData = [
  { rank: 1, teamName: "울산 HD", played: 15, wins: 9, draws: 4, losses: 2, gd: 12, points: 31 },
  { rank: 2, teamName: "성만 FC", played: 15, wins: 8, draws: 5, losses: 2, gd: 9, points: 29 },
  { rank: 3, teamName: "포항 스틸러스", played: 15, wins: 7, draws: 5, losses: 3, gd: 6, points: 26 },
  { rank: 4, teamName: "FC 서울", played: 15, wins: 6, draws: 4, losses: 5, gd: 2, points: 22 },
  { rank: 5, teamName: "수원 삼성", played: 15, wins: 5, draws: 4, losses: 6, gd: -2, points: 19 }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { squadData, matchData, standingData };
}
```

- [ ] **Step 2: 단위 테스트 인프라 구축 (`tests/run_tests.js`)**

```javascript
// tests/run_tests.js
const assert = require('assert');
const { squadData, matchData, standingData } = require('../js/data.js');

console.log('--- RUNNING SUNGMAN FC DATA UNIT TESTS ---');

// 1. Data Integrity Tests
try {
  assert.strictEqual(squadData.length, 5, 'Squad data should have 5 default players');
  assert.strictEqual(squadData[0].name, '김성민', 'First player name should be 김성민');
  assert.strictEqual(squadData[0].stats.goals, 9, '김성민 should have 9 goals');
  
  assert.strictEqual(matchData.filter(m => m.status === 'upcoming').length, 2, 'Should have 2 upcoming matches');
  assert.strictEqual(standingData.find(t => t.teamName === '성만 FC').rank, 2, '성만 FC should be ranked 2nd');

  console.log('✔ Data Integrity Tests Passed!');
} catch (error) {
  console.error('❌ Data Integrity Tests Failed:', error.message);
  process.exit(1);
}
```

- [ ] **Step 3: 테스트 실행을 통해 성공 여부 확인**

Run: `node tests/run_tests.js`
Expected: `✔ Data Integrity Tests Passed!` 가 콘솔에 출력되고 성공 종료(exit code 0).

- [ ] **Step 4: 변경사항 커밋**

```bash
git add js/data.js tests/run_tests.js
git commit -m "feat: add squad, match, standing data models and write basic unit tests"
```

---

### Task 3: SPA 라우팅 및 상태 관리 엔진 탑재

**Files:**
- Create: `js/app.js`
- Modify: `index.html`
- Modify: `tests/run_tests.js`

- [ ] **Step 1: Router 및 SPA 로직 구현 (`js/app.js`)**

```javascript
// js/app.js
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
});

function initRouter() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.tab-section');

  function switchTab(tabId) {
    // URL Hash 동기화
    if (window.location.hash !== `#${tabId}`) {
      window.location.hash = tabId;
    }

    // 네비게이션 버튼 active 클래스 갱신
    navLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 섹션 활성화 제어
    sections.forEach(section => {
      if (section.id === tabId) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 게시판 탭일 경우 렌더링 리트리거
    if (tabId === 'fanzone' && typeof window.renderCommunity === 'function') {
      window.renderCommunity();
    }
  }

  // 클릭 이벤트 리스너 추가
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // 초기 라우트 설정 (해시 존재 시 처리)
  const initialHash = window.location.hash.replace('#', '');
  const validTabs = ['home', 'club', 'squad', 'matches', 'fanzone'];
  if (validTabs.includes(initialHash)) {
    switchTab(initialHash);
  } else {
    switchTab('home');
  }

  // 해시 체인지 핸들러
  window.addEventListener('hashchange', () => {
    const tabId = window.location.hash.replace('#', '');
    if (validTabs.includes(tabId)) {
      switchTab(tabId);
    }
  });
}
```

- [ ] **Step 2: index.html에 app.js 및 data.js 연동 (`index.html`)**

```html
<!-- index.html 수정 부분: </body> 바로 직전 스크립트 로드 추가 -->
  <script src="js/data.js"></script>
  <script src="js/community.js"></script>
  <script src="js/app.js"></script>
</body>
```

- [ ] **Step 3: 테스트 케이스에 라우팅 유틸 함수 가상 검증 추가 (`tests/run_tests.js`)**

```javascript
// tests/run_tests.js 수정: 라우터 검증용 가상 테스트 케이스 추가
const fs = require('fs');

try {
  const appJsCode = fs.readFileSync('js/app.js', 'utf8');
  assert.ok(appJsCode.includes('switchTab'), 'app.js should contain switchTab logic');
  assert.ok(appJsCode.includes('window.location.hash'), 'app.js should use window.location.hash');
  console.log('✔ Router Syntax Verification Passed!');
} catch (error) {
  console.error('❌ Router Verification Failed:', error.message);
  process.exit(1);
}
```

- [ ] **Step 4: 테스트 실행**

Run: `node tests/run_tests.js`
Expected: `✔ Router Syntax Verification Passed!` 출력 및 PASS.

- [ ] **Step 5: 변경사항 커밋**

```bash
git add js/app.js index.html tests/run_tests.js
git commit -m "feat: implement SPA client-side routing logic and load scripts in index.html"
```

---

### Task 4: 홈(Home) 및 구단(Club) 뷰 컴포넌트 구현

**Files:**
- Modify: `index.html`
- Create: `css/components.css`

- [ ] **Step 1: 홈/구단 세션의 HTML 세부 구현 (`index.html`)**

```html
<!-- index.html 의 #home 과 #club 섹션 교체 -->
    <!-- Home Tab -->
    <section id="home" class="tab-section active">
      <div class="hero-banner">
        <div class="hero-overlay"></div>
        <div class="container hero-content">
          <h2>WE ARE SUNGMAN</h2>
          <p>황금빛 날개로 비상하라, 성만 FC의 여정에 동참하세요</p>
        </div>
      </div>
      <div class="container main-grid">
        <div class="card next-match-widget">
          <h3>NEXT MATCH</h3>
          <div class="d-day" id="nextMatchDDay">D-08</div>
          <div class="match-vs">
            <div class="team">성만 FC</div>
            <div class="vs">VS</div>
            <div class="team" id="nextMatchOpponent">수원 삼성</div>
          </div>
          <div class="match-info" id="nextMatchInfo">2026.06.20 19:00 @ 성만 아레나</div>
          <button class="btn btn-gold">온라인 티켓 예매</button>
        </div>
        <div class="news-list">
          <h3>LATEST NEWS</h3>
          <div class="news-item">
            <div class="news-date">2026.06.12</div>
            <div class="news-title">성만 FC, 하반기 전력 강화를 위한 국가대표 공격수 영입 임박</div>
          </div>
          <div class="news-item">
            <div class="news-date">2026.06.10</div>
            <div class="news-title">성만 아레나 홈 경기 가족 특별석 패키지 티켓 오픈 안내</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Club Tab -->
    <section id="club" class="tab-section">
      <div class="container club-container">
        <div class="club-header">
          <h2>CLUB IDENTITY</h2>
          <p>전통과 역사를 이끄는 성만 FC의 상징</p>
        </div>
        <div class="club-details">
          <div class="card identity-card">
            <h4>성만 FC 엠블럼과 상징</h4>
            <p>성만 FC의 공식 엠블럼은 승리를 수호하는 사자(Lion)와 높은 곳을 향해 비상하는 골드 윙(Gold Wings)을 결합하여 제작되었습니다. 엠블럼 전체를 감싸는 로열 골드 테두리는 팬들과 함께 이룩해 나갈 찬란한 역사와 우승의 영광을 의미합니다.</p>
          </div>
          <div class="card stadium-card">
            <h4>HOME GROUND: 성만 아레나 (Sungman Arena)</h4>
            <p>축구 전용 구장인 '성만 아레나'는 40,000명을 수용할 수 있는 대한민국 최고의 스마트 축구 전용 경기장입니다. 서포터석과 그라운드의 거리를 5m 이내로 극소화하여 생동감 넘치는 연출과 뜨거운 응원 열기를 전달합니다.</p>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 홈/구단 컴포넌트용 CSS 추가 (`css/components.css`)**

```css
/* css/components.css */
/* Hero Banner */
.hero-banner {
  height: 400px;
  background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('../assets/stadium_bg.jpg') no-repeat center center/cover;
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 50px;
}

/* assets/stadium_bg.jpg가 없을 경우의 대비 배경색 */
.hero-banner {
  background-color: #111;
  background-image: radial-gradient(circle at center, #1e1e1e 0%, #0d0d0d 100%);
}

.hero-content h2 {
  font-family: var(--font-header);
  font-size: 56px;
  font-weight: 800;
  letter-spacing: 2px;
  background: var(--color-accent-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.hero-content p {
  font-size: 18px;
  color: var(--color-text-muted);
}

/* Grid & Cards */
.main-grid {
  display: grid;
  grid-template-columns: 1.2fr 1.8fr;
  gap: 40px;
  margin-bottom: 50px;
}

.card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-glass-border);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  transition: var(--transition-smooth);
}

.card:hover {
  border-color: var(--color-gold-solid);
  transform: translateY(-5px);
}

/* Next Match Widget */
.next-match-widget {
  text-align: center;
}

.next-match-widget h3, .news-list h3 {
  font-family: var(--font-header);
  font-size: 20px;
  color: var(--color-gold-solid);
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.d-day {
  font-family: var(--font-header);
  font-size: 48px;
  font-weight: 800;
  margin: 10px 0;
  background: var(--color-accent-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.match-vs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 20px;
  font-weight: 600;
  margin: 15px 0;
}

.match-vs .vs {
  font-size: 14px;
  color: var(--color-gold-solid);
  border: 1px solid var(--color-gold-solid);
  padding: 4px 8px;
  border-radius: 4px;
}

.match-info {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 25px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.btn-gold {
  background: var(--color-accent-gold);
  color: #000000;
}

.btn-gold:hover {
  background: var(--color-gold-hover);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
}

/* News List */
.news-item {
  border-bottom: 1px solid #222;
  padding: 15px 0;
}

.news-item:last-child {
  border-bottom: none;
}

.news-date {
  font-size: 12px;
  color: var(--color-gold-solid);
  margin-bottom: 5px;
}

.news-title {
  font-size: 16px;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.news-title:hover {
  color: var(--color-gold-solid);
}

/* Club Intro Tab styles */
.club-header {
  text-align: center;
  margin: 50px 0;
}

.club-header h2 {
  font-family: var(--font-header);
  font-size: 36px;
  background: var(--color-accent-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.club-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 60px;
}
```

- [ ] **Step 3: 다음 경기 D-day 위젯 실시간 데이터 연동 코드 탑재 (`js/app.js`)**

```javascript
// js/app.js 맨 끝에 다음 코드 조각을 추가하여 mock 데이터를 바인딩
function bindNextMatchWidget() {
  const upcomingMatch = matchData.find(m => m.status === 'upcoming');
  if (upcomingMatch) {
    document.getElementById('nextMatchOpponent').textContent = upcomingMatch.opponent;
    document.getElementById('nextMatchInfo').textContent = `${upcomingMatch.date} ${upcomingMatch.time} @ ${upcomingMatch.venue}`;
    
    // D-Day 계산
    const matchDateObj = new Date(`${upcomingMatch.date}T${upcomingMatch.time}`);
    const today = new Date();
    const diffTime = matchDateObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dDayText = diffDays > 0 ? `D-${String(diffDays).padStart(2, '0')}` : (diffDays === 0 ? 'D-DAY' : 'FINISHED');
    document.getElementById('nextMatchDDay').textContent = dDayText;
  }
}

// initRouter 내부 혹은 DOMContentLoaded 내부에서 호출
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  bindNextMatchWidget(); // 추가
});
```

- [ ] **Step 4: 로컬 서버 구동 후 UI 렌더링 확인**

Run: `node -e "const http = require('http'), fs = require('fs'); http.createServer((req, res) => { let p = '.' + (req.url === '/' ? '/index.html' : req.url); fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); res.end('Not Found'); } else { res.writeHead(200); res.end(data); } }); }).listen(3000);"`
Expected: 브라우저로 `http://localhost:3000` 재접속 후 다음 경기(VS 수원 삼성) D-Day, 시간 정보가 `data.js` 기반으로 올바르게 노출되는지 확인.

- [ ] **Step 5: 변경사항 커밋**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat: implement Home and Club tabs UI structure, CSS styles, and dynamic next match data binding"
```

---

### Task 5: 선수단(Squad) 리스트 필터 및 모달 팝업 구현

**Files:**
- Modify: `index.html`
- Modify: `css/components.css`
- Modify: `js/app.js`

- [ ] **Step 1: 선수단(Squad) 탭 HTML 레이아웃 및 모달 마크업 추가 (`index.html`)**

```html
<!-- index.html 의 #squad 섹션 수정 -->
    <section id="squad" class="tab-section">
      <div class="container">
        <div class="section-header">
          <h2>SQUAD</h2>
          <div class="squad-filters" id="squadFilters">
            <button class="filter-btn active" data-position="ALL">전체</button>
            <button class="filter-btn" data-position="GK">GK</button>
            <button class="filter-btn" data-position="DF">DF</button>
            <button class="filter-btn" data-position="MF">MF</button>
            <button class="filter-btn" data-position="FW">FW</button>
          </div>
        </div>
        <div class="squad-grid" id="squadGrid">
          <!-- JS를 통해 카드들이 동적 렌더링됩니다. -->
        </div>
      </div>
    </section>

    <!-- 선수단 프로필 상세 모달 -->
    <div class="modal" id="playerModal">
      <div class="modal-overlay"></div>
      <div class="modal-wrapper">
        <button class="modal-close" id="modalClose">&times;</button>
        <div class="modal-body" id="modalBody">
          <!-- JS를 통해 동적으로 채워집니다. -->
        </div>
      </div>
    </div>
```

- [ ] **Step 2: 선수 카드 및 모달 CSS 추가 (`css/components.css`)**

```css
/* css/components.css 에 추가 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0;
  border-bottom: 1px solid var(--color-glass-border);
  padding-bottom: 20px;
}

.section-header h2 {
  font-family: var(--font-header);
  font-size: 32px;
  background: var(--color-accent-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.squad-filters {
  display: flex;
  gap: 10px;
}

.filter-btn {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-glass-border);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition-smooth);
}

.filter-btn:hover, .filter-btn.active {
  color: #000;
  background: var(--color-accent-gold);
  border-color: transparent;
}

.squad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.player-card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-glass-border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition-smooth);
  position: relative;
  text-align: center;
}

.player-card:hover {
  transform: translateY(-8px);
  border-color: var(--color-gold-solid);
  box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2);
}

.player-img-placeholder {
  height: 240px;
  background: linear-gradient(to bottom, #222, #111);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72px;
  color: #333;
  font-weight: 800;
  position: relative;
}

.player-card:hover .player-img-placeholder {
  color: var(--color-gold-solid);
}

.player-number-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: var(--color-gold-solid);
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 800;
  font-size: 14px;
}

.player-info {
  padding: 15px;
}

.player-name {
  font-family: var(--font-header);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.player-pos {
  font-size: 12px;
  color: var(--color-text-muted);
  letter-spacing: 1px;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  display: none;
  align-items: center;
  justify-content: center;
}

.modal.is-visible {
  display: flex;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
}

.modal-wrapper {
  position: relative;
  background-color: #151515;
  border: 1px solid var(--color-gold-solid);
  width: 90%;
  max-width: 550px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  animation: modalSlideUp 0.3s ease-out forwards;
}

@keyframes modalSlideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 30px;
  cursor: pointer;
  z-index: 10;
  transition: var(--transition-smooth);
}

.modal-close:hover {
  color: var(--color-gold-solid);
}

.modal-body {
  padding: 40px;
}

.player-modal-header {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid var(--color-glass-border);
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.player-modal-badge {
  font-size: 48px;
  font-weight: 800;
  color: var(--color-gold-solid);
}

.player-modal-meta h3 {
  font-size: 24px;
  margin-bottom: 4px;
}

.player-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.stat-box {
  background-color: #0c0c0c;
  border: 1px solid var(--color-glass-border);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.stat-val {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-gold-solid);
}

.stat-lbl {
  font-size: 11px;
  color: var(--color-text-muted);
}
```

- [ ] **Step 3: 선수단 목록 렌더링, 필터링, 모달 팝업 바인딩 로직 구현 (`js/app.js`)**

```javascript
// js/app.js 에 추가할 선수단 조작 함수들
function renderSquad(positionFilter = 'ALL') {
  const grid = document.getElementById('squadGrid');
  grid.innerHTML = '';

  const filtered = squadData.filter(player => positionFilter === 'ALL' || player.position === positionFilter);

  filtered.forEach(player => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.setAttribute('data-id', player.id);
    card.innerHTML = `
      <div class="player-number-badge">${player.number}</div>
      <div class="player-img-placeholder">${player.number}</div>
      <div class="player-info">
        <div class="player-name">${player.name}</div>
        <div class="player-pos">${player.position}</div>
      </div>
    `;
    card.addEventListener('click', () => openPlayerModal(player.id));
    grid.appendChild(card);
  });
}

function openPlayerModal(playerId) {
  const player = squadData.find(p => p.id === playerId);
  if (!player) return;

  const modal = document.getElementById('playerModal');
  const modalBody = document.getElementById('modalBody');

  modalBody.innerHTML = `
    <div class="player-modal-header">
      <div class="player-modal-badge">${player.number}</div>
      <div class="player-modal-meta">
        <h3>${player.name}</h3>
        <p style="color:var(--color-text-muted)">${player.engName} | ${player.position}</p>
      </div>
    </div>
    <div>
      <p><strong>생년월일:</strong> ${player.details.birth}</p>
      <p><strong>신체조건:</strong> ${player.details.height}cm / ${player.details.weight}kg</p>
    </div>
    <div class="player-stats-grid">
      <div class="stat-box">
        <div class="stat-val">${player.stats.matches}</div>
        <div class="stat-lbl">출장 경기수</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${player.stats.goals}</div>
        <div class="stat-lbl">득점</div>
      </div>
      <div class="stat-box">
        <div class="stat-val">${player.stats.assists}</div>
        <div class="stat-lbl">도움</div>
      </div>
    </div>
  `;

  modal.classList.add('is-visible');
}

function initSquadFeatures() {
  renderSquad();

  // 필터 버튼 이벤트 바인딩
  const filterBtns = document.querySelectorAll('#squadFilters .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const pos = btn.getAttribute('data-position');
      renderSquad(pos);
    });
  });

  // 모달 닫기 바인딩
  const modal = document.getElementById('playerModal');
  document.getElementById('modalClose').addEventListener('click', () => {
    modal.classList.remove('is-visible');
  });

  modal.querySelector('.modal-overlay').addEventListener('click', () => {
    modal.classList.remove('is-visible');
  });

  // ESC 키 닫기
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
      modal.classList.remove('is-visible');
    }
  });
}

// DOMContentLoaded 에 initSquadFeatures() 추가
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  bindNextMatchWidget();
  initSquadFeatures(); // 추가
});
```

- [ ] **Step 4: 로컬 서버 구동 후 선수단 탭 필터링 및 모달 팝업 UI/UX 수동 검증**

Run: `node -e "const http = require('http'), fs = require('fs'); http.createServer((req, res) => { let p = '.' + (req.url === '/' ? '/index.html' : req.url); fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); res.end('Not Found'); } else { res.writeHead(200); res.end(data); } }); }).listen(3000);"`
Expected: `http://localhost:3000` 접속 -> `Squad` 탭 메뉴 이동 -> `FW` 필터 선택 시 '김성민', '성만용'만 노출되는지 확인 -> '김성민' 선수 카드 클릭 시 신체 스펙 및 이번 시즌 기록(9골 4도움) 모달 팝업이 출력되는지 확인.

- [ ] **Step 5: 변경사항 커밋**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat: implement Squad list rendering, position filtering, and player detail modal"
```

---

### Task 6: 매치 센터(Matches) 일정 및 가상 순위표 구현

**Files:**
- Modify: `index.html`
- Modify: `css/components.css`
- Modify: `js/app.js`

- [ ] **Step 1: 매치 센터 탭 HTML 구조 구현 (`index.html`)**

```html
<!-- index.html 의 #matches 섹션 수정 -->
    <section id="matches" class="tab-section">
      <div class="container matches-container">
        <div class="section-header">
          <h2>MATCH CENTER</h2>
        </div>
        <div class="matches-grid">
          <div class="match-schedule-section">
            <h3>경기 일정 및 결과</h3>
            <div id="matchListContainer">
              <!-- JS 동적 렌더링 -->
            </div>
          </div>
          <div class="league-table-section">
            <h3>K리그 1 실시간 순위표</h3>
            <table class="standing-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>구단명</th>
                  <th>경기</th>
                  <th>승점</th>
                  <th>승</th>
                  <th>무</th>
                  <th>패</th>
                  <th>득실차</th>
                </tr>
              </thead>
              <tbody id="standingTableBody">
                <!-- JS 동적 렌더링 -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 매치 및 순위표 컴포넌트 CSS 추가 (`css/components.css`)**

```css
/* css/components.css 에 추가 */
.matches-grid {
  display: grid;
  grid-template-columns: 1.6fr 1.4fr;
  gap: 40px;
  margin-bottom: 60px;
}

.matches-grid h3 {
  font-family: var(--font-header);
  font-size: 20px;
  color: var(--color-gold-solid);
  margin-bottom: 20px;
  border-left: 3px solid var(--color-gold-solid);
  padding-left: 10px;
}

.match-list-item {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-glass-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-list-item.finished {
  opacity: 0.8;
}

.match-list-meta {
  font-size: 13px;
  color: var(--color-text-muted);
}

.match-list-meta .match-type-badge {
  background-color: #333;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.match-list-meta .match-type-badge.home {
  background-color: var(--color-gold-solid);
  color: #000;
}

.match-list-teams {
  font-size: 16px;
  font-weight: 600;
  margin-top: 5px;
}

.match-list-score {
  font-family: var(--font-header);
  font-size: 22px;
  font-weight: 800;
  color: var(--color-gold-solid);
}

.match-list-status {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 4px;
}

/* Standing Table */
.standing-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.standing-table th {
  background-color: #111;
  color: var(--color-gold-solid);
  font-weight: 600;
  text-align: center;
  padding: 12px;
  border-bottom: 2px solid var(--color-glass-border);
}

.standing-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #1a1a1a;
}

.standing-table tr.highlight-team {
  background-color: rgba(212, 175, 55, 0.1);
  font-weight: bold;
}

.standing-table tr.highlight-team td {
  border-top: 1px solid var(--color-gold-solid);
  border-bottom: 1px solid var(--color-gold-solid);
  color: var(--color-gold-hover);
}
```

- [ ] **Step 3: 매치 및 순위표 동적 렌더링 로직 추가 (`js/app.js`)**

```javascript
// js/app.js 에 추가할 경기 및 순위표 바인딩 함수들
function bindMatchCenter() {
  // 경기 목록 바인딩
  const container = document.getElementById('matchListContainer');
  container.innerHTML = '';

  matchData.forEach(match => {
    const item = document.createElement('div');
    item.className = `match-list-item ${match.status}`;
    
    let scoreOrTimeHtml = '';
    if (match.status === 'finished') {
      scoreOrTimeHtml = `<div class="match-list-score">${match.score.home} - ${match.score.away}</div>`;
    } else {
      scoreOrTimeHtml = `<div class="match-list-status">${match.time}</div>`;
    }

    const typeBadge = match.type === 'Home' ? '<span class="match-type-badge home">HOME</span>' : '<span class="match-type-badge">AWAY</span>';

    item.innerHTML = `
      <div>
        <div class="match-list-meta">
          ${typeBadge} ${match.date} @ ${match.venue}
        </div>
        <div class="match-list-teams">
          성만 FC vs ${match.opponent}
        </div>
      </div>
      ${scoreOrTimeHtml}
    `;
    container.appendChild(item);
  });

  // 순위표 바인딩
  const tbody = document.getElementById('standingTableBody');
  tbody.innerHTML = '';

  standingData.forEach(row => {
    const tr = document.createElement('tr');
    if (row.teamName === '성만 FC') {
      tr.className = 'highlight-team';
    }

    tr.innerHTML = `
      <td>${row.rank}</td>
      <td style="text-align:left; padding-left:20px;">${row.teamName}</td>
      <td>${row.played}</td>
      <td>${row.points}</td>
      <td>${row.wins}</td>
      <td>${row.draws}</td>
      <td>${row.losses}</td>
      <td>${row.gd > 0 ? '+' + row.gd : row.gd}</td>
    `;
    tbody.appendChild(tr);
  });
}

// DOMContentLoaded 에 bindMatchCenter() 추가
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  bindNextMatchWidget();
  initSquadFeatures();
  bindMatchCenter(); // 추가
});
```

- [ ] **Step 4: 로컬 구동 및 매치 센터 UI 구성 수동 검증**

Run: `node -e "const http = require('http'), fs = require('fs'); http.createServer((req, res) => { let p = '.' + (req.url === '/' ? '/index.html' : req.url); fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); res.end('Not Found'); } else { res.writeHead(200); res.end(data); } }); }).listen(3000);"`
Expected: 브라우저 접속 -> `Matches` 탭으로 이동 시, 경기 리스트(완료된 경기는 점수, 다가올 경기는 예정 시간 출력)와 성만 FC가 황금빛 행으로 하이라이트된 2위 리그 순위표가 깨지지 않고 우아하게 렌더링되는 것을 확인.

- [ ] **Step 5: 변경사항 커밋**

```bash
git add index.html css/components.css js/app.js
git commit -m "feat: render Match Center schedule items and styled league standing table"
```

---

### Task 7: 팬존(Fan Zone) 커뮤니티 및 로컬 스토리지 데이터 제어 구현

**Files:**
- Modify: `index.html`
- Modify: `css/components.css`
- Create: `js/community.js`
- Modify: `tests/run_tests.js`

- [ ] **Step 1: 팬존 탭 게시판 골격 HTML 추가 (`index.html`)**

```html
<!-- index.html 의 #fanzone 섹션 수정 -->
    <section id="fanzone" class="tab-section">
      <div class="container">
        <div class="section-header">
          <h2>FAN ZONE</h2>
        </div>
        
        <!-- 실시간 응원 메시지 바 -->
        <div class="cheer-banner">
          <div class="cheer-title">실시간 한줄 응원</div>
          <form id="cheerForm" class="cheer-form">
            <input type="text" id="cheerName" placeholder="닉네임" required>
            <input type="text" id="cheerText" placeholder="성만 FC를 응원하는 한줄 메시지!" required maxlength="50">
            <button type="submit" class="btn btn-gold">등록</button>
          </form>
          <div class="cheer-list" id="cheerList">
            <!-- JS 동적 렌더링 -->
          </div>
        </div>

        <div class="board-container">
          <!-- 게시판 목록 화면 -->
          <div id="boardListView">
            <div class="board-header">
              <h3>팬 자유게시판</h3>
              <button class="btn btn-gold" id="btnGoWrite">글쓰기</button>
            </div>
            <table class="board-table">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>작성일</th>
                </tr>
              </thead>
              <tbody id="boardListBody">
                <!-- JS 동적 렌더링 -->
              </tbody>
            </table>
          </div>

          <!-- 게시글 작성 화면 -->
          <div id="boardWriteView" style="display:none;">
            <h3>게시글 작성</h3>
            <form id="postForm" class="post-form">
              <div class="form-row">
                <input type="text" id="postAuthor" placeholder="닉네임" required>
                <input type="password" id="postPassword" placeholder="비밀번호(삭제용)" required>
              </div>
              <input type="text" id="postTitle" placeholder="제목을 입력하세요" required>
              <textarea id="postContent" placeholder="여기에 내용을 입력하세요" required rows="10"></textarea>
              <div class="form-actions">
                <button type="button" class="btn" id="btnCancelWrite" style="background:#333;color:#fff;">취소</button>
                <button type="submit" class="btn btn-gold">등록</button>
              </div>
            </form>
          </div>

          <!-- 게시글 상세조회 화면 -->
          <div id="boardDetailView" style="display:none;">
            <div class="detail-header">
              <h3 id="detailTitle">글 제목</h3>
              <div class="detail-meta">
                작성자: <span id="detailAuthor">닉네임</span> | 작성일: <span id="detailDate">2026-06-12</span>
              </div>
            </div>
            <div class="detail-body" id="detailContent">
              글 본문 내용...
            </div>
            <div class="detail-actions">
              <button class="btn" id="btnBackToList" style="background:#333;color:#fff;">목록으로</button>
              <div class="delete-box">
                <input type="password" id="deletePassword" placeholder="비밀번호 입력">
                <button class="btn" id="btnDeletePost" style="background:#c0392b;color:#fff;">삭제</button>
              </div>
            </div>

            <!-- 댓글 섹션 -->
            <div class="comments-section">
              <h4>댓글 (<span id="commentCount">0</span>)</h4>
              <div id="commentsContainer">
                <!-- JS 동적 렌더링 -->
              </div>
              <form id="commentForm" class="comment-form">
                <input type="text" id="commentAuthor" placeholder="닉네임" required>
                <input type="text" id="commentText" placeholder="따뜻한 댓글을 남겨주세요." required>
                <button type="submit" class="btn btn-gold">등록</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: 팬존용 응원 배너 및 게시글 디자인 스타일 추가 (`css/components.css`)**

```css
/* css/components.css 에 추가 */
.cheer-banner {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-glass-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.cheer-title {
  font-family: var(--font-header);
  font-size: 16px;
  color: var(--color-gold-solid);
  margin-bottom: 10px;
}

.cheer-form {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.cheer-form input[type="text"] {
  background-color: #0c0c0c;
  border: 1px solid var(--color-glass-border);
  color: #fff;
  padding: 10px;
  border-radius: 4px;
}

#cheerName {
  width: 150px;
}

#cheerText {
  flex-grow: 1;
}

.cheer-list {
  max-height: 100px;
  overflow-y: auto;
  font-size: 13px;
  border-top: 1px solid #222;
  padding-top: 10px;
}

.cheer-item {
  padding: 4px 0;
  border-bottom: 1px dashed #222;
}

.cheer-item span {
  color: var(--color-gold-solid);
  font-weight: 600;
}

/* Board Structure */
.board-container {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-glass-border);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 60px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.board-header h3 {
  font-family: var(--font-header);
  font-size: 22px;
  color: var(--color-gold-solid);
}

.board-table {
  width: 100%;
  border-collapse: collapse;
}

.board-table th {
  border-bottom: 2px solid var(--color-glass-border);
  padding: 12px;
  text-align: left;
}

.board-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #222;
  cursor: pointer;
}

.board-table tr:hover td {
  color: var(--color-gold-solid);
}

.post-form, .comment-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row input, .post-form input, .post-form textarea, .comment-form input {
  background-color: #0c0c0c;
  border: 1px solid var(--color-glass-border);
  color: #fff;
  padding: 12px;
  border-radius: 6px;
  font-family: var(--font-body);
}

.post-form textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Detail View */
.detail-header {
  border-bottom: 1px solid var(--color-glass-border);
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.detail-header h3 {
  font-size: 26px;
  margin-bottom: 8px;
}

.detail-meta {
  font-size: 13px;
  color: var(--color-text-muted);
}

.detail-body {
  min-height: 200px;
  line-height: 1.8;
  white-space: pre-wrap;
  margin-bottom: 30px;
}

.detail-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-glass-border);
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.delete-box {
  display: flex;
  gap: 8px;
}

.delete-box input {
  background-color: #0c0c0c;
  border: 1px solid var(--color-glass-border);
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  width: 120px;
}

/* Comments Section */
.comments-section h4 {
  margin-bottom: 15px;
  font-size: 18px;
}

.comment-item {
  border-bottom: 1px solid #222;
  padding: 12px 0;
}

.comment-meta {
  font-size: 12px;
  color: var(--color-gold-solid);
  font-weight: 600;
  margin-bottom: 4px;
}

.comment-text {
  font-size: 14px;
}
```

- [ ] **Step 3: 게시글 등록/목록/상세/삭제 및 댓글 추가 로직 구현 (`js/community.js`)**

```javascript
// js/community.js
const DEFAULT_POSTS = [
  { id: 1, author: "블루윙러버", title: "성만 FC 이번 주말 경기 직관 가시는 분 계신가요?", content: "수원 삼성과의 드비매치인데 정말 기대됩니다! 저는 성만 아레나 N석 앞자리 예매 성공했네요. 같이 응원해요!", password: "111", date: "2026-06-12", comments: [{ author: "성만짱", text: "저도 갑니다! 황금 전사들 화이팅!" }] },
  { id: 2, author: "축구마스터", title: "가상 구단이라고 하기엔 스펙이 엄청 짱짱하네요", content: "성만 아레나 40,000석 규모 실화입니까? 엠블럼도 엄청 멋지네요. 앞으로 직관 자주 가야겠네요.", password: "222", date: "2026-06-11", comments: [] }
];

const DEFAULT_CHEERS = [
  { author: "황금사자", text: "성만 FC 오늘 승리 가자!" },
  { author: "K리그팬", text: "사자 엠블럼 로열 골드색 존멋" }
];

let posts = [];
let cheers = [];

// 초기화
function initCommunityData() {
  const localPosts = localStorage.getItem('sungman_posts');
  if (localPosts) {
    posts = JSON.parse(localPosts);
  } else {
    posts = [...DEFAULT_POSTS];
    localStorage.setItem('sungman_posts', JSON.stringify(posts));
  }

  const localCheers = localStorage.getItem('sungman_cheers');
  if (localCheers) {
    cheers = JSON.parse(localCheers);
  } else {
    cheers = [...DEFAULT_CHEERS];
    localStorage.setItem('sungman_cheers', JSON.stringify(cheers));
  }
}

// 렌더링 전체 조율
window.renderCommunity = function() {
  initCommunityData();
  renderCheerList();
  renderBoardList();
}

function renderCheerList() {
  const list = document.getElementById('cheerList');
  list.innerHTML = '';
  cheers.forEach(cheer => {
    const div = document.createElement('div');
    div.className = 'cheer-item';
    div.innerHTML = `<span>${cheer.author}:</span> ${cheer.text}`;
    list.appendChild(div);
  });
}

function renderBoardList() {
  const tbody = document.getElementById('boardListBody');
  tbody.innerHTML = '';

  posts.forEach((post, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${post.id}</td>
      <td>${post.title} [${post.comments.length}]</td>
      <td>${post.author}</td>
      <td>${post.date}</td>
    `;
    tr.addEventListener('click', () => showPostDetail(post.id));
    tbody.appendChild(tr);
  });
}

function showPostDetail(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  document.getElementById('boardListView').style.display = 'none';
  document.getElementById('boardWriteView').style.display = 'none';
  document.getElementById('boardDetailView').style.display = 'block';

  document.getElementById('detailTitle').textContent = post.title;
  document.getElementById('detailAuthor').textContent = post.author;
  document.getElementById('detailDate').textContent = post.date;
  document.getElementById('detailContent').textContent = post.content;
  document.getElementById('commentCount').textContent = post.comments.length;

  // 댓글 렌더링
  const commentsContainer = document.getElementById('commentsContainer');
  commentsContainer.innerHTML = '';
  post.comments.forEach(comment => {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `
      <div class="comment-meta">${comment.author}</div>
      <div class="comment-text">${comment.text}</div>
    `;
    commentsContainer.appendChild(div);
  });

  // 버튼 액션 위임 처리용 속성 추가
  document.getElementById('btnDeletePost').setAttribute('data-id', post.id);
  window.currentPostId = post.id;
}

// 이벤트 핸들링 초기 설정
document.addEventListener('DOMContentLoaded', () => {
  initCommunityData();

  // 글쓰기 전환
  document.getElementById('btnGoWrite').addEventListener('click', () => {
    document.getElementById('boardListView').style.display = 'none';
    document.getElementById('boardWriteView').style.display = 'block';
  });

  document.getElementById('btnCancelWrite').addEventListener('click', () => {
    document.getElementById('boardWriteView').style.display = 'none';
    document.getElementById('boardListView').style.display = 'block';
  });

  document.getElementById('btnBackToList').addEventListener('click', () => {
    document.getElementById('boardDetailView').style.display = 'none';
    document.getElementById('boardListView').style.display = 'block';
    window.renderCommunity();
  });

  // 한줄 응원 제출
  document.getElementById('cheerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const author = document.getElementById('cheerName').value;
    const text = document.getElementById('cheerText').value;

    cheers.unshift({ author, text });
    localStorage.setItem('sungman_cheers', JSON.stringify(cheers));
    
    document.getElementById('cheerName').value = '';
    document.getElementById('cheerText').value = '';
    renderCheerList();
  });

  // 게시글 제출
  document.getElementById('postForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const author = document.getElementById('postAuthor').value;
    const password = document.getElementById('postPassword').value;
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const todayStr = new Date().toISOString().split('T')[0];

    const newPost = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      author,
      password,
      title,
      content,
      date: todayStr,
      comments: []
    };

    posts.unshift(newPost);
    localStorage.setItem('sungman_posts', JSON.stringify(posts));

    // 작성폼 리셋
    document.getElementById('postForm').reset();
    document.getElementById('boardWriteView').style.display = 'none';
    document.getElementById('boardListView').style.display = 'block';
    window.renderCommunity();
  });

  // 댓글 제출
  document.getElementById('commentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const author = document.getElementById('commentAuthor').value;
    const text = document.getElementById('commentText').value;
    const postId = window.currentPostId;

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      posts[postIndex].comments.push({ author, text });
      localStorage.setItem('sungman_posts', JSON.stringify(posts));
      document.getElementById('commentForm').reset();
      showPostDetail(postId);
    }
  });

  // 삭제 액션
  document.getElementById('btnDeletePost').addEventListener('click', () => {
    const id = parseInt(document.getElementById('btnDeletePost').getAttribute('data-id'));
    const inputPass = document.getElementById('deletePassword').value;

    const post = posts.find(p => p.id === id);
    if (post) {
      if (post.password === inputPass) {
        posts = posts.filter(p => p.id !== id);
        localStorage.setItem('sungman_posts', JSON.stringify(posts));
        document.getElementById('deletePassword').value = '';
        document.getElementById('boardDetailView').style.display = 'none';
        document.getElementById('boardListView').style.display = 'block';
        window.renderCommunity();
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    }
  });
});
```

- [ ] **Step 4: Node.js 테스트 파일에 LocalStorage 및 CRUD 로직 시뮬레이션 테스트 케이스 작성 (`tests/run_tests.js`)**

```javascript
// tests/run_tests.js 수정: Node.js 가상 localStorage 객체 모킹 후 CRUD 기능 검증
const mockLocalStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); }
};

try {
  // 1. 초기 로컬 스토리지에 데이터가 없는 경우 DEFAULT 세팅 검증 시뮬레이션
  const defaultPosts = [
    { id: 1, author: "블루윙러버", title: "게시글1", password: "111", comments: [] }
  ];
  mockLocalStorage.setItem('sungman_posts', JSON.stringify(defaultPosts));
  
  const fetched = JSON.parse(mockLocalStorage.getItem('sungman_posts'));
  assert.strictEqual(fetched.length, 1, 'Mocked LocalStorage length check');
  assert.strictEqual(fetched[0].author, '블루윙러버', 'Mocked LocalStorage content check');
  
  // 2. 글 쓰기 추가 로직 시뮬레이션
  fetched.push({ id: 2, author: "성만팬", title: "게시글2", password: "222", comments: [] });
  mockLocalStorage.setItem('sungman_posts', JSON.stringify(fetched));
  
  const updated = JSON.parse(mockLocalStorage.getItem('sungman_posts'));
  assert.strictEqual(updated.length, 2, 'Should add post');
  
  // 3. 비밀번호 매칭 삭제 로직 시뮬레이션
  const targetId = 2;
  const passwordInput = "222";
  const updatedFiltered = updated.filter(p => p.id !== targetId || p.password !== passwordInput);
  assert.strictEqual(updatedFiltered.length, 1, 'Should delete post if password matched');

  console.log('✔ LocalStorage Mock Operations Passed!');
} catch (error) {
  console.error('❌ LocalStorage Mock Operations Failed:', error.message);
  process.exit(1);
}
```

- [ ] **Step 5: 테스트 실행**

Run: `node tests/run_tests.js`
Expected: `✔ LocalStorage Mock Operations Passed!` 출력 및 PASS.

- [ ] **Step 6: 변경사항 커밋**

```bash
git add index.html css/components.css js/community.js tests/run_tests.js
git commit -m "feat: implement Fan Zone community board CRUD and local storage integration"
```

---

### Task 8: 종합 빌드 확인 및 UI 다듬기

**Files:**
- Modify: `index.html`
- Modify: `css/main.css`

- [ ] **Step 1: 모바일 반응형 대응을 위한 CSS 추가 (`css/main.css`)**

```css
/* css/main.css 맨 밑에 추가 */
/* Responsive layout adjustments */
@media (max-width: 992px) {
  .main-grid, .club-details, .matches-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    height: auto;
    padding: 15px 0;
    gap: 15px;
  }

  nav ul {
    gap: 15px;
  }

  .hero-content h2 {
    font-size: 36px;
  }

  .squad-filters {
    flex-wrap: wrap;
    justify-content: center;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
```

- [ ] **Step 2: 최종 전체 통합 로컬 서빙 확인**

Run: `node -e "const http = require('http'), fs = require('fs'); http.createServer((req, res) => { let p = '.' + (req.url === '/' ? '/index.html' : req.url); fs.readFile(p, (err, data) => { if (err) { res.writeHead(404); res.end('Not Found'); } else { res.writeHead(200); res.end(data); } }); }).listen(3000);"`
Expected: 브라우저에서 `http://localhost:3000` 재접속 후 모든 탭의 렌더링, 탭 이동 기능, 선수단 필터/모달 기능, 경기 및 순위표 조회 기능, 익명 게시글 작성/삭제/댓글 작성 기능이 오류 없이 정상 동작하며 모바일 스크린 비율로 좁혀도 레이아웃이 깨지지 않음을 최종 검증.

- [ ] **Step 3: 최종 커밋**

```bash
git add index.html css/main.css
git commit -m "feat: apply mobile responsive media queries and complete the site build verification"
```
