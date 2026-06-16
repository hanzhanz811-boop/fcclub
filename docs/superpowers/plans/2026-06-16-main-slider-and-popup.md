# 메인 이미지 슬라이더 및 팝업 관리 기능 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 메인 홈 화면에 어둡고 흐리게 필터 처리된 3장 제한의 자동 페이드 이미지 슬라이더를 도입하고, 24시간 보지 않기 옵션과 유튜브/mp4 자동 변환 재생이 탑재된 관리자 제어형 메인 팝업 시스템을 구현합니다.

**Architecture:**
- `localStorage`의 `mainSliderData`와 `mainPopupData`를 읽어 홈 화면 진입 시 동적으로 백그라운드 슬라이더 레이어와 팝업 모달을 마운트합니다.
- 슬라이더는 CSS `opacity` 전환과 자바스크립트 `setInterval` 타이머를 통해 구동하며, 관리자 폼에서 업로드된 파일 크기(1.5MB 제한) 및 이미지 형식을 검사해 Base64 형태로 직렬화하여 영속 저장합니다.
- 팝업은 유튜브 주소 입력 시 자동으로 임베드 주소로 치환하여 `iframe`을 빌드하며, 24시간 닫기 클릭 시 `popup_hide_until` 스토리지 타임스탬프를 대조해 팝업 생성을 방지합니다.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Node.js Test Runner

---

### Task 1: CSS Styles for Slider and Popup Modal

**Files:**
- Modify: `css/components.css`

- [ ] **Step 1: 슬라이더 배경 및 팝업 모달 스타일 시트 작성**
  `css/components.css` 파일의 하단에 아래 CSS 규칙들을 추가합니다.
  ```css
  /* 메인 배경 슬라이더 관련 스타일 */
  .hero-slider-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
  }
  
  .hero-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 1.5s ease-in-out;
    filter: brightness(0.35) blur(5px);
  }
  
  .hero-slide.active {
    opacity: 1;
  }
  
  /* 메인 팝업 모달 스타일 */
  .main-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  
  .main-popup-overlay.is-visible {
    display: flex;
  }
  
  .main-popup-container {
    background: var(--color-glass-bg);
    border: 1px solid var(--color-glass-border);
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  
  .main-popup-header {
    padding: 15px 20px;
    border-bottom: 1px solid var(--color-glass-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .main-popup-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--color-gold-solid);
  }
  
  .main-popup-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .main-popup-media-wrapper {
    width: 100%;
    border-radius: 6px;
    overflow: hidden;
    background: #000;
  }
  
  .main-popup-img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
  }
  
  .main-popup-video-container {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%; /* 16:9 ratio */
    height: 0;
  }
  
  .main-popup-video-container iframe,
  .main-popup-video-container video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  
  .main-popup-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--color-glass-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.2);
  }
  
  .main-popup-checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--color-text-muted);
    cursor: pointer;
  }
  
  .main-popup-checkbox-label input {
    cursor: pointer;
  }
  
  .btn-popup-close {
    background: transparent;
    border: 1px solid var(--color-glass-border);
    color: var(--color-text-primary);
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: var(--transition-smooth);
  }
  
  .btn-popup-close:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  ```

- [ ] **Step 2: CSS 추가 Git 커밋**
  Run: `git add css/components.css`
  Run: `git commit -m "style: add styles for background slider and notice popup modal"`

---

