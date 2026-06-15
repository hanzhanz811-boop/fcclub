# 선수단 프로필 이미지 업로드 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 선수단 목록 및 선수 프로필 모달에 업로드된 프로필 사진이 노출되도록 하고, 관리자 선수단 관리 폼에서 이미지를 Base64 형식으로 로컬 스토리지에 업로드/삭제할 수 있는 기능을 연동합니다.

**Architecture:**
- `FileReader` API를 사용하여 폼에서 파일 변경 시 자동으로 이미지를 Base64 Data URL로 인코딩하고 미리보기를 노출합니다.
- `localStorage`의 `squadData`에 인코딩된 문자열을 영속 보관하며, 이미지 파일 크기가 1.5MB를 초과하는 경우 차단 처리합니다.
- 공개 화면 카드와 모달 상세 정보 레이아웃에 `player.image` 유효성 분기 처리를 통해 이미지와 기본 등번호 템플릿을 선택적으로 바인딩합니다.

**Tech Stack:** HTML5, Vanilla CSS, Vanilla JavaScript

---

### Task 1: Styles for Player Image & Wrapper

**Files:**
- Modify: `css/components.css`

- [ ] **Step 1: 선수 카드 이미지 래퍼 및 이미지 애니메이션 스타일 추가**
  `css/components.css` 내의 `.player-img-placeholder` 아래에 새로운 `.player-img-wrapper` 및 `.player-img` 스타일 규칙을 추가합니다.
  ```css
  /* css/components.css 수정 (라인 245 부근, .player-img-placeholder 아래에 추가) */
  .player-img-wrapper {
    height: 240px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .player-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--transition-smooth);
  }
  
  .player-card:hover .player-img {
    transform: scale(1.05);
  }
  ```

- [ ] **Step 2: Git 커밋**
  ```bash
  git add css/components.css
  git commit -m "style: add custom wrapper and scale transition classes for player images"
  ```

---

### Task 2: Public Squad Page & Detail Modal Image Rendering

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: renderSquad() 함수 내 이미지 조건부 렌더링 적용**
  `js/app.js` 내의 `renderSquad()` 함수에서 `player.image` 유효성(Base64 또는 유효 URL 여부)을 판별하여 이미지가 있을 때는 `<img>`를, 없을 때는 기존 플레이스홀더를 그리도록 변경합니다.
  ```javascript
  // js/app.js: renderSquad(positionFilter) 수정
  function renderSquad(positionFilter = 'ALL') {
    const grid = document.getElementById('squadGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = squadList.filter(player => positionFilter === 'ALL' || player.position === positionFilter);

    filtered.forEach(player => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.setAttribute('data-id', player.id);
      
      const hasImage = player.image && (player.image.startsWith('data:image/') || player.image.startsWith('http') || player.image.startsWith('/'));
      
      const imgHtml = hasImage 
        ? `<div class="player-img-wrapper"><img src="${player.image}" alt="${escapeHTML(player.name)} 선수 프로필" class="player-img"></div>`
        : `<div class="player-img-placeholder">${player.number}</div>`;

      card.innerHTML = `
        <div class="player-number-badge">${player.number}</div>
        ${imgHtml}
        <div class="player-info">
          <div class="player-name">${escapeHTML(player.name)}</div>
          <div class="player-pos">${escapeHTML(player.position)}</div>
        </div>
      `;
      card.addEventListener('click', () => openPlayerModal(player.id));
      grid.appendChild(card);
    });
  }
  ```

