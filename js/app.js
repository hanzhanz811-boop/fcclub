document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  bindNextMatchWidget();
  initSquadFeatures();
});

function initRouter() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.tab-section');
  const validTabs = ['home', 'club', 'squad', 'matches', 'fanzone'];

  function switchTab(tabId, smooth = true) {
    // 네비게이션 버튼 active 클래스 및 aria-current 갱신
    navLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // 섹션 활성화 제어 및 웹 접근성(a11y) 적용
    sections.forEach(section => {
      if (section.id === tabId) {
        section.classList.add('active');
        section.setAttribute('tabindex', '-1');
        section.focus();
      } else {
        section.classList.remove('active');
        section.removeAttribute('tabindex');
      }
    });

    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    
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
      if (window.location.hash === `#${tabId}`) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.hash = tabId;
      }
    });
  });

  // 초기 라우트 설정 (해시 존재 시 처리)
  const initialHash = window.location.hash.replace('#', '');
  if (validTabs.includes(initialHash)) {
    switchTab(initialHash, false);
  } else {
    window.location.hash = 'home';
  }

  // 해시 체인지 핸들러
  window.addEventListener('hashchange', () => {
    const tabId = window.location.hash.replace('#', '');
    if (validTabs.includes(tabId)) {
      switchTab(tabId, false);
    }
  });
}

function bindNextMatchWidget() {
  if (typeof matchData === 'undefined') return;
  const upcomingMatch = matchData.find(m => m.status === 'upcoming');
  if (upcomingMatch) {
    const opponentEl = document.getElementById('nextMatchOpponent');
    const infoEl = document.getElementById('nextMatchInfo');
    const ddayEl = document.getElementById('nextMatchDDay');
    
    if (opponentEl) opponentEl.textContent = upcomingMatch.opponent;
    if (infoEl) infoEl.textContent = `${upcomingMatch.date} ${upcomingMatch.time} @ ${upcomingMatch.venue}`;
    
    // D-Day calculation
    const matchDateObj = new Date(`${upcomingMatch.date}T${upcomingMatch.time}`);
    const today = new Date();
    // Reset hours for day-based comparison
    matchDateObj.setHours(0,0,0,0);
    const todayZero = new Date(today);
    todayZero.setHours(0,0,0,0);
    
    const diffTime = matchDateObj - todayZero;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dDayText = 'FINISHED';
    if (diffDays > 0) {
      dDayText = `D-${String(diffDays).padStart(2, '0')}`;
    } else if (diffDays === 0) {
      dDayText = 'D-DAY';
    }
    if (ddayEl) ddayEl.textContent = dDayText;
  }
}

function renderSquad(positionFilter = 'ALL') {
  const grid = document.getElementById('squadGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (typeof squadData === 'undefined') return;
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
  if (typeof squadData === 'undefined') return;
  const player = squadData.find(p => p.id === playerId);
  if (!player) return;

  const modal = document.getElementById('playerModal');
  const modalBody = document.getElementById('modalBody');
  if (!modal || !modalBody) return;

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
  if (modal) {
    const closeBtn = document.getElementById('modalClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('is-visible');
      });
    }

    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        modal.classList.remove('is-visible');
      });
    }

    // ESC 키 닫기
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
        modal.classList.remove('is-visible');
      }
    });
  }
}