### Task 2: Background Slider Logic and Admin Panel Integration

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: 메인 탭 렌더링에 슬라이더 동적 마운트 로직 적용**
  `js/app.js` 파일에서 `initRouter` 또는 홈 렌더링 부근에 슬라이더 초기화 함수를 설계합니다.
  기존 HTML의 `.hero-section` 안에 정적으로 박혀 있던 배경 이미지를 지우고 동적 레이어를 생성합니다.
  ```javascript
  // js/app.js 내에 추가할 전역 변수 및 슬라이더 초기화 로직
  let sliderTimer = null;
  
  function initMainSlider() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
  
    // 기존 배경 이미지 인라인 스타일 및 불필요 정적 배경 노출 방지
    hero.style.backgroundImage = 'none';
  
    // 기존 슬라이더 요소가 존재하면 정리
    const oldSlider = hero.querySelector('.hero-slider-bg');
    if (oldSlider) oldSlider.remove();
    if (sliderTimer) clearInterval(sliderTimer);
  
    // localStorage 데이터 로드
    let sliderData = [];
    try {
      sliderData = JSON.parse(localStorage.getItem('mainSliderData')) || [];
    } catch (e) {
      sliderData = [];
    }
  
    // 등록된 이미지가 없으면 디폴트 리스트 적용 (Fallback)
    if (sliderData.length === 0) {
      sliderData = [
        { id: 1, image: 'assets/hero-bg.jpg' } // 기존 정적 배경 이미지 경로
      ];
    }
  
    const sliderBg = document.createElement('div');
    sliderBg.className = 'hero-slider-bg';
  
    sliderData.forEach((item, idx) => {
      const slide = document.createElement('div');
      slide.className = `hero-slide ${idx === 0 ? 'active' : ''}`;
      // XSS 방지를 위한 escapeHTML 적용
      slide.style.backgroundImage = `url('${escapeHTML(item.image)}')`;
      sliderBg.appendChild(slide);
    });
  
    // 기존 히어로 내용 맨 앞에 주입 (글자 내용 위로 올라오도록)
    hero.insertBefore(sliderBg, hero.firstChild);
  
    // 2장 이상일 때만 인터벌 전환 작동
    if (sliderData.length > 1) {
      const slides = sliderBg.querySelectorAll('.hero-slide');
      let currentIdx = 0;
      sliderTimer = setInterval(() => {
        slides[currentIdx].classList.remove('active');
        currentIdx = (currentIdx + 1) % slides.length;
        slides[currentIdx].classList.add('active');
      }, 5000);
    }
  }
  ```
  * `switchTab(tabId)` 함수 시작 부분 혹은 `renderSquad` 근처 등 홈 화면이 렌더링될 때 `initMainSlider()`가 수행되도록 삽입합니다.

