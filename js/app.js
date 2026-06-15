let activeNewsId = null;

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  bindNextMatchWidget();
  bindNewsWidget();
  initSquadFeatures();
  bindMatchCenter();
  if (typeof initCommunity === 'function') {
    initCommunity();
  }
});

function initRouter() {
  // 기존 데스크톱 링크
  const navLinks = document.querySelectorAll('nav a.nav-link');
  // 모바일 링크
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function handleLinkClick(e) {
    e.preventDefault();
    const tabId = this.getAttribute('data-tab');
    window.location.hash = tabId;
  }

  navLinks.forEach(link => link.addEventListener('click', handleLinkClick));
  mobileLinks.forEach(link => link.addEventListener('click', handleLinkClick));

  window.addEventListener('hashchange', () => {
    let hash = window.location.hash.substring(1);
    if (!hash) hash = 'home';
    switchTab(hash);
  });

  // 초기 로드 시 라우팅
  let initialHash = window.location.hash.substring(1);
  if (!initialHash) initialHash = 'home';
  switchTab(initialHash);
}

// switchTab 함수 수정: 데스크톱/모바일 탭 링크 모두 active 및 aria-current 토글하도록 수정
function switchTab(tabId) {
  const sections = document.querySelectorAll('.tab-section');
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

  // 데스크톱 액티브 처리
  const navLinks = document.querySelectorAll('nav a.nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });

  // 모바일 액티브 처리
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });

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

function bindMatchCenter() {
  // 경기 목록 바인딩
  const container = document.getElementById('matchListContainer');
  if (container) {
    container.innerHTML = '';
    if (typeof matchData !== 'undefined') {
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
    }
  }

  // 순위표 바인딩
  const tbody = document.getElementById('standingTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    if (typeof standingData !== 'undefined') {
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
  }
}

function bindNewsWidget() {
  const container = document.getElementById('newsListContainer');
  if (!container || typeof newsData === 'undefined') return;

  container.innerHTML = '';
  newsData.forEach(news => {
    const item = document.createElement('div');
    item.className = 'news-item';
    item.innerHTML = `
      <div class="news-date">${escapeHTML(news.date)}</div>
      <div class="news-title" role="button" tabindex="0">${escapeHTML(news.title)}</div>
    `;
    
    const titleEl = item.querySelector('.news-title');
    if (titleEl) {
      const selectAndRedirect = () => {
        activeNewsId = news.id;
        window.location.hash = 'news';
      };
      titleEl.addEventListener('click', selectAndRedirect);
      titleEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectAndRedirect();
        }
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
    const exists = newsData.some(news => news.id === activeNewsId);
    if (!exists) {
      activeNewsId = newsData[0].id;
    }
  }

  // Render news list
  const existingCards = listContainer.querySelectorAll('.news-item-card');
  if (existingCards.length === newsData.length) {
    existingCards.forEach((card, index) => {
      const news = newsData[index];
      const titleEl = card.querySelector('.news-item-title');
      const dateSpan = card.querySelector('.news-item-meta span');
      if (titleEl) titleEl.textContent = news.title;
      if (dateSpan) dateSpan.textContent = news.date;
      const isActive = news.id === activeNewsId;
      if (isActive) {
        card.classList.add('active');
        card.setAttribute('aria-pressed', 'true');
      } else {
        card.classList.remove('active');
        card.setAttribute('aria-pressed', 'false');
      }
    });
  } else {
    listContainer.innerHTML = '';
    newsData.forEach(news => {
      const card = document.createElement('div');
      card.className = `news-item-card${news.id === activeNewsId ? ' active' : ''}`;
      card.setAttribute('data-id', news.id);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', news.id === activeNewsId ? 'true' : 'false');
      
      card.innerHTML = `
        <div class="news-item-title">${escapeHTML(news.title)}</div>
        <div class="news-item-meta">
          <span>${escapeHTML(news.date)}</span>
        </div>
      `;
      
      const selectNews = () => {
        activeNewsId = news.id;
        renderNewsPage();
        scrollNewsDetailIntoViewOnMobile();
      };
      
      card.addEventListener('click', selectNews);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectNews();
        }
      });
      
      listContainer.appendChild(card);
    });
  }

  // Render active news detail
  const activeNews = newsData.find(news => news.id === activeNewsId);
  if (activeNews) {
    detailContainer.innerHTML = `
      <div class="news-detail-header">
        <h3 class="news-detail-title">${escapeHTML(activeNews.title)}</h3>
        <div class="news-detail-date">${escapeHTML(activeNews.date)}</div>
      </div>
      <div class="news-detail-body">${escapeHTML(activeNews.content)}</div>
    `;
  } else {
    detailContainer.innerHTML = `
      <div class="news-placeholder">
        <p>조회된 뉴스가 없습니다.</p>
      </div>
    `;
  }
}

function scrollNewsDetailIntoViewOnMobile() {
  if (window.innerWidth <= 768) {
    const detailCol = document.getElementById('newsDetailColumn');
    if (detailCol) {
      detailCol.scrollIntoView({ behavior: 'smooth' });
      detailCol.setAttribute('tabindex', '-1');
      detailCol.focus({ preventScroll: true });
    }
  }
}

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

