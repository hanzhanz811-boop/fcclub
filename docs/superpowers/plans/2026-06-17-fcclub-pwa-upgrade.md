# 성만 FC PWA 시스템 업그레이드 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 성만 FC 홈페이지를 PWA(Progressive Web App)로 전환하여 홈 화면 추가 설치를 가능하게 하고, 서비스 워커의 정적 자산 캐싱을 통해 네트워크 불안정 시에도 오프라인 구동 성능을 보장합니다.

**Architecture:** 
- `manifest.json`을 추가하여 모바일 설치에 필요한 앱 아이콘, 독립 구동 테마색, 명칭 메타데이터를 기입합니다.
- `sw.js`를 작성해 정적 리소스(HTML, CSS, JS, 주요 이미지)를 Cache-First 방식으로 오프라인 캐싱하고, 백그라운드 갱신(Stale-While-Revalidate) 주기를 활성화합니다.
- `index.html` 헤더에 매니페스트를 연결하고 기기 로드 시 서비스 워커를 등록하는 기동 로더 스크립트를 삽입합니다.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Service Worker API, Node.js Test Runner

---

### Task 1: manifest.json 생성 및 매니페스트 파일 유효성 검사

**Files:**
- Create: `manifest.json`
- Modify: `tests/run_tests.js` (`runPWAFilesTests` 뼈대 및 매니페스트 검사 로직 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js` 하단에 PWA 파일 검증을 위한 `runPWAFilesTests()` 함수를 추가하고, `manifest.json`이 존재하고 올바른 JSON 속성(`short_name: "성만 FC"`, `display: "standalone"`)을 가지는지 검증하는 코드를 먼저 적습니다.
  ```javascript
  function runPWAFilesTests() {
    const fs = require('fs');
    const path = require('path');

    // manifest.json 검증
    const manifestPath = path.join(__dirname, '../manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'manifest.json file must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.strictEqual(manifest.short_name, '성만 FC', 'short_name should match SUNGMAN FC');
    assert.strictEqual(manifest.display, 'standalone', 'display mode should be standalone');
  }
  ```
  그리고 `tests/run_tests.js` 맨 하단(SUMMARY 출력 전)에 `runTestBlock('PWA Files Integrity Tests (runPWAFilesTests)', runPWAFilesTests);`를 등록합니다.

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL (`manifest.json` 파일이 없음)

- [ ] **Step 3: manifest.json 파일 생성 및 구현**
  프로젝트 루트 폴더에 `manifest.json` 파일을 다음과 같이 작성합니다.
  ```json
  {
    "name": "SUNGMAN FC Club",
    "short_name": "성만 FC",
    "start_url": "/index.html",
    "display": "standalone",
    "orientation": "portrait-primary",
    "background_color": "#0c0d12",
    "theme_color": "#d4af37",
    "icons": [
      {
        "src": "assets/stadium_bg.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "assets/stadium_bg.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  }
  ```

- [ ] **Step 4: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 5: Git 커밋**
  Run: `git commit -am "feat: add manifest.json for SUNGMAN FC PWA configurations"`

---

### Task 2: sw.js (Service Worker) 생성 및 정적 자산 캐싱 로직 구현

**Files:**
- Create: `sw.js`
- Modify: `tests/run_tests.js` (`runPWAFilesTests` 내부 서비스 워커 구조 검증 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js` 내 `runPWAFilesTests()` 함수 내부 하단에 서비스 워커 파일이 존재하고 캐시 명칭 설정과 생명주기 이벤트(`install`, `activate`) 핸들러가 포함되어 있는지 검증하는 단계를 추가합니다.
  ```javascript
  // sw.js 검증
  const swPath = path.join(__dirname, '../sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js file must exist');
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert.ok(swContent.includes('sungmanfc-cache'), 'sw.js should declare a cache name');
  assert.ok(swContent.includes('install'), 'sw.js should listen to install event');
  assert.ok(swContent.includes('activate'), 'sw.js should listen to activate event');
  ```

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL (`sw.js` 파일이 없음)

- [ ] **Step 3: sw.js 파일 생성 및 오프라인 캐싱 로직 구현**
  프로젝트 루트 폴더에 `sw.js` 파일을 다음과 같이 작성합니다.
  ```javascript
  const CACHE_NAME = 'sungmanfc-cache-v1';
  const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/components.css',
    '/js/data.js',
    '/js/community.js',
    '/js/app.js',
    '/assets/stadium_bg.png'
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache and pre-caching assets');
          return cache.addAll(ASSETS_TO_CACHE);
        })
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate' || ASSETS_TO_CACHE.some(asset => event.request.url.includes(asset))) {
      event.respondWith(
        caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse);
                  });
                }
              }).catch(() => {});
              return cachedResponse;
            }
            return fetch(event.request);
          })
      );
    }
  });
  ```

- [ ] **Step 4: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 5: Git 커밋**
  Run: `git commit -am "feat: implement sw.js offline assets cache lifecycle"`

---

### Task 3: index.html PWA 진입 마크업 주입 및 런타임 활성화

**Files:**
- Modify: `index.html` (매니페스트 헤더 추가 및 sw.js 로더 작성)
- Modify: `tests/run_tests.js` (`runPWAFilesTests` 내 html 마크업 존재 검사 추가)

- [ ] **Step 1: 테스트 실패 케이스 작성**
  `tests/run_tests.js` 내 `runPWAFilesTests()` 함수 내부 첫 머리에 `index.html`을 읽어 manifest 및 serviceWorker 관련 태그가 온전히 들어있는지 검사하는 코드를 추가합니다.
  ```javascript
  // index.html 검증
  const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.ok(htmlContent.includes('manifest.json'), 'index.html should link manifest.json');
  assert.ok(htmlContent.includes('navigator.serviceWorker'), 'index.html should register Service Worker');
  ```

- [ ] **Step 2: 테스트 실행 및 실패 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL (`index.html`에 해당 구문이 없음)

- [ ] **Step 3: index.html 수정 및 연동**
  - `index.html` 헤더 영역에 다음 태그를 주입합니다.
    ```html
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#d4af37">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    ```
  - `index.html` body 태그 닫히기 직전(스크립트 로드부 아래)에 다음 서비스 워커 로딩 스크립트를 삽입합니다.
    ```html
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered successfully:', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
        });
      }
    </script>
    ```

- [ ] **Step 4: 테스트 실행 및 패스 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 5: Git 최종 커밋**
  Run: `git commit -am "feat: link manifest.json and register sw.js loader inside index.html"`