- [ ] **Step 2: 관리자 페이지에 메인 슬라이더 등록/삭제 UI 이식**
  * `showAdminDashboard()` 내에 '메인 이미지 관리' 서브 탭을 렌더링하는 HTML을 마운트하고 폼 바인딩 리스너를 구현합니다.
  * 3장 초과 등록을 사전에 원천 차단하는 유효성 로직과 `FileReader`를 탑재합니다.
  ```javascript
  // js/app.js: 관리자 메인 슬라이더 렌더링 함수 추가
  function renderAdminSlider() {
    const container = document.getElementById('adminSliderContent');
    if (!container) return;
  
    let sliderData = [];
    try {
      sliderData = JSON.parse(localStorage.getItem('mainSliderData')) || [];
    } catch (e) {
      sliderData = [];
    }
  
    let listHtml = '';
    sliderData.forEach(item => {
      listHtml += `
        <div style="display: flex; align-items: center; gap: 15px; border: 1px solid var(--color-glass-border); padding: 10px; border-radius: 6px; background: rgba(0,0,0,0.2);">
          <img src="${escapeHTML(item.image)}" style="width: 80px; height: 45px; object-fit: cover; border-radius: 4px;">
          <div style="flex: 1; font-size: 13px; color: var(--color-text-muted);">등록된 이미지 (ID: ${item.id})</div>
          <button class="btn btn-outline btn-sm" onclick="deleteSliderImage(${item.id})" style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3);">삭제</button>
        </div>
      `;
    });
  
    if (sliderData.length === 0) {
      listHtml = '<p style="color: var(--color-text-muted); font-size: 14px;">등록된 커스텀 배경 이미지가 없습니다. (기본 이미지가 출력됩니다.)</p>';
    }
  
    const isLimitReached = sliderData.length >= 3;
  
    container.innerHTML = `
      <h4 style="color: var(--color-gold-solid); margin-bottom: 10px;">메인 슬라이더 이미지 목록 (최대 3장)</h4>
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        ${listHtml}
      </div>
      
      <div style="border-top: 1px solid var(--color-glass-border); padding-top: 20px;">
        <h4 style="color: var(--color-gold-solid); margin-bottom: 15px;">신규 이미지 등록</h4>
        <form id="adminSliderUploadForm" style="display: flex; flex-direction: column; gap: 15px;">
          <div class="admin-form-group">
            <label>배경 이미지 파일 (권장: 1920x1080, PNG/JPG/WebP)</label>
            <div style="display: flex; gap: 15px; align-items: center; margin-top: 5px;">
              <div id="adminSliderImagePreview" style="width: 160px; height: 90px; border-radius: 6px; border: 1px solid var(--color-glass-border); display: flex; align-items: center; justify-content: center; overflow: hidden; background: rgba(0,0,0,0.3); flex-shrink: 0;">
                <span style="font-size: 12px; color: var(--color-text-muted);">미리보기</span>
              </div>
              <div style="flex: 1;">
                <input type="file" id="sliderImageFile" accept="image/*" style="display: none;" aria-label="슬라이더 이미지 파일 선택">
                <button type="button" class="btn btn-outline btn-sm" id="btnTriggerSliderUpload" ${isLimitReached ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>파일 선택</button>
                <p style="font-size: 12px; color: var(--color-text-muted); margin-top: 5px; margin-bottom: 0;">
                  ${isLimitReached ? '이미 최대 3장의 이미지가 모두 등록되어 추가할 수 없습니다.' : '1.5MB 이하의 파일만 업로드할 수 있습니다.'}
                </p>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-gold" id="btnSaveSliderImage" ${isLimitReached ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>이미지 추가</button>
        </form>
      </div>
    `;
  
    // 이벤트 바인딩
    const fileInput = document.getElementById('sliderImageFile');
    const triggerBtn = document.getElementById('btnTriggerSliderUpload');
    const previewDiv = document.getElementById('adminSliderImagePreview');
    const uploadForm = document.getElementById('adminSliderUploadForm');
    let loadedImageData = '';
  
    if (triggerBtn && fileInput) {
      triggerBtn.addEventListener('click', () => fileInput.click());
    }
  
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            fileInput.value = '';
            return;
          }
          if (file.size > 1500000) {
            alert('1.5MB 이하의 이미지만 업로드 가능합니다.');
            fileInput.value = '';
            return;
          }
  
          const reader = new FileReader();
          reader.onerror = () => {
            alert('파일을 읽는 도중 오류가 발생했습니다.');
            fileInput.value = '';
          };
          reader.onload = (event) => {
            loadedImageData = event.target.result;
            // XSS 안전한 DOM 조작 미리보기
            previewDiv.innerHTML = '';
            const img = document.createElement('img');
            img.src = loadedImageData;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.alt = '슬라이더 이미지 미리보기';
            previewDiv.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  
    if (uploadForm) {
      uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (sliderData.length >= 3) {
          alert('슬라이더 이미지는 최대 3장까지만 등록 가능합니다.');
          return;
        }
        if (!loadedImageData) {
          alert('업로드할 이미지를 선택해 주세요.');
          return;
        }
  
        const newItem = {
          id: Date.now(),
          image: loadedImageData
        };
        sliderData.push(newItem);
        localStorage.setItem('mainSliderData', JSON.stringify(sliderData));
        alert('배경 이미지가 정상적으로 등록되었습니다.');
        
        renderAdminSlider();
        initMainSlider();
      });
    }
  }
  
  // 글로벌 스코프 노출 처리
  window.deleteSliderImage = function(id) {
    if (!confirm('해당 배경 이미지를 삭제하시겠습니까?')) return;
    let sliderData = [];
    try {
      sliderData = JSON.parse(localStorage.getItem('mainSliderData')) || [];
    } catch (e) {
      sliderData = [];
    }
    sliderData = sliderData.filter(item => item.id !== id);
    localStorage.setItem('mainSliderData', JSON.stringify(sliderData));
    
    renderAdminSlider();
    initMainSlider();
  };
  ```

- [ ] **Step 3: 슬라이더 기능 바인딩 및 저장 Git 커밋**
  Run: `git add js/app.js`
  Run: `git commit -m "feat: implement main background image slider and admin slider manager"`

---

### Task 3: Main Popup Notice System and Media Handling

**Files:**
- Modify: `js/app.js`
- Modify: `index.html`

- [ ] **Step 1: index.html 에 팝업 모달 골격 요소 마운트**
  `index.html` 파일 내 `<body>` 하단(가장 끝 부분)에 팝업 오버레이와 컨테이너를 정적으로 주입합니다.
  ```html
  <!-- index.html 수정: body 닫는 태그 바로 위에 추가 -->
  <div id="mainNoticePopup" class="main-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popupTitle">
    <div class="main-popup-container">
      <div class="main-popup-header">
        <h3 id="popupTitle">SUNGMAN FC 공지</h3>
      </div>
      <div class="main-popup-body" id="popupBodyContent">
        <!-- 동적 미디어 삽입 -->
      </div>
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

- [ ] **Step 2: 팝업 생성기 및 24시간 보지 않기 차단 기능 이식**
  * `js/app.js`에 유튜브 파싱 헬퍼 함수, 팝업 렌더러 함수, 닫기 이벤트 핸들러를 구성합니다.
  ```javascript
  // js/app.js 내에 추가할 유튜브 ID 파싱 및 팝업 제어 로직
  function parseYoutubeEmbedUrl(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  }
  
  function checkAndShowPopup() {
    // 24시간 닫기 타임스탬프 체크
    const hideUntil = localStorage.getItem('popup_hide_until');
    if (hideUntil && Date.now() < Number(hideUntil)) {
      return; // 노출 차단 기간 중임
    }
  
    // 팝업 설정 로드
    let popupConfig = null;
    try {
      popupConfig = JSON.parse(localStorage.getItem('mainPopupData'));
    } catch (e) {
      popupConfig = null;
    }
  
    if (!popupConfig || !popupConfig.active) {
      return; // 비활성 상태
    }
  
    const overlay = document.getElementById('mainNoticePopup');
    const title = document.getElementById('popupTitle');
    const body = document.getElementById('popupBodyContent');
    if (!overlay || !body) return;
  
    title.textContent = escapeHTML(popupConfig.title || 'SUNGMAN FC 공지');
    body.innerHTML = '';
  
    const wrapper = document.createElement('div');
    wrapper.className = 'main-popup-media-wrapper';
  
    if (popupConfig.type === 'image') {
      const img = document.createElement('img');
      img.src = escapeHTML(popupConfig.mediaUrl);
      img.alt = escapeHTML(popupConfig.title) + ' 이미지 공지';
      img.className = 'main-popup-img';
      // 이미지 클릭 시 링크 이동 (존재하는 경우)
      if (popupConfig.link) {
        const anchor = document.createElement('a');
        anchor.href = escapeHTML(popupConfig.link);
        anchor.target = '_blank';
        anchor.appendChild(img);
        wrapper.appendChild(anchor);
      } else {
        wrapper.appendChild(img);
      }
    } else {
      const videoContainer = document.createElement('div');
      videoContainer.className = 'main-popup-video-container';
      
      const parsedUrl = parseYoutubeEmbedUrl(popupConfig.mediaUrl);
      if (parsedUrl.includes('youtube.com/embed/')) {
        const iframe = document.createElement('iframe');
        iframe.src = escapeHTML(parsedUrl);
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        videoContainer.appendChild(iframe);
      } else {
        const video = document.createElement('video');
        video.src = escapeHTML(popupConfig.mediaUrl);
        video.controls = true;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        videoContainer.appendChild(video);
      }
      wrapper.appendChild(videoContainer);
    }
  
    body.appendChild(wrapper);
    overlay.classList.add('is-visible');
  }
  
  // 팝업 리스너 연동 (init Router/App 로드 시 1회 호출)
  function initPopupEvents() {
    const overlay = document.getElementById('mainNoticePopup');
    const closeBtn = document.getElementById('btnCloseNoticePopup');
    const chk24h = document.getElementById('chkHidePopup24h');
    if (!overlay || !closeBtn) return;
  
    closeBtn.addEventListener('click', () => {
      if (chk24h && chk24h.checked) {
        // 현재 시간 기준 24시간 뒤의 타임스탬프 계산 및 기록
        const expiry = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('popup_hide_until', String(expiry));
      }
      overlay.classList.remove('is-visible');
    });
  }
  ```
  * `switchTab(tabId)` 에서 `tabId === 'home'` 일 때 `checkAndShowPopup()`을 실행하고, 어플리케이션 초기 구동 시 `initPopupEvents()`를 실행하도록 심습니다.

- [ ] **Step 3: 관리자 페이지에 팝업 제어 폼 UI 연동**
  * `showAdminDashboard()` 탭 하단에 '팝업 환경 설정' 폼 서브 메뉴를 구축하고, 저장 이벤트를 맵핑합니다.
  ```javascript
  // js/app.js: 관리자 팝업 렌더링 함수 추가
  function renderAdminPopup() {
    const container = document.getElementById('adminPopupContent');
    if (!container) return;
  
    let popupConfig = { active: false, type: 'image', title: '', mediaUrl: '', link: '' };
    try {
      const raw = localStorage.getItem('mainPopupData');
      if (raw) popupConfig = { ...popupConfig, ...JSON.parse(raw) };
    } catch (e) {
      // 기본값 사용
    }
  
    container.innerHTML = `
      <h4 style="color: var(--color-gold-solid); margin-bottom: 15px;">메인 팝업 노출 및 미디어 관리</h4>
      <form id="adminPopupConfigForm" style="display: flex; flex-direction: column; gap: 15px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
          <input type="checkbox" id="popupActive" ${popupConfig.active ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
          <label for="popupActive" style="font-weight: bold; cursor: pointer;">메인 페이지 팝업 띄우기 (활성화)</label>
        </div>
        
        <div class="admin-form-group">
          <label for="popupTitleInput">팝업 제목 (공지명)</label>
          <input type="text" id="popupTitleInput" required value="${escapeHTML(popupConfig.title)}" placeholder="예: SUNGMAN FC 특별 공지">
        </div>
  
        <div class="admin-form-group">
          <label>팝업 콘텐츠 미디어 형식</label>
          <div style="display: flex; gap: 20px; margin-top: 5px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" name="popupType" value="image" ${popupConfig.type === 'image' ? 'checked' : ''} style="cursor: pointer;"> 이미지
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" name="popupType" value="video" ${popupConfig.type === 'video' ? 'checked' : ''} style="cursor: pointer;"> 동영상 (비디오)
            </label>
          </div>
        </div>
  
        <!-- 이미지 설정 영역 -->
        <div id="popupImageFieldArea" style="display: ${popupConfig.type === 'image' ? 'block' : 'none'}; border: 1px dashed var(--color-glass-border); padding: 15px; border-radius: 6px; background: rgba(0,0,0,0.1);">
          <div class="admin-form-group">
            <label>공지 이미지 등록 (파일 선택 또는 이미지 URL 입력)</label>
            <div style="display: flex; gap: 15px; align-items: center; margin-top: 5px; margin-bottom: 10px;">
              <div id="adminPopupImgPreview" style="width: 100px; height: 100px; border-radius: 6px; border: 1px solid var(--color-glass-border); display: flex; align-items: center; justify-content: center; overflow: hidden; background: rgba(0,0,0,0.3); flex-shrink: 0;">
                <span style="font-size: 11px; color: var(--color-text-muted);">미리보기</span>
              </div>
              <div style="flex: 1;">
                <input type="file" id="popupImageFile" accept="image/*" style="display: none;" aria-label="팝업 이미지 파일 선택">
                <button type="button" class="btn btn-outline btn-sm" id="btnTriggerPopupImgUpload">파일 업로드</button>
                <p style="font-size: 11px; color: var(--color-text-muted); margin-top: 5px; margin-bottom: 0;">1.5MB 이하의 파일만 업로드할 수 있습니다.</p>
              </div>
            </div>
            <label for="popupImageUrlInput" style="font-size: 12px; margin-top: 10px;">또는 외부 이미지 주소(URL)</label>
            <input type="text" id="popupImageUrlInput" value="${popupConfig.type === 'image' ? escapeHTML(popupConfig.mediaUrl) : ''}" placeholder="예: https://example.com/image.jpg" style="margin-top: 5px;">
          </div>
          
          <div class="admin-form-group" style="margin-top: 15px;">
            <label for="popupLinkInput">이미지 클릭 시 이동할 링크 URL (선택사항)</label>
            <input type="text" id="popupLinkInput" value="${escapeHTML(popupConfig.link || '')}" placeholder="https://example.com/event">
          </div>
        </div>
  
        <!-- 동영상 설정 영역 -->
        <div id="popupVideoFieldArea" style="display: ${popupConfig.type === 'video' ? 'block' : 'none'}; border: 1px dashed var(--color-glass-border); padding: 15px; border-radius: 6px; background: rgba(0,0,0,0.1);">
          <div class="admin-form-group">
            <label for="popupVideoUrlInput">동영상 재생 주소 (유튜브 링크 또는 mp4 URL)</label>
            <input type="text" id="popupVideoUrlInput" value="${popupConfig.type === 'video' ? escapeHTML(popupConfig.mediaUrl) : ''}" placeholder="예: https://www.youtube.com/watch?v=영상ID 또는 https://example.com/video.mp4" style="margin-top: 5px;">
            <p style="font-size: 11px; color: var(--color-text-muted); margin-top: 5px; margin-bottom: 0;">* 유튜브 주소는 공유 링크, 일반 주소 등을 넣으면 모달에서 자동으로 임베드 주소로 변환되어 적용됩니다.</p>
          </div>
        </div>
  
        <button type="submit" class="btn btn-gold" style="margin-top: 10px;">팝업 환경 설정 저장</button>
      </form>
    `;
  
    // DOM 제어 맵핑
    const imgField = document.getElementById('popupImageFieldArea');
    const vidField = document.getElementById('popupVideoFieldArea');
    const radios = document.getElementsByName('popupType');
    const fileInput = document.getElementById('popupImageFile');
    const triggerBtn = document.getElementById('btnTriggerPopupImgUpload');
    const previewDiv = document.getElementById('adminPopupImgPreview');
    const urlInput = document.getElementById('popupImageUrlInput');
    const form = document.getElementById('adminPopupConfigForm');
    
    let loadedImageData = (popupConfig.type === 'image' && popupConfig.mediaUrl.startsWith('data:image/')) ? popupConfig.mediaUrl : '';
  
    // 초기 렌더링 시 미리보기 채우기
    if (popupConfig.type === 'image' && popupConfig.mediaUrl) {
      previewDiv.innerHTML = `<img src="${escapeHTML(popupConfig.mediaUrl)}" style="width: 100%; height: 100%; object-fit: contain;">`;
    }
  
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'image') {
          imgField.style.display = 'block';
          vidField.style.display = 'none';
        } else {
          imgField.style.display = 'none';
          vidField.style.display = 'block';
        }
      });
    });
  
    if (triggerBtn && fileInput) {
      triggerBtn.addEventListener('click', () => fileInput.click());
    }
  
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있습니다.');
            fileInput.value = '';
            return;
          }
          if (file.size > 1500000) {
            alert('1.5MB 이하의 이미지만 업로드 가능합니다.');
            fileInput.value = '';
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            loadedImageData = event.target.result;
            if (urlInput) urlInput.value = ''; // URL 텍스트 필드 클리어
            previewDiv.innerHTML = '';
            const img = document.createElement('img');
            img.src = loadedImageData;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            previewDiv.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const active = document.getElementById('popupActive').checked;
        const title = document.getElementById('popupTitleInput').value.trim();
        const selectedType = Array.from(radios).find(r => r.checked).value;
        let mediaUrl = '';
        let link = '';
  
        if (selectedType === 'image') {
          mediaUrl = loadedImageData || (urlInput ? urlInput.value.trim() : '');
          link = document.getElementById('popupLinkInput').value.trim();
          if (!mediaUrl) {
            alert('팝업에 띄울 이미지를 업로드하거나 외부 주소를 적어 주세요.');
            return;
          }
        } else {
          mediaUrl = document.getElementById('popupVideoUrlInput').value.trim();
          if (!mediaUrl) {
            alert('팝업에 띄울 동영상 주소(URL)를 입력해 주세요.');
            return;
          }
        }
  
        const config = { active, type: selectedType, title, mediaUrl, link };
        localStorage.setItem('mainPopupData', JSON.stringify(config));
        alert('팝업 설정이 저장되었습니다.');
        
        renderAdminPopup();
      });
    }
  }
  ```
  * `showAdminDashboard` 내에서 `adminSliderContent`와 `adminPopupContent`가 렌더링될 수 있도록 서브 레이아웃 HTML을 마운트하는 탭 메뉴 영역(예: `showAdminDashboard` 내의 탭 전환 영역)에 `renderAdminSlider()`와 `renderAdminPopup()` 실행 콜백을 연동합니다.

- [ ] **Step 4: 팝업 모달 HTML 주입 및 스위치 인터랙션 Git 커밋**
  Run: `git add index.html js/app.js`
  Run: `git commit -m "feat: implement main notice popup modal logic and admin manager config form"`

---

### Task 4: Tests Updates & Verification

**Files:**
- Modify: `tests/run_tests.js`

- [ ] **Step 1: tests/run_tests.js 내에 슬라이더 및 팝업 통합 테스트 스위트 이식**
  `tests/run_tests.js` 파일 하단에 `runMainSliderAndPopupTests()` 테스트 블록을 작성합니다.
  ```javascript
  // tests/run_tests.js: runMainSliderAndPopupTests 추가
  function runMainSliderAndPopupTests() {
    const fs = require('fs');
    const path = require('path');
  
    localStorage.clear();
  
    const originalDocument = global.document;
    const originalWindow = global.window;
    const originalAlert = global.alert;
  
    let alertMessage = '';
    global.alert = (msg) => {
      alertMessage = msg;
    };
  
    // Mock Document & Window
    let mockNoticePopup = {
      classList: {
        add: (cls) => { mockNoticePopup.isVisible = true; },
        remove: (cls) => { mockNoticePopup.isVisible = false; }
      },
      isVisible: false
    };
    let mockPopupTitle = { textContent: '' };
    let mockPopupBody = {
      innerHTML: '',
      appendChild: (el) => {
        mockPopupBody.childElement = el;
      },
      childElement: null
    };
  
    global.document = {
      getElementById: (id) => {
        if (id === 'mainNoticePopup') return mockNoticePopup;
        if (id === 'popupTitle') return mockPopupTitle;
        if (id === 'popupBodyContent') return mockPopupBody;
        return {
          value: '',
          addEventListener: () => {},
          style: {}
        };
      },
      createElement: (tag) => {
        return {
          tagName: tag.toUpperCase(),
          style: {},
          setAttribute: () => {},
          appendChild: () => {}
        };
      },
      addEventListener: () => {},
      querySelectorAll: () => [],
      querySelector: () => null
    };
  
    global.window = {
      addEventListener: () => {}
    };
  
    try {
      const appJsPath = path.join(__dirname, '../js/app.js');
      const appJsCode = fs.readFileSync(appJsPath, 'utf8') + `
        global.parseYoutubeEmbedUrl = parseYoutubeEmbedUrl;
        global.checkAndShowPopup = checkAndShowPopup;
      `;
      eval(appJsCode);
  
      // Test 1: 유튜브 URL 정규식 치환 기능 검증
      const rawUrl1 = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const parsedUrl1 = global.parseYoutubeEmbedUrl(rawUrl1);
      assert.strictEqual(parsedUrl1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Standard Youtube URL should convert to embed URL');
  
      const rawUrl2 = 'https://youtu.be/dQw4w9WgXcQ';
      const parsedUrl2 = global.parseYoutubeEmbedUrl(rawUrl2);
      assert.strictEqual(parsedUrl2, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Short Youtube URL should convert to embed URL');
  
      // Test 2: 팝업 미노출 (active: false인 경우)
      localStorage.setItem('mainPopupData', JSON.stringify({ active: false }));
      mockNoticePopup.isVisible = false;
      global.checkAndShowPopup();
      assert.strictEqual(mockNoticePopup.isVisible, false, 'Popup should not be visible when active is false');
  
      // Test 3: 팝업 노출 (active: true이고 오늘하루닫기 만료 상태)
      localStorage.setItem('mainPopupData', JSON.stringify({
        active: true,
        type: 'image',
        title: '신규 이벤트',
        mediaUrl: 'data:image/png;base64,abcdef',
        link: 'https://sungman.com'
      }));
      mockNoticePopup.isVisible = false;
      global.checkAndShowPopup();
      assert.strictEqual(mockNoticePopup.isVisible, true, 'Popup should show when active is true');
      assert.strictEqual(mockPopupTitle.textContent, '신규 이벤트', 'Title should match configuration');
      
      // Test 4: 팝업 노출 차단 (오늘 하루 보지 않기 타임스탬프가 미래 시점인 경우)
      const futureTime = Date.now() + 10000;
      localStorage.setItem('popup_hide_until', String(futureTime));
      mockNoticePopup.isVisible = false;
      global.checkAndShowPopup();
      assert.strictEqual(mockNoticePopup.isVisible, false, 'Popup should not show if popup_hide_until is in the future');
  
    } finally {
      // Clean up
      global.document = originalDocument;
      global.window = originalWindow;
      global.alert = originalAlert;
      delete global.parseYoutubeEmbedUrl;
      delete global.checkAndShowPopup;
    }
  }
  ```
  * `tests/run_tests.js` 하단에 `runMainSliderAndPopupTests`를 호출하는 `runTestBlock` 문을 추가합니다.
  ```javascript
  runTestBlock('Main Slider & Popup Integration Tests (runMainSliderAndPopupTests)', runMainSliderAndPopupTests);
  ```

- [ ] **Step 2: 전체 테스트 실행 및 성공 검증**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 3: 테스트 코드 Git 최종 커밋**
  Run: `git add tests/run_tests.js`
  Run: `git commit -m "test: add unit and integration test blocks for slider limit and popup logic"`

---
