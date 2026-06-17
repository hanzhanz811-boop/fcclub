# 성만 FC PWA 시스템 업그레이드 설계 사양서

## 1. 개요 및 목적
성만 FC 공식 웹사이트에 PWA(Progressive Web App)를 도입하여 모바일 기기 홈 화면에 앱 아이콘을 추가하고(설치 지원), 네트워크가 원활하지 않은 오프라인 환경에서도 핵심 웹 리소스를 캐싱하여 부드럽고 가속화된 로딩 속도를 유지하도록 지원합니다.

---

## 2. PWA 구성 및 설정 명세

### 2.1 manifest.json (웹 앱 매니페스트) 사양
모바일 환경 설치 사양 및 브랜드 색상 테마를 정의합니다.
* **파일 위치**: `J:/project/fcclub/manifest.json`
* **세부 필드 규격**:
  * `name`: "SUNGMAN FC Club" (앱의 전체 이름)
  * `short_name`: "성만 FC" (홈 화면 아이콘 아래 표시될 짧은 이름)
  * `start_url`: "/index.html" (앱 구동 시 첫 시작 페이지)
  * `display`: "standalone" (주소창과 하단바를 숨겨 완전한 단독 모바일 앱처럼 렌더링)
  * `orientation`: "portrait-primary" (세로 모드 고정)
  * `background_color`: "#0c0d12" (성만 FC 브랜드 고유의 어두운 배경색)
  * `theme_color`: "#d4af37" (앱 상단 툴바 및 인디케이터에 반영될 메인 골드 색상)
  * `icons`: 기기 해상도 대응용 192x192 및 512x512 크기의 png 로고 리소스를 매핑하며, 마스커블 아이콘(`purpose: "any maskable"`) 요건 충족.

### 2.2 index.html PWA 진입 마크업 설계
웹 브라우저가 manifest.json을 탐색하고 서비스 워커를 비동기 기동하도록 주입합니다.
* **메타 연동**:
  ```html
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#d4af37">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ```
* **서비스 워커 등록 스크립트**:
  `body` 닫는 태그 직전 혹은 적절한 스크립트 로딩 영역에 탑재하여 브라우저 로딩을 방해하지 않고 등록을 수행합니다.
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

---

## 3. 서비스 워커(sw.js) 및 오프라인 캐싱 설계

* **파일 위치**: `J:/project/fcclub/sw.js`
* **캐시명**: `sungmanfc-cache-v1` (배포 및 리소스 갱신 시 v2, v3 등으로 증가)
* **캐시 리소스 지정**:
  오프라인 구동 시 필수적으로 메모리에 적재되어야 하는 정적 자산 경로들을 지정합니다.
  - `/`
  - `/index.html`
  - `/css/style.css`
  - `/css/components.css`
  - `/js/data.js`
  - `/js/community.js`
  - `/js/app.js`
  - `/assets/stadium_bg.png`
  - `/assets/logo.png`
* **생명주기(Lifecycle) 핸들링**:
  1. **install**: `ASSETS_TO_CACHE`에 선언된 정적 자산들을 캐싱 공간에 저장하고 `self.skipWaiting()`으로 새 서비스 워커를 즉각 활성화합니다.
  2. **activate**: 새 캐시 명칭이 감지되면 구버전 캐시 공간을 스캔하여 일괄 파기 및 소거하고 `self.clients.claim()`으로 제어권을 확보합니다.
  3. **fetch (Cache-First / Stale-While-Revalidate)**:
     - 네비게이션 요청이나 미리 선언된 정적 자산 요청은 기기 내 캐시된 버전이 있으면 즉시 응답을 전송하고, 동시에 백그라운드로 원격 fetch를 쏘아 서버에서 변경된 내용을 다운로드해 캐시를 최신 상태로 유지(SWR)합니다.
     - 로컬스토리지를 적극 활용하는 게시판, 선수단, 경기 목록 등 동적 데이터 요청은 캐싱 범위에서 안전하게 배제하여 정합성 버그를 예방합니다.

---

## 4. 테스트 및 품질 검증 사양
`tests/run_tests.js`의 테스트 스위트에 `runPWAFilesTests()` 블록을 추가하여 빌드 신뢰성을 확인합니다.
* **진입점 마크업 연결 테스트**: `index.html` 파일 내부를 읽어 manifest.json 링크 및 serviceWorker 등록 스크립트 존재를 검사합니다.
* **매니페스트 구조 유효성 테스트**: 물리적인 `manifest.json` 파일 여부를 검사하고 정상적인 JSON 데이터 구조로 기재되었는지, `short_name: "성만 FC"` 및 `display: "standalone"` 속성이 온전히 파싱되는지 검증합니다.
* **서비스 워커 파일 유효성 테스트**: `sw.js`가 정상 위치에 존재하는지, 내부에 캐시 공간 명명부와 생명주기 이벤트 핸들러(`install`, `activate`)가 알맞게 작성되어 동작하고 있는지 텍스트 매칭을 실시합니다.