- [ ] **Step 2: openPlayerModal() 함수 내 모달 프로필 액자 레이아웃 이식**
  `openPlayerModal()`에서 헤더 좌측에 둥근 모서리가 적용된 이미지 요소가 동적으로 추가될 수 있도록 내장 HTML을 리뉴얼합니다.
  ```javascript
  // js/app.js: openPlayerModal(playerId) 수정
  function openPlayerModal(playerId) {
    const player = squadList.find(p => p.id === playerId);
    if (!player) return;

    const modal = document.getElementById('playerModal');
    const modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;

    const hasImage = player.image && (player.image.startsWith('data:image/') || player.image.startsWith('http') || player.image.startsWith('/'));
    
    const imgHtml = hasImage 
      ? `<div class="player-modal-img-wrapper" style="width: 100px; height: 133px; border-radius: 8px; overflow: hidden; border: 1px solid var(--color-glass-border); background: rgba(0, 0, 0, 0.3); flex-shrink: 0;"><img src="${player.image}" alt="${escapeHTML(player.name)} 프로필 이미지" style="width: 100%; height: 100%; object-fit: cover;"></div>`
      : ``;

    modalBody.innerHTML = `
      <div class="player-modal-header" style="display: flex; gap: 20px; align-items: center;">
        ${imgHtml}
        <div style="flex: 1; display: flex; align-items: center; gap: 20px;">
          <div class="player-modal-badge" style="font-size: 48px; font-weight: 800; color: var(--color-gold-solid);">${player.number}</div>
          <div class="player-modal-meta">
            <h3 id="playerModalTitle" style="font-size: 24px; margin-bottom: 4px;">${escapeHTML(player.name)}</h3>
            <p style="color:var(--color-text-muted); margin: 0;">${escapeHTML(player.engName)} | ${escapeHTML(player.position)}</p>
          </div>
        </div>
      </div>
      <div style="margin-top: 15px;">
        <p><strong>생년월일:</strong> ${escapeHTML(player.details.birth)}</p>
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
  ```

- [ ] **Step 3: Git 커밋**
  ```bash
  git add js/app.js
  git commit -m "feat: render dynamic player images in squad grid cards and modal views"
  ```

---

### Task 3: Admin Player Edit Form Image Upload & Preview

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: showSquadForm() 내 파일 입력 필드 및 미리보기 카드 마크업 설계**
  `showSquadForm` 내 HTML 문자열의 포지션 그룹 아래 영역에 파일 인풋, 미리보기 썸네일 박스, 기능 제어 버튼군(업로드 및 제거)을 기입합니다.
  ```javascript
  // js/app.js: showSquadForm(playerId) 수정
  // ... [상단 변수 바인딩 부분] ...
  const birthVal = isEdit ? player.details.birth : '';
  const imageVal = isEdit ? player.image : '';

  let html = `
    <div class="admin-section-header">
      <h3>${isEdit ? '선수 프로필 수정' : '새 선수 등록'}</h3>
    </div>
    <form id="adminSquadForm" style="display: flex; flex-direction: column; gap: 15px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="admin-form-group">
          <label for="squadFormName">이름</label>
          <input type="text" id="squadFormName" required value="${escapeHTML(nameVal)}" placeholder="예: 김성민">
        </div>
        <div class="admin-form-group">
          <label for="squadFormEngName">영문 이름</label>
          <input type="text" id="squadFormEngName" required value="${escapeHTML(engNameVal)}" placeholder="예: KIM Sungmin">
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="admin-form-group">
          <label for="squadFormNumber">등번호</label>
          <input type="number" id="squadFormNumber" required min="1" max="99" value="${escapeHTML(numberVal)}" placeholder="예: 10">
        </div>
        <div class="admin-form-group">
          <label for="squadFormPosition">포지션</label>
          <select id="squadFormPosition" required style="width: 100%; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--color-glass-border); border-radius: 6px; padding: 10px; color: var(--color-text-primary);">
            <option value="FW" ${positionVal === 'FW' ? 'selected' : ''}>공격수 (FW)</option>
            <option value="MF" ${positionVal === 'MF' ? 'selected' : ''}>미드필더 (MF)</option>
            <option value="DF" ${positionVal === 'DF' ? 'selected' : ''}>수비수 (DF)</option>
            <option value="GK" ${positionVal === 'GK' ? 'selected' : ''}>골키퍼 (GK)</option>
          </select>
        </div>
      </div>

      <!-- 프로필 이미지 업로드 그룹 추가 -->
      <div class="admin-form-group">
        <label for="squadFormImageFile">프로필 이미지 (사진 등록)</label>
        <div style="display: flex; gap: 15px; align-items: center; margin-top: 5px;">
          <div id="adminPlayerImagePreview" style="width: 80px; height: 80px; border-radius: 8px; border: 1px solid var(--color-glass-border); display: flex; align-items: center; justify-content: center; overflow: hidden; background: rgba(0,0,0,0.3); flex-shrink: 0;">
            <!-- 미리보기 자동 노출 -->
          </div>
          <div style="flex: 1;">
            <input type="file" id="squadFormImageFile" accept="image/*" style="display: none;" aria-label="선수 프로필 파일 선택">
            <button type="button" class="btn btn-outline btn-sm" id="btnTriggerSquadUpload">이미지 업로드</button>
            <button type="button" class="btn btn-outline btn-sm" id="btnRemoveSquadImage" style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3); margin-left: 5px;">이미지 제거</button>
            <p style="font-size: 12px; color: var(--color-text-muted); margin-top: 5px; margin-bottom: 0;">권장 파일 크기: 1.5MB 이하</p>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
        <div class="admin-form-group">
          <label for="squadFormMatches">출장 경기수</label>
          <input type="number" id="squadFormMatches" required min="0" value="${escapeHTML(matchesVal)}">
        </div>
        <div class="admin-form-group">
          <label for="squadFormGoals">골</label>
          <input type="number" id="squadFormGoals" required min="0" value="${escapeHTML(goalsVal)}">
        </div>
        <div class="admin-form-group">
          <label for="squadFormAssists">도움</label>
          <input type="number" id="squadFormAssists" required min="0" value="${escapeHTML(assistsVal)}">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
        <div class="admin-form-group">
          <label for="squadFormHeight">신장 (cm)</label>
          <input type="number" id="squadFormHeight" required min="100" max="250" value="${escapeHTML(heightVal)}" placeholder="예: 183">
        </div>
        <div class="admin-form-group">
          <label for="squadFormWeight">체중 (kg)</label>
          <input type="number" id="squadFormWeight" required min="30" max="150" value="${escapeHTML(weightVal)}" placeholder="예: 78">
        </div>
        <div class="admin-form-group">
          <label for="squadFormBirth">생년월일 (YYYY-MM-DD)</label>
          <input type="text" id="squadFormBirth" required value="${escapeHTML(birthVal)}" placeholder="예: 1998-05-12">
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <button type="submit" class="btn btn-gold" style="flex: 1;">저장</button>
        <button type="button" class="btn btn-outline" id="btnCancelSquadForm" style="flex: 1;">취소</button>
      </div>
    </form>
  `;
  // ... [이후 innerHTML 바인딩] ...
  ```

- [ ] **Step 2: FileReader 및 파일 1.5MB 크기 초과 차단 보안 검증 리스너 연결**
  `showSquadForm` 안에서 변환 리스너를 구현하여 업로드 이벤트를 처리합니다.
  ```javascript
  // js/app.js: showSquadForm() 내부에 삽입 (innerHTML 렌더링 이후)
  const fileInput = document.getElementById('squadFormImageFile');
  const triggerBtn = document.getElementById('btnTriggerSquadUpload');
  const removeBtn = document.getElementById('btnRemoveSquadImage');
  const previewDiv = document.getElementById('adminPlayerImagePreview');
  const numberInput = document.getElementById('squadFormNumber');
  
  let loadedImageData = imageVal;

  function updatePreview() {
    if (loadedImageData && (loadedImageData.startsWith('data:image/') || loadedImageData.startsWith('http') || loadedImageData.startsWith('/'))) {
      previewDiv.innerHTML = `<img src="${loadedImageData}" alt="업로드된 이미지" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
      const displayNum = numberInput ? (numberInput.value || '?') : '?';
      previewDiv.innerHTML = `<span style="font-size: 24px; color: var(--color-text-muted); font-weight: 800;">${displayNum}</span>`;
    }
  }

  // 초기 렌더링
  updatePreview();

  // 등번호 입력 변화에 따른 플레이스홀더 동기화
  if (numberInput) {
    numberInput.addEventListener('input', () => {
      if (!loadedImageData) updatePreview();
    });
  }

  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // 크기 제한 1.5MB (1,500,000 bytes)
        if (file.size > 1500000) {
          alert('1.5MB 이하의 이미지만 업로드 가능합니다.');
          fileInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          loadedImageData = event.target.result;
          updatePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      loadedImageData = '';
      if (fileInput) fileInput.value = '';
      updatePreview();
    });
  }
  ```

- [ ] **Step 3: 폼 전송 핸들러 수정 (Base64 파일 주소 동기화)**
  폼 제출 시 `loadedImageData`를 `image` 값으로 저장하도록 고쳐 씁니다.
  ```javascript
  // js/app.js: showSquadForm() 내부 submit 리스너 수정
  document.getElementById('adminSquadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('squadFormName').value.trim();
    const engName = document.getElementById('squadFormEngName').value.trim();
    const number = parseInt(document.getElementById('squadFormNumber').value, 10);
    const position = document.getElementById('squadFormPosition').value;
    const matches = parseInt(document.getElementById('squadFormMatches').value, 10);
    const goals = parseInt(document.getElementById('squadFormGoals').value, 10);
    const assists = parseInt(document.getElementById('squadFormAssists').value, 10);
    const height = parseInt(document.getElementById('squadFormHeight').value, 10);
    const weight = parseInt(document.getElementById('squadFormWeight').value, 10);
    const birth = document.getElementById('squadFormBirth').value.trim();

    if (!name || !engName || isNaN(number) || !position || isNaN(matches) || isNaN(goals) || isNaN(assists) || isNaN(height) || isNaN(weight) || !birth) {
      alert('모든 필드를 올바르게 입력해 주세요.');
      return;
    }

    const duplicate = squadList.some(p => p.number === number && p.id !== playerId);
    if (duplicate) {
      alert(`등번호 ${number}번은 이미 다른 선수가 사용 중입니다.`);
      return;
    }

    const updatedStats = { matches, goals, assists };
    const updatedDetails = { height, weight, birth };
    
    // 업로드 데이터가 없으면 기존 mock 형식의 문자열 식별자를 기본값으로 적용
    const finalImage = loadedImageData || `player_${position.toLowerCase()}_${number}`;

    if (isEdit) {
      squadList = squadList.map(p => p.id === playerId ? { ...p, name, engName, number, position, stats: updatedStats, details: updatedDetails, image: finalImage } : p);
    } else {
      const nextId = squadList.length > 0 ? Math.max(...squadList.map(p => p.id)) + 1 : 1;
      squadList.push({ id: nextId, name, engName, number, position, stats: updatedStats, details: updatedDetails, image: finalImage });
    }

    localStorage.setItem('squadData', JSON.stringify(squadList));

    renderSquad();
    renderAdminSquad();
  });
  ```

- [ ] **Step 4: Git 커밋**
  ```bash
  git add js/app.js
  git commit -m "feat: bind file upload events and save base64 data to localStorage on admin squad save"
  ```

---

### Task 4: Tests Updates & Verification

**Files:**
- Modify: `tests/run_tests.js`

- [ ] **Step 1: tests/run_tests.js 에 파일 FileReader 동작 모의 및 저장 단위 테스트 추가**
  `squadList`에 Base64 이미지가 들어가 있을 때 `renderSquad`가 이미지 요소를 정확하게 파싱하는지 확인하는 어설션을 작성합니다.
  ```javascript
  // tests/run_tests.js 추가 내용
  function runPlayerImageIntegrationTests() {
    const fs = require('fs');
    const path = require('path');
    
    localStorage.clear();
    
    const originalDocument = global.document;
    const originalWindow = global.window;
    
    let renderedHTML = '';
    
    global.document = {
      getElementById: (id) => {
        if (id === 'squadGrid') {
          return {
            innerHTML: '',
            appendChild: (card) => {
              renderedHTML += card.innerHTML;
            }
          };
        }
        return null;
      },
      createElement: () => {
        return {
          setAttribute: () => {},
          addEventListener: () => {},
          appendChild: () => {}
        };
      }
    };
    
    global.window = {
      addEventListener: () => {}
    };
    
    const appJsPath = path.join(__dirname, '../js/app.js');
    const appJsCode = fs.readFileSync(appJsPath, 'utf8') + '\nglobal.squadList = squadList;\nglobal.renderSquad = renderSquad;\n';
    
    eval(appJsCode);
    
    // 1. 이미지가 기본 식별자일 때 (플레이스홀더 출력)
    global.squadList = [
      { id: 1, name: '김성민', number: 10, position: 'FW', image: 'player_fw_10' }
    ];
    renderedHTML = '';
    global.renderSquad();
    assert.ok(renderedHTML.includes('player-img-placeholder'), 'Default image key should render placeholder');
    
    // 2. 이미지가 Base64 Data URL일 때 (img 태그 출력)
    const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSU';
    global.squadList = [
      { id: 1, name: '김성민', number: 10, position: 'FW', image: base64Data }
    ];
    renderedHTML = '';
    global.renderSquad();
    assert.ok(renderedHTML.includes('img src="data:image/png;base64,'), 'Base64 image should render img element');
    
    // 복구
    global.document = originalDocument;
    global.window = originalWindow;
    delete global.squadList;
    delete global.renderSquad;
  }
  ```
  * `runTestBlock` 및 요약 출력 목록에 `runPlayerImageIntegrationTests`를 삽입합니다.

- [ ] **Step 2: 테스트 전체 구동 및 성공 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 3: Git 최종 커밋**
  ```bash
  git add tests/run_tests.js
  git commit -m "test: add integration test block for player image rendering logic"
  ```
