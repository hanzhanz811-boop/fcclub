let newsList = [];
let squadList = [];
let matchList = [];
// WARNING: Plaintext password storage in local storage is for client-side prototype/mock purposes only and must not be used in production.
let usersList = [];
let currentUser = null;
let activeAdminTab = 'news';
let activeNewsId = null;
let currentPopupIdx = 0;
let activePopups = [];

document.addEventListener('DOMContentLoaded', () => {
  initLocalStorageData();
  try {
    if (typeof sessionStorage !== 'undefined') {
      currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
    }
  } catch (e) {
    currentUser = null;
  }
  updateNavbar();
  bindAuthNavEvents();
  bindAdminFeatures();
  bindAuthFeatures();
  initRouter();
  bindNextMatchWidget();
  bindNewsWidget();
  initSquadFeatures();
  bindMatchCenter();
  // Fan Zone (Community) with User Authentication Integration
  if (typeof initCommunity === 'function') {
    initCommunity();
  }
  if (typeof initPopupEvents === 'function') {
    initPopupEvents();
  }
});

function initLocalStorageData() {
  if (!localStorage.getItem('newsData')) {
    const initialNews = (typeof newsData !== 'undefined') ? newsData : [];
    localStorage.setItem('newsData', JSON.stringify(initialNews));
  }
  if (!localStorage.getItem('squadData')) {
    const initialSquad = (typeof squadData !== 'undefined') ? squadData : [];
    localStorage.setItem('squadData', JSON.stringify(initialSquad));
  }
  if (!localStorage.getItem('matchData')) {
    const initialMatches = (typeof matchData !== 'undefined') ? matchData : [];
    localStorage.setItem('matchData', JSON.stringify(initialMatches));
  }
  if (!localStorage.getItem('userData')) {
    const initialUsers = [
      {
        id: 1,
        email: "admin@sungmanfc.com",
        password: "admin1234",
        nickname: "관리자",
        role: "admin",
        createdAt: "2026-06-15"
      },
      {
        id: 2,
        email: "user@sungmanfc.com",
        password: "user1234",
        nickname: "성만팬",
        role: "user",
        createdAt: "2026-06-15"
      }
    ];
    localStorage.setItem('userData', JSON.stringify(initialUsers));
  }

  newsList = safeJsonParse(localStorage.getItem('newsData')) || [];
  squadList = safeJsonParse(localStorage.getItem('squadData')) || [];
  matchList = safeJsonParse(localStorage.getItem('matchData')) || [];
  usersList = safeJsonParse(localStorage.getItem('userData')) || [];
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

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
  if (tabId === 'admin-dashboard') {
    if (currentUser === null || currentUser.role !== 'admin') {
      alert('관리자 권한이 없습니다.');
      window.location.hash = 'home';
      return;
    }
  }
  if (tabId === 'login' || tabId === 'signup') {
    if (currentUser !== null) {
      window.location.hash = 'home';
      return;
    }
  }

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

  // 홈(home) 탭이 아닐 경우 백그라운드 슬라이더 타이머 해제 (자원 낭비 방지)
  if (tabId !== 'home') {
    if (typeof sliderTimer !== 'undefined' && sliderTimer) {
      clearInterval(sliderTimer);
      sliderTimer = null;
    }
  }

  // 탭별 추가 액션
  if (tabId === 'home') {
    initMainSlider();
    if (typeof checkAndShowPopup === 'function') {
      checkAndShowPopup();
    }
  }
  if (tabId === 'fanzone' && typeof window.renderCommunity === 'function') {
    window.renderCommunity();
  }
  if (tabId === 'news') {
    renderNewsPage();
  }
  if (tabId === 'admin-login') {
    renderAdminLogin();
  }
  if (tabId === 'admin-dashboard') {
    renderAdminDashboard();
  }
  if (tabId === 'login') {
    renderLoginTab();
  }
  if (tabId === 'signup') {
    renderSignupTab();
  }
}

function bindNextMatchWidget() {
  const upcomingMatch = matchList.find(m => m.status === 'upcoming');
  const opponentEl = document.getElementById('nextMatchOpponent');
  const infoEl = document.getElementById('nextMatchInfo');
  const ddayEl = document.getElementById('nextMatchDDay');

  if (upcomingMatch) {
    if (opponentEl) opponentEl.textContent = upcomingMatch.opponent;
    if (infoEl) infoEl.textContent = `${upcomingMatch.date} ${upcomingMatch.time} @ ${upcomingMatch.venue}`;
    
    // D-Day calculation
    const matchDateObj = new Date(`${upcomingMatch.date.replace(/\./g, '-')}T${upcomingMatch.time}`);
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
  } else {
    if (opponentEl) opponentEl.textContent = '예정된 경기가 없습니다.';
    if (infoEl) infoEl.textContent = '-';
    if (ddayEl) ddayEl.textContent = 'D-00';
  }

  if (document.querySelector) {
    const existingLinks = document.querySelector('.next-match-widget .match-links');
    if (existingLinks) {
      existingLinks.remove();
    }

    if (upcomingMatch && (upcomingMatch.ticketUrl || upcomingMatch.videoUrl || upcomingMatch.newsUrl)) {
      const linksDiv = document.createElement('div');
      linksDiv.className = 'match-links';
      linksDiv.style = "display: flex; gap: 6px; margin-top: 12px; width: 100%;";
      linksDiv.innerHTML = `
        ${upcomingMatch.ticketUrl ? `<a href="${escapeHTML(upcomingMatch.ticketUrl)}" target="_blank" class="btn btn-gold btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 0;">티켓 예매</a>` : ''}
        ${upcomingMatch.videoUrl ? `<a href="${escapeHTML(upcomingMatch.videoUrl)}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 0; border: 1px solid var(--color-glass-border); color: #fff;">영상 보기</a>` : ''}
        ${upcomingMatch.newsUrl ? `<a href="${escapeHTML(upcomingMatch.newsUrl)}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 0; border: 1px solid var(--color-glass-border); color: #fff;">관련 뉴스</a>` : ''}
      `;
      const widgetCard = document.querySelector('.next-match-widget');
      if (widgetCard) {
        widgetCard.appendChild(linksDiv);
      }
    }
  }
}

function renderSquad(positionFilter = 'ALL') {
  const grid = document.getElementById('squadGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtered = squadList.filter(player => positionFilter === 'ALL' || player.position === positionFilter);

  filtered.forEach(player => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.setAttribute('data-id', player.id);

    const isValidImage = player.image && (
      player.image.startsWith('data:image/') ||
      player.image.startsWith('http') ||
      player.image.startsWith('/')
    );

    const imgHtml = isValidImage
      ? `<div class="player-img-wrapper"><img src="${escapeHTML(player.image)}" alt="${escapeHTML(player.name)} 선수 프로필" class="player-img" onerror="this.onerror=null; this.outerHTML='<div class=&quot;player-img-placeholder&quot;>${escapeHTML(String(player.number))}</div>';"></div>`
      : `<div class="player-img-placeholder">${escapeHTML(String(player.number))}</div>`;

    card.innerHTML = `
      <div class="player-number-badge">${escapeHTML(String(player.number))}</div>
      ${imgHtml}
      <div class="player-info">
        <div class="player-name">${escapeHTML(player.name)}</div>
        <div style="display: flex; justify-content: center; gap: 6px; font-size: 11px; margin-top: 4px;">
          <span style="background: rgba(212,175,55,0.15); color: var(--color-gold-solid); padding: 1px 6px; border-radius: 4px; font-weight: bold; font-family: var(--font-header);">No. ${escapeHTML(String(player.number))}</span>
          <span style="color: var(--color-text-muted);">${escapeHTML(player.position)}</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => openPlayerModal(player.id));
    grid.appendChild(card);
  });
}

function openPlayerModal(playerId) {
  const player = squadList.find(p => p.id === playerId);
  if (!player) return;

  const modal = document.getElementById('playerModal');
  const modalBody = document.getElementById('modalBody');
  if (!modal || !modalBody) return;

  const isValidImage = player.image && (
    player.image.startsWith('data:image/') ||
    player.image.startsWith('http') ||
    player.image.startsWith('/')
  );

  const imgHtml = isValidImage
    ? `<div class="player-modal-img-wrapper" style="width: 100px; height: 133px; border-radius: 8px; overflow: hidden; border: 1px solid var(--color-glass-border); background: rgba(0, 0, 0, 0.3); flex-shrink: 0;"><img src="${escapeHTML(player.image)}" alt="${escapeHTML(player.name)} 프로필 이미지" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.style.display='none'; this.parentElement.style.display='none';"></div>`
    : "";

  modalBody.innerHTML = `
    <div class="player-modal-header" style="display: flex; gap: 20px; align-items: center;">
      ${imgHtml}
      <div style="flex: 1; display: flex; align-items: center; gap: 20px;">
        <div class="player-modal-badge" style="font-size: 48px; font-weight: 800; color: var(--color-gold-solid);">${escapeHTML(String(player.number))}</div>
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

function renderMatchesPage() {
  const container = document.getElementById('matchListContainer');
  const upcomingContainer = document.getElementById('upcomingMatchesList');
  const finishedContainer = document.getElementById('finishedMatchesList');

  if (container) {
    container.innerHTML = '';
  }
  if (upcomingContainer) {
    upcomingContainer.innerHTML = '';
  }
  if (finishedContainer) {
    finishedContainer.innerHTML = '';
  }

  const currentMatchList = (typeof global !== 'undefined' && global.matchList !== undefined) ? global.matchList : matchList;

  currentMatchList.forEach(match => {
    let scoreOrTimeHtml = '';
    if (match.status === 'finished') {
      scoreOrTimeHtml = `<div class="match-list-score">${match.score.home} - ${match.score.away}</div>`;
    } else {
      scoreOrTimeHtml = `<div class="match-list-status">${escapeHTML(match.time)}</div>`;
    }

    const typeBadge = match.type === 'Home' ? '<span class="match-type-badge home">HOME</span>' : '<span class="match-type-badge">AWAY</span>';

    const linksHtml = `
      <div class="match-links" style="display: flex; gap: 6px; margin-top: 12px; width: 100%;">
        ${match.ticketUrl ? `<a href="${escapeHTML(match.ticketUrl)}" target="_blank" class="btn btn-gold btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 0;">티켓 예매</a>` : ''}
        ${match.videoUrl ? `<a href="${escapeHTML(match.videoUrl)}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 0; border: 1px solid var(--color-glass-border); color: #fff;">영상 보기</a>` : ''}
        ${match.newsUrl ? `<a href="${escapeHTML(match.newsUrl)}" target="_blank" class="btn btn-outline btn-sm" style="flex: 1; text-align: center; text-decoration: none; padding: 6px 0; border: 1px solid var(--color-glass-border); color: #fff;">관련 뉴스</a>` : ''}
      </div>
    `;

    const hasAnyLink = !!(match.ticketUrl || match.videoUrl || match.newsUrl);

    const innerHtml = `
      <div style="flex: 1; min-width: 0; margin-right: 15px;">
        <div class="match-list-meta">
          ${typeBadge} ${escapeHTML(match.date)} @ ${escapeHTML(match.venue)}
        </div>
        <div class="match-list-teams" style="font-weight: bold; margin-top: 5px;">
          성만 FC vs ${escapeHTML(match.opponent)}
        </div>
        ${hasAnyLink ? linksHtml : ''}
      </div>
      ${scoreOrTimeHtml}
    `;

    if (container && typeof container.appendChild === 'function') {
      const item = document.createElement('div');
      item.className = `match-list-item ${match.status}`;
      item.innerHTML = innerHtml;
      container.appendChild(item);
    }
    if (match.status === 'finished') {
      if (finishedContainer && typeof finishedContainer.appendChild === 'function') {
        const item = document.createElement('div');
        item.className = `match-list-item ${match.status}`;
        item.innerHTML = innerHtml;
        finishedContainer.appendChild(item);
      }
    } else {
      if (upcomingContainer && typeof upcomingContainer.appendChild === 'function') {
        const item = document.createElement('div');
        item.className = `match-list-item ${match.status}`;
        item.innerHTML = innerHtml;
        upcomingContainer.appendChild(item);
      }
    }
  });
}

function bindMatchCenter() {
  // 경기 목록 바인딩
  renderMatchesPage();

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
          <td style="text-align:left; padding-left:20px;">${escapeHTML(row.teamName)}</td>
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
  if (!container) return;

  container.innerHTML = '';
  const sortedNews = [...newsList].sort((a, b) => b.id - a.id);
  sortedNews.forEach(news => {
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
  if (!listContainer || !detailContainer) return;

  const sortedNews = [...newsList].sort((a, b) => b.id - a.id);

  if (newsList.length > 0) {
    const exists = newsList.some(news => news.id === activeNewsId);
    if (!exists) {
      activeNewsId = sortedNews[0].id;
    }
  }

  // Render news list
  const existingCards = listContainer.querySelectorAll('.news-item-card');
  if (existingCards.length === sortedNews.length) {
    existingCards.forEach((card, index) => {
      const news = sortedNews[index];
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
    sortedNews.forEach(news => {
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
  const activeNews = newsList.find(news => news.id === activeNewsId);
  if (activeNews) {
    detailContainer.innerHTML = `
      <div class="news-detail-header">
        <h3 class="news-detail-title">${escapeHTML(activeNews.title)}</h3>
        <div class="news-detail-date">${escapeHTML(activeNews.date)}</div>
      </div>
      <div class="news-detail-body">${sanitizeHTML(activeNews.content)}</div>
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

/* ----------------- ADMIN CONTROLLER FEATURES ----------------- */

function bindAdminFeatures() {
  // Add background image slider tab button dynamically if not exists
  const tabList = document.querySelector('.admin-layout nav.admin-nav-column ul[role="tablist"]');
  if (tabList && !document.getElementById('admin-tab-slider')) {
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    
    const btn = document.createElement('button');
    btn.className = 'admin-nav-btn';
    btn.id = 'admin-tab-slider';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.setAttribute('aria-controls', 'adminWorkContent');
    btn.setAttribute('data-admin-tab', 'slider');
    btn.textContent = '배경 이미지 관리';
    
    li.appendChild(btn);
    tabList.appendChild(li);
  }

  // Add popup tab button dynamically if not exists
  if (tabList && !document.getElementById('admin-tab-popup')) {
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    
    const btn = document.createElement('button');
    btn.className = 'admin-nav-btn';
    btn.id = 'admin-tab-popup';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.setAttribute('aria-controls', 'adminWorkContent');
    btn.setAttribute('data-admin-tab', 'popup');
    btn.textContent = '팝업 환경 설정';
    
    li.appendChild(btn);
    tabList.appendChild(li);
  }

  // Add applications tab button dynamically if not exists
  if (tabList && !document.getElementById('admin-tab-applications')) {
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    
    const btn = document.createElement('button');
    btn.className = 'admin-nav-btn';
    btn.id = 'admin-tab-applications';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.setAttribute('aria-controls', 'adminWorkContent');
    btn.setAttribute('data-admin-tab', 'applications');
    btn.textContent = '신청 현황 관리';
    
    li.appendChild(btn);
    tabList.appendChild(li);
  }

  const adminTabBtns = document.querySelectorAll('.admin-nav-btn[data-admin-tab]');
  adminTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeAdminTab = btn.getAttribute('data-admin-tab');
      renderAdminDashboard();
    });
  });
}

function bindAuthFeatures() {
  const loginForm = document.getElementById('memberLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('loginEmail');
      const pwInput = document.getElementById('loginPassword');
      const email = emailInput ? emailInput.value.trim() : '';
      const password = pwInput ? pwInput.value : '';
      const errorEl = document.getElementById('loginErrorMsg');

      const user = usersList.find(u => u.email === email && u.password === password);
      if (user) {
        currentUser = {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
          createdAt: user.createdAt
        };
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        updateNavbar();

        if (errorEl) errorEl.textContent = '';
        alert(`${user.nickname}님, 환영합니다!`);

        if (user.role === 'admin') {
          window.location.hash = 'admin-dashboard';
        } else {
          window.location.hash = 'home';
        }
      } else {
        if (errorEl) {
          errorEl.textContent = '이메일 주소 또는 비밀번호가 올바르지 않습니다.';
        }
      }
    });
  }

  const signupForm = document.getElementById('memberSignupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('signupEmail');
      const nicknameInput = document.getElementById('signupNickname');
      const pwInput = document.getElementById('signupPassword');
      const pwConfirmInput = document.getElementById('signupPasswordConfirm');
      const errorEl = document.getElementById('signupErrorMsg');

      const email = emailInput ? emailInput.value.trim() : '';
      const nickname = nicknameInput ? nicknameInput.value.trim() : '';
      const password = pwInput ? pwInput.value : '';
      const passwordConfirm = pwConfirmInput ? pwConfirmInput.value : '';

      // Validate email format with regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (errorEl) errorEl.textContent = '올바른 이메일 형식이 아닙니다.';
        return;
      }

      // Validate nickname is not empty
      if (!nickname) {
        if (errorEl) errorEl.textContent = '닉네임을 입력해 주세요.';
        return;
      }

      // Validate password length is >= 4
      if (password.length < 4) {
        if (errorEl) errorEl.textContent = '비밀번호는 최소 4자 이상이어야 합니다.';
        return;
      }

      // Validate password === passwordConfirm
      if (password !== passwordConfirm) {
        if (errorEl) errorEl.textContent = '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
        return;
      }

      // Validate email uniqueness: check if email already exists in usersList
      const emailExists = usersList.some(u => u.email === email);
      if (emailExists) {
        if (errorEl) errorEl.textContent = '이미 사용 중인 이메일 주소입니다.';
        return;
      }

      // Validate nickname uniqueness: check if nickname already exists in usersList
      const nicknameExists = usersList.some(u => u.nickname === nickname);
      if (nicknameExists) {
        if (errorEl) errorEl.textContent = '이미 사용 중인 닉네임입니다.';
        return;
      }

      // If all validations pass, add a new user object to usersList
      const maxId = usersList.reduce((max, u) => u.id > max ? u.id : max, 0);
      const newId = maxId + 1;
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const createdAt = `${year}-${month}-${day}`;

      const newUser = {
        id: newId,
        email: email,
        password: password,
        nickname: nickname,
        role: 'user',
        createdAt: createdAt
      };

      usersList.push(newUser);
      localStorage.setItem('userData', JSON.stringify(usersList));

      if (errorEl) errorEl.textContent = '';
      alert('회원가입이 정상 완료되었습니다. 로그인해 주세요!');
      window.location.hash = 'login';
    });
  }
}

function renderAdminLogin() {
  const errorMsg = document.getElementById('adminLoginError');
  if (errorMsg) errorMsg.textContent = '';

  const usernameInput = document.getElementById('adminUsername');
  const passwordInput = document.getElementById('adminPassword');
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
}

function renderAdminDashboard() {
  // Update admin nav buttons
  const adminTabBtns = document.querySelectorAll('.admin-nav-btn[data-admin-tab]');
  adminTabBtns.forEach(btn => {
    const tabName = btn.getAttribute('data-admin-tab');
    if (tabName === activeAdminTab) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  // Update tab panel aria-labelledby
  const workContent = document.getElementById('adminWorkContent');
  if (workContent) {
    const activeBtn = document.getElementById(`admin-tab-${activeAdminTab}`);
    if (activeBtn) {
      workContent.setAttribute('aria-labelledby', activeBtn.id);
    }
  }

  // Render the active sub-tab content
  if (activeAdminTab === 'news') {
    renderAdminNews();
  } else if (activeAdminTab === 'squad') {
    renderAdminSquad();
  } else if (activeAdminTab === 'matches') {
    renderAdminMatches();
  } else if (activeAdminTab === 'members') {
    renderAdminMembers();
  } else if (activeAdminTab === 'slider') {
    renderAdminSlider();
  } else if (activeAdminTab === 'popup') {
    renderAdminPopup();
  } else if (activeAdminTab === 'applications') {
    renderAdminApplications();
  }
}

/* NEWS CRUD */
function renderAdminNews() {
  const container = document.getElementById('adminWorkContent');
  if (!container) return;

  let html = `
    <div class="admin-section-header">
      <h3>뉴스 관리</h3>
      <button class="btn btn-gold btn-sm" id="btnAdminAddNews">새 뉴스 등록</button>
    </div>
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 80px;">번호</th>
            <th style="width: 120px;">날짜</th>
            <th>제목</th>
            <th style="width: 150px; text-align: center;">작업</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (newsList.length === 0) {
    html += `
          <tr>
            <td colspan="4" style="text-align: center; color: var(--color-text-muted);">등록된 뉴스가 없습니다.</td>
          </tr>
    `;
  } else {
    newsList.forEach((news, idx) => {
      html += `
          <tr>
            <td>${idx + 1}</td>
            <td>${escapeHTML(news.date)}</td>
            <td style="text-align: left;">${escapeHTML(news.title)}</td>
            <td style="text-align: center;">
              <div class="admin-actions" style="justify-content: center;">
                <button class="btn btn-outline btn-sm btn-edit-news" data-id="${news.id}">수정</button>
                <button class="btn btn-outline btn-sm btn-delete-news" data-id="${news.id}" style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3);">삭제</button>
              </div>
            </td>
          </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Bind add button
  document.getElementById('btnAdminAddNews').addEventListener('click', () => {
    showNewsForm();
  });

  // Bind edit buttons
  container.querySelectorAll('.btn-edit-news').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      showNewsForm(id);
    });
  });

  // Bind delete buttons
  container.querySelectorAll('.btn-delete-news').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      if (confirm('정말로 이 뉴스를 삭제하시겠습니까?')) {
        newsList = newsList.filter(n => n.id !== id);
        localStorage.setItem('newsData', JSON.stringify(newsList));
        
        // Re-render admin and public tabs
        renderAdminNews();
        bindNewsWidget();
        renderNewsPage();
      }
    });
  });
}

function showNewsForm(newsId = null) {
  const container = document.getElementById('adminWorkContent');
  if (!container) return;

  const isEdit = newsId !== null;
  const news = isEdit ? newsList.find(n => n.id === newsId) : null;

  const today = new Date();
  const defaultDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const titleVal = isEdit ? news.title : '';
  const dateVal = isEdit ? news.date : defaultDate;
  const contentVal = isEdit ? news.content : '';

  const hasQuill = typeof window !== 'undefined' && typeof window.Quill !== 'undefined';

  let html = `
    <div class="admin-section-header">
      <h3>${isEdit ? '뉴스 수정' : '새 뉴스 등록'}</h3>
    </div>
    <form id="adminNewsForm" style="display: flex; flex-direction: column; gap: 15px;">
      <div class="admin-form-group">
        <label for="newsFormTitle">제목</label>
        <input type="text" id="newsFormTitle" required value="${escapeHTML(titleVal)}" placeholder="뉴스 제목을 입력하세요">
      </div>
      <div class="admin-form-group">
        <label for="newsFormDate">날짜 (YYYY.MM.DD)</label>
        <input type="text" id="newsFormDate" required value="${escapeHTML(dateVal)}" placeholder="YYYY.MM.DD">
      </div>
      <div class="admin-form-group">
        <label for="newsFormContent">내용</label>
        ${hasQuill ? `
          <div id="newsEditorContainer" style="height: 300px; background: rgba(0,0,0,0.2); border: 1px solid var(--color-glass-border); border-radius: 6px; color: #fff;"></div>
          <input type="hidden" id="newsFormContent" value="${escapeHTML(contentVal)}">
        ` : `
          <textarea id="newsFormContent" required rows="10" placeholder="뉴스 본문을 입력하세요" style="width: 100%; min-height: 150px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--color-glass-border); border-radius: 6px; padding: 10px; color: var(--color-text-primary); font-family: inherit; resize: vertical;">${escapeHTML(contentVal)}</textarea>
        `}
      </div>
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <button type="submit" class="btn btn-gold" style="flex: 1;">저장</button>
        <button type="button" class="btn btn-outline" id="btnCancelNewsForm" style="flex: 1;">취소</button>
      </div>
    </form>
  `;

  container.innerHTML = html;

  let quillInstance = null;
  if (hasQuill) {
    const editorDiv = document.getElementById('newsEditorContainer');
    if (editorDiv) {
      quillInstance = new window.Quill('#newsEditorContainer', {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
          ]
        }
      });
      const hiddenInput = document.getElementById('newsFormContent');
      if (hiddenInput && hiddenInput.value) {
        quillInstance.root.innerHTML = hiddenInput.value;
      }
    }
  }

  document.getElementById('btnCancelNewsForm').addEventListener('click', () => {
    renderAdminNews();
  });

  document.getElementById('adminNewsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('newsFormTitle').value.trim();
    const date = document.getElementById('newsFormDate').value.trim();
    
    let content = '';
    if (quillInstance) {
      const textVal = quillInstance.getText().trim();
      const htmlVal = quillInstance.root.innerHTML;
      if (textVal.length === 0 && !htmlVal.includes('<img') && !htmlVal.includes('<iframe')) {
        alert('본문 내용을 입력해 주세요.');
        return;
      }
      content = sanitizeHTML(htmlVal);
    } else {
      const textEl = document.getElementById('newsFormContent');
      content = textEl ? textEl.value.trim() : '';
      if (!content) {
        alert('본문 내용을 입력해 주세요.');
        return;
      }
      content = sanitizeHTML(content);
    }

    if (!title || !date || !content) {
      alert('모든 필드를 입력해 주세요.');
      return;
    }

    if (isEdit) {
      newsList = newsList.map(n => n.id === newsId ? { ...n, title, date, content } : n);
    } else {
      const nextId = newsList.length > 0 ? Math.max(...newsList.map(n => n.id)) + 1 : 1;
      newsList.push({ id: nextId, title, date, content });
    }

    localStorage.setItem('newsData', JSON.stringify(newsList));

    // Update public page and admin page
    bindNewsWidget();
    renderNewsPage();
    renderAdminNews();
  });
}

/* SQUAD CRUD */
function renderAdminSquad() {
  const container = document.getElementById('adminWorkContent');
  if (!container) return;

  let html = `
    <div class="admin-section-header">
      <h3>선수단 관리</h3>
      <button class="btn btn-gold btn-sm" id="btnAdminAddSquad">새 선수 등록</button>
    </div>
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 70px;">사진</th>
            <th style="width: 70px;">등번호</th>
            <th>이름 (영문)</th>
            <th style="width: 80px;">포지션</th>
            <th style="width: 180px;">시즌 기록 (출장/득점/도움)</th>
            <th style="width: 150px; text-align: center;">작업</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (squadList.length === 0) {
    html += `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--color-text-muted);">등록된 선수가 없습니다.</td>
          </tr>
    `;
  } else {
    const sortedSquad = [...squadList].sort((a, b) => a.number - b.number);
    sortedSquad.forEach(player => {
      const hasImage = player.image && player.image.startsWith('data:image/');
      const thumbnailHtml = hasImage 
        ? `<img src="${escapeHTML(player.image)}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px; display: block; border: 1px solid var(--color-glass-border);">`
        : `<div style="width: 32px; height: 32px; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--color-glass-border); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: var(--color-gold-solid);">${escapeHTML(player.position)}</div>`;

      html += `
          <tr>
            <td>${thumbnailHtml}</td>
            <td><strong>${escapeHTML(String(player.number))}</strong></td>
            <td style="text-align: left;">
              ${escapeHTML(player.name)}
              <span style="font-size: 12px; color: var(--color-text-muted); margin-left: 5px;">(${escapeHTML(player.engName)})</span>
            </td>
            <td>${escapeHTML(player.position)}</td>
            <td>${player.stats.matches}경기 / ${player.stats.goals}골 / ${player.stats.assists}도움</td>
            <td style="text-align: center;">
              <div class="admin-actions" style="justify-content: center;">
                <button class="btn btn-outline btn-sm btn-edit-squad" data-id="${player.id}">수정</button>
                <button class="btn btn-outline btn-sm btn-delete-squad" data-id="${player.id}" style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3);">삭제</button>
              </div>
            </td>
          </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Bind add button
  document.getElementById('btnAdminAddSquad').addEventListener('click', () => {
    showSquadForm();
  });

  // Bind edit buttons
  container.querySelectorAll('.btn-edit-squad').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      showSquadForm(id);
    });
  });

  // Bind delete buttons
  container.querySelectorAll('.btn-delete-squad').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      if (confirm('정말로 이 선수를 삭제하시겠습니까?')) {
        squadList = squadList.filter(s => s.id !== id);
        localStorage.setItem('squadData', JSON.stringify(squadList));
        
        // Re-render admin and public tabs
        renderAdminSquad();
        renderSquad();
      }
    });
  });
}

function showSquadForm(playerId = null) {
  const container = document.getElementById('adminWorkContent');
  if (!container) return;

  const isEdit = playerId !== null;
  const player = isEdit ? squadList.find(p => p.id === playerId) : null;

  const nameVal = isEdit ? player.name : '';
  const engNameVal = isEdit ? player.engName : '';
  const numberVal = isEdit ? player.number : '';
  const positionVal = isEdit ? player.position : 'FW';
  const matchesVal = isEdit ? player.stats.matches : 0;
  const goalsVal = isEdit ? player.stats.goals : 0;
  const assistsVal = isEdit ? player.stats.assists : 0;
  const heightVal = isEdit ? player.details.height : '';
  const weightVal = isEdit ? player.details.weight : '';
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

  container.innerHTML = html;

  const fileInput = document.getElementById('squadFormImageFile');
  const triggerBtn = document.getElementById('btnTriggerSquadUpload');
  const removeBtn = document.getElementById('btnRemoveSquadImage');
  const previewDiv = document.getElementById('adminPlayerImagePreview');
  const numberInput = document.getElementById('squadFormNumber');
  
  let loadedImageData = imageVal;

  function updatePreview() {
    if (loadedImageData && (loadedImageData.startsWith('data:image/') || loadedImageData.startsWith('http') || loadedImageData.startsWith('/'))) {
      previewDiv.innerHTML = '';
      const img = document.createElement('img');
      img.src = loadedImageData;
      img.alt = '업로드된 이미지';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      previewDiv.appendChild(img);
    } else {
      const displayNum = numberInput ? (numberInput.value || '?') : '?';
      previewDiv.innerHTML = `<span style="font-size: 24px; color: var(--color-text-muted); font-weight: 800;">${escapeHTML(String(displayNum))}</span>`;
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
        if (!file.type.startsWith('image/')) {
          alert('이미지 파일만 업로드할 수 있습니다.');
          fileInput.value = '';
          return;
        }
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
        reader.onerror = () => {
          alert('이미지 파일을 읽는 동안 에러가 발생했습니다.');
          fileInput.value = '';
          loadedImageData = imageVal;
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

  document.getElementById('btnCancelSquadForm').addEventListener('click', () => {
    renderAdminSquad();
  });

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
    const image = loadedImageData || `player_${position.toLowerCase()}_${number}`;

    if (isEdit) {
      squadList = squadList.map(p => p.id === playerId ? { ...p, name, engName, number, position, stats: updatedStats, details: updatedDetails, image } : p);
    } else {
      const nextId = squadList.length > 0 ? Math.max(...squadList.map(p => p.id)) + 1 : 1;
      squadList.push({ id: nextId, name, engName, number, position, stats: updatedStats, details: updatedDetails, image });
    }

    localStorage.setItem('squadData', JSON.stringify(squadList));

    // Update public page and admin page
    renderSquad();
    renderAdminSquad();
  });
}

/* MATCHES CRUD */
function renderAdminMatches() {
  const container = document.getElementById('adminWorkContent');
  if (!container) return;

  let html = `
    <div class="admin-section-header">
      <h3>경기 일정 및 결과 관리</h3>
      <button class="btn btn-gold btn-sm" id="btnAdminAddMatch">새 경기 등록</button>
    </div>
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 120px;">일시</th>
            <th style="width: 80px;">구분</th>
            <th>상대팀</th>
            <th>경기장</th>
            <th style="width: 100px;">상태/결과</th>
            <th style="width: 150px; text-align: center;">작업</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (matchList.length === 0) {
    html += `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--color-text-muted);">등록된 경기가 없습니다.</td>
          </tr>
    `;
  } else {
    const sortedMatches = [...matchList].sort((a, b) => new Date(b.date.replace(/\./g, '-') + 'T' + b.time) - new Date(a.date.replace(/\./g, '-') + 'T' + a.time));
    sortedMatches.forEach(match => {
      let resultText = '';
      if (match.status === 'finished') {
        resultText = `${match.score.home} : ${match.score.away} (종료)`;
      } else {
        resultText = '대기중';
      }

      html += `
          <tr>
            <td>${escapeHTML(match.date)} ${escapeHTML(match.time)}</td>
            <td>${match.type === 'Home' ? '<span style="color:var(--color-gold-solid)">HOME</span>' : 'AWAY'}</td>
            <td style="text-align: left;">성만 FC vs ${escapeHTML(match.opponent)}</td>
            <td>${escapeHTML(match.venue)}</td>
            <td>${resultText}</td>
            <td style="text-align: center;">
              <div class="admin-actions" style="justify-content: center;">
                <button class="btn btn-outline btn-sm btn-edit-match" data-id="${match.id}">수정</button>
                <button class="btn btn-outline btn-sm btn-delete-match" data-id="${match.id}" style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3);">삭제</button>
              </div>
            </td>
          </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Bind add button
  document.getElementById('btnAdminAddMatch').addEventListener('click', () => {
    showMatchForm();
  });

  // Bind edit buttons
  container.querySelectorAll('.btn-edit-match').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      showMatchForm(id);
    });
  });

  // Bind delete buttons
  container.querySelectorAll('.btn-delete-match').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      if (confirm('정말로 이 경기 일정을 삭제하시겠습니까?')) {
        matchList = matchList.filter(m => m.id !== id);
        localStorage.setItem('matchData', JSON.stringify(matchList));
        
        // Re-render admin and public tabs
        renderAdminMatches();
        bindNextMatchWidget();
        bindMatchCenter();
      }
    });
  });
}

function showMatchForm(matchId = null) {
  const container = document.getElementById('adminWorkContent');
  if (!container) return;

  const isEdit = matchId !== null;
  const match = isEdit ? matchList.find(m => m.id === matchId) : null;

  const opponentVal = isEdit ? match.opponent : '';
  const dateVal = match ? match.date.replace(/\./g, '-') : '';
  const timeVal = isEdit ? match.time : '19:00';
  const venueVal = isEdit ? match.venue : '성만 아레나';
  const typeVal = isEdit ? match.type : 'Home';
  const statusVal = isEdit ? match.status : 'upcoming';
  const scoreHomeVal = (isEdit && match.score) ? match.score.home : 0;
  const scoreAwayVal = (isEdit && match.score) ? match.score.away : 0;
  const ticketUrlVal = isEdit && match.ticketUrl ? match.ticketUrl : '';
  const videoUrlVal = isEdit && match.videoUrl ? match.videoUrl : '';
  const newsUrlVal = isEdit && match.newsUrl ? match.newsUrl : '';

  let html = `
    <div class="admin-section-header">
      <h3>${isEdit ? '경기 일정 수정' : '새 경기 등록'}</h3>
    </div>
    <form id="adminMatchForm" style="display: flex; flex-direction: column; gap: 15px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="admin-form-group">
          <label for="matchFormOpponent">상대 구단명</label>
          <input type="text" id="matchFormOpponent" required value="${escapeHTML(opponentVal)}" placeholder="예: 수원 삼성">
        </div>
        <div class="admin-form-group">
          <label for="matchFormVenue">경기장</label>
          <input type="text" id="matchFormVenue" required value="${escapeHTML(venueVal)}" placeholder="예: 성만 아레나">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
        <div class="admin-form-group">
          <label for="matchFormDate">일자</label>
          <input type="date" id="matchFormDate" required value="${escapeHTML(dateVal)}">
        </div>
        <div class="admin-form-group">
          <label for="matchFormTime">시간 (HH:MM)</label>
          <input type="text" id="matchFormTime" required value="${escapeHTML(timeVal)}" placeholder="예: 19:00">
        </div>
        <div class="admin-form-group">
          <label for="matchFormType">구분</label>
          <select id="matchFormType" required style="width: 100%; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--color-glass-border); border-radius: 6px; padding: 10px; color: var(--color-text-primary);">
            <option value="Home" ${typeVal === 'Home' ? 'selected' : ''}>홈 (Home)</option>
            <option value="Away" ${typeVal === 'Away' ? 'selected' : ''}>원정 (Away)</option>
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="admin-form-group">
          <label for="matchFormStatus">경기 상태</label>
          <select id="matchFormStatus" required style="width: 100%; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--color-glass-border); border-radius: 6px; padding: 10px; color: var(--color-text-primary);">
            <option value="upcoming" ${statusVal === 'upcoming' ? 'selected' : ''}>진행 예정 (upcoming)</option>
            <option value="finished" ${statusVal === 'finished' ? 'selected' : ''}>경기 종료 (finished)</option>
          </select>
        </div>
      </div>

      <!-- 경기 종료 시 스코어 입력 영역 -->
      <div id="scoreInputArea" style="display: ${statusVal === 'finished' ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 15px; border: 1px dashed rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 6px;">
        <div class="admin-form-group">
          <label for="matchFormScoreHome">성만 FC 득점</label>
          <input type="number" id="matchFormScoreHome" min="0" value="${escapeHTML(scoreHomeVal)}">
        </div>
        <div class="admin-form-group">
          <label for="matchFormScoreAway">상대팀 득점</label>
          <input type="number" id="matchFormScoreAway" min="0" value="${escapeHTML(scoreAwayVal)}">
        </div>
      </div>

      <!-- 경기 관련 외부 링크 필드 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
        <div class="admin-form-group">
          <label for="matchFormTicketUrl">티켓 구매 URL</label>
          <input type="text" id="matchFormTicketUrl" value="${escapeHTML(ticketUrlVal)}" placeholder="예: https://example.com/ticket">
        </div>
        <div class="admin-form-group">
          <label for="matchFormVideoUrl">관련 영상 URL</label>
          <input type="text" id="matchFormVideoUrl" value="${escapeHTML(videoUrlVal)}" placeholder="예: https://example.com/video">
        </div>
        <div class="admin-form-group">
          <label for="matchFormNewsUrl">관련 뉴스 URL</label>
          <input type="text" id="matchFormNewsUrl" value="${escapeHTML(newsUrlVal)}" placeholder="예: https://example.com/news">
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <button type="submit" class="btn btn-gold" style="flex: 1;">저장</button>
        <button type="button" class="btn btn-outline" id="btnCancelMatchForm" style="flex: 1;">취소</button>
      </div>
    </form>
  `;

  container.innerHTML = html;

  const statusSelect = document.getElementById('matchFormStatus');
  const scoreArea = document.getElementById('scoreInputArea');
  if (statusSelect && scoreArea) {
    statusSelect.addEventListener('change', (e) => {
      if (e.target.value === 'finished') {
        scoreArea.style.display = 'grid';
      } else {
        scoreArea.style.display = 'none';
      }
    });
  }

  document.getElementById('btnCancelMatchForm').addEventListener('click', () => {
    renderAdminMatches();
  });

  document.getElementById('adminMatchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const opponent = document.getElementById('matchFormOpponent').value.trim();
    const venue = document.getElementById('matchFormVenue').value.trim();
    const rawDate = document.getElementById('matchFormDate').value.trim();
    const date = rawDate.replace(/-/g, '.');
    const time = document.getElementById('matchFormTime').value.trim();
    const type = document.getElementById('matchFormType').value;
    const status = document.getElementById('matchFormStatus').value;
    const ticketUrl = document.getElementById('matchFormTicketUrl').value.trim();
    const videoUrl = document.getElementById('matchFormVideoUrl').value.trim();
    const newsUrl = document.getElementById('matchFormNewsUrl').value.trim();

    if (!opponent || !venue || !date || !time || !type || !status) {
      alert('모든 필수 필드를 입력해 주세요.');
      return;
    }

    if (ticketUrl && !isValidUrl(ticketUrl)) {
      alert('올바른 티켓 구매 URL을 입력해 주세요.');
      return;
    }
    if (videoUrl && !isValidUrl(videoUrl)) {
      alert('올바른 관련 영상 URL을 입력해 주세요.');
      return;
    }
    if (newsUrl && !isValidUrl(newsUrl)) {
      alert('올바른 관련 뉴스 URL을 입력해 주세요.');
      return;
    }

    let score = null;
    if (status === 'finished') {
      const homeScoreVal = parseInt(document.getElementById('matchFormScoreHome').value, 10);
      const awayScoreVal = parseInt(document.getElementById('matchFormScoreAway').value, 10);
      if (isNaN(homeScoreVal) || isNaN(awayScoreVal)) {
        alert('경기 종료 시 스코어를 올바르게 입력해 주세요.');
        return;
      }
      score = { home: homeScoreVal, away: awayScoreVal };
    }

    if (isEdit) {
      matchList = matchList.map(m => m.id === matchId ? { ...m, opponent, venue, date, time, type, status, score, ticketUrl, videoUrl, newsUrl } : m);
    } else {
      const nextId = matchList.length > 0 ? Math.max(...matchList.map(m => m.id)) + 1 : 101;
      matchList.push({ id: nextId, opponent, venue, date, time, type, status, score, ticketUrl, videoUrl, newsUrl });
    }

    localStorage.setItem('matchData', JSON.stringify(matchList));

    // Update public page and admin page
    bindNextMatchWidget();
    bindMatchCenter();
    renderAdminMatches();
  });
}

function renderAdminMembers() {
  const container = document.getElementById('adminWorkContent');
  if (!container) return;

  let html = `
    <div class="admin-section-header">
      <h3>회원 관리</h3>
    </div>
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 120px;">가입일자</th>
            <th>이메일 주소</th>
            <th style="width: 150px;">닉네임</th>
            <th style="width: 120px; text-align: center;">등급</th>
            <th style="width: 250px; text-align: center;">관리 작업</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (usersList.length === 0) {
    html += `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--color-text-muted);">등록된 회원이 없습니다.</td>
          </tr>
    `;
  } else {
    usersList.forEach(user => {
      const isSelf = currentUser && currentUser.email === user.email;
      const emailDisplay = isSelf ? `${escapeHTML(user.email)} (본인)` : escapeHTML(user.email);
      const roleClass = user.role === 'admin' ? 'admin' : 'user';
      const roleText = user.role === 'admin' ? '관리자' : '일반회원';
      const toggleBtnText = user.role === 'admin' ? '일반회원으로 강등' : '관리자로 격상';
      const disabledAttr = isSelf ? 'disabled' : '';

      html += `
          <tr>
            <td>${escapeHTML(user.createdAt || '')}</td>
            <td>${emailDisplay}</td>
            <td>${escapeHTML(user.nickname)}</td>
            <td style="text-align: center;">
              <span class="member-role-badge ${roleClass}">${roleText}</span>
            </td>
            <td style="text-align: center;">
              <div class="admin-actions" style="justify-content: center; gap: 8px;">
                <button class="btn btn-outline btn-sm btn-toggle-role" data-id="${user.id}" ${disabledAttr}>${toggleBtnText}</button>
                <button class="btn btn-outline btn-sm btn-delete-member" data-id="${user.id}" style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3);" ${disabledAttr}>강퇴</button>
              </div>
            </td>
          </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Bind toggle role buttons
  container.querySelectorAll('.btn-toggle-role').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const user = usersList.find(u => u.id === id);
      if (!user) return;
      
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const newRoleName = newRole === 'admin' ? '관리자' : '일반회원';
      
      if (confirm(`회원 ${user.nickname}님의 권한을 ${newRoleName}로 변경하시겠습니까?`)) {
        user.role = newRole;
        localStorage.setItem('userData', JSON.stringify(usersList));
        renderAdminMembers();
      }
    });
  });

  // Bind delete member buttons
  container.querySelectorAll('.btn-delete-member').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      const user = usersList.find(u => u.id === id);
      if (!user) return;

      if (confirm(`회원 ${user.nickname}님을 정말 강제 탈퇴시키겠습니까?`)) {
        usersList = usersList.filter(u => u.id !== id);
        localStorage.setItem('userData', JSON.stringify(usersList));
        renderAdminMembers();
      }
    });
  });
}

function updateNavbar() {
  const isLoggedIn = currentUser !== null;
  const isAdmin = isLoggedIn && currentUser.role === 'admin';

  // 1. 데스크톱 네비게이션 갱신
  const navUl = document.querySelector('nav ul');
  if (navUl) {
    // 기존 로그인/로그아웃 관련 항목 제거
    const loginItems = navUl.querySelectorAll('.dynamic-auth-item');
    loginItems.forEach(el => el.remove());

    if (isLoggedIn) {
      // 관리자 대시보드 링크 추가
      if (isAdmin) {
        const dashboardLi = document.createElement('li');
        dashboardLi.className = 'dynamic-auth-item';
        dashboardLi.innerHTML = `<a href="#admin-dashboard" class="nav-link" data-tab="admin-dashboard">Admin</a>`;
        navUl.appendChild(dashboardLi);
      }
      
      // 로그아웃 링크 추가
      const logoutLi = document.createElement('li');
      logoutLi.className = 'dynamic-auth-item';
      logoutLi.innerHTML = `<a href="#logout" class="nav-link" id="navBtnLogout">로그아웃 (${escapeHTML(currentUser.nickname)}님)</a>`;
      navUl.appendChild(logoutLi);
    } else {
      const loginLi = document.createElement('li');
      loginLi.className = 'dynamic-auth-item';
      loginLi.innerHTML = `<a href="#login" class="nav-link" data-tab="login">로그인</a>`;
      navUl.appendChild(loginLi);
    }
  }

  // 2. 모바일 네비게이션 바 갱신
  const mobileNavBar = document.querySelector('.mobile-nav-bar');
  const mobileUl = document.querySelector('.mobile-nav-bar ul');
  if (mobileNavBar && mobileUl) {
    const mobileAuthItems = mobileNavBar.querySelectorAll('.dynamic-mobile-auth');
    mobileAuthItems.forEach(el => el.remove());

    const mobileAuthLi = document.createElement('li');
    mobileAuthLi.className = 'dynamic-mobile-auth';

    const newMobileAuth = document.createElement('a');
    newMobileAuth.className = 'mobile-nav-link dynamic-mobile-auth';
    
    if (isLoggedIn) {
      newMobileAuth.href = '#logout';
      newMobileAuth.id = 'mobileBtnLogout';
      newMobileAuth.innerHTML = `
        <div class="mobile-nav-icon">🔓</div>
        <span>로그아웃</span>
      `;
    } else {
      newMobileAuth.href = '#login';
      newMobileAuth.setAttribute('data-tab', 'login');
      newMobileAuth.innerHTML = `
        <div class="mobile-nav-icon">🔑</div>
        <span>로그인</span>
      `;
    }
    mobileAuthLi.appendChild(newMobileAuth);
    mobileUl.appendChild(mobileAuthLi);
  }
  
  // 이벤트 바인딩 호출
  bindAuthNavEvents();
}

function bindAuthNavEvents() {
  // 로그아웃 버튼 이벤트 처리
  const handleLogout = (e) => {
    e.preventDefault();
    currentUser = null;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('currentUser');
    }
    updateNavbar();
    alert('로그아웃 되었습니다.');
    window.location.hash = 'home';
  };

  const logoutBtn = document.getElementById('navBtnLogout');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const mobileLogoutBtn = document.getElementById('mobileBtnLogout');
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

  // 새로 바인딩된 링크들 이벤트 라우터와 연동
  const newLinks = document.querySelectorAll('.dynamic-auth-item a[data-tab], .dynamic-mobile-auth a[data-tab], .dynamic-mobile-auth[data-tab]');
  newLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const tabId = this.getAttribute('data-tab');
      if (tabId) {
        window.location.hash = tabId;
      }
    });
  });
}

function renderLoginTab() {
  const errorEl = document.getElementById('loginErrorMsg');
  if (errorEl) errorEl.textContent = '';
  const emailInput = document.getElementById('loginEmail');
  const pwInput = document.getElementById('loginPassword');
  if (emailInput) emailInput.value = '';
  if (pwInput) pwInput.value = '';
}

function renderSignupTab() {
  const errorEl = document.getElementById('signupErrorMsg');
  if (errorEl) errorEl.textContent = '';
  const emailInput = document.getElementById('signupEmail');
  const nickInput = document.getElementById('signupNickname');
  const pwInput = document.getElementById('signupPassword');
  const pwConfirmInput = document.getElementById('signupPasswordConfirm');
  if (emailInput) emailInput.value = '';
  if (nickInput) nickInput.value = '';
  if (pwInput) pwInput.value = '';
  if (pwConfirmInput) pwConfirmInput.value = '';
}

/* BACKGROUND IMAGE SLIDER LOGIC */
let sliderTimer = null;

function initMainSlider() {
  const hero = document.querySelector('.hero-section') || document.querySelector('.hero-banner');
  if (!hero) return;

  // Clear existing background image inline style and avoid showing default background if custom background is used
  hero.style.backgroundImage = 'none';

  // Remove old slider element if exists
  const oldSlider = hero.querySelector('.hero-slider-bg');
  if (oldSlider) {
    oldSlider.remove();
  }
  if (sliderTimer) {
    clearInterval(sliderTimer);
    sliderTimer = null;
  }

  // Load from localStorage
  let sliderData = [];
  try {
    sliderData = JSON.parse(localStorage.getItem('mainSliderData')) || [];
  } catch (e) {
    sliderData = [];
  }

  // Fallback if empty
  if (sliderData.length === 0) {
    sliderData = [{ id: 1, image: 'assets/stadium_bg.png' }];
  }

  const sliderBg = document.createElement('div');
  sliderBg.className = 'hero-slider-bg';

  sliderData.forEach((item, idx) => {
    const slide = document.createElement('div');
    slide.className = `hero-slide ${idx === 0 ? 'active' : ''}`;
    slide.style.backgroundImage = `url('${escapeHTML(item.image)}')`;
    sliderBg.appendChild(slide);
  });

  // Inject at the very beginning of the hero section so text overlays it
  hero.insertBefore(sliderBg, hero.firstChild);

  // If 2 or more images, cycle
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

function renderAdminSlider() {
  const parent = document.getElementById('adminWorkContent');
  if (!parent) return;

  parent.innerHTML = '<div id="adminSliderContent"></div>';
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
        <div style="flex: 1; font-size: 13px; color: var(--color-text-muted);">등록된 이미지 (ID: ${escapeHTML(String(item.id))})</div>
        <button class="btn btn-outline btn-sm btn-delete-slider-image" data-id="${escapeHTML(String(item.id))}" style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3);">삭제</button>
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

  const fileInput = document.getElementById('sliderImageFile');
  const triggerBtn = document.getElementById('btnTriggerSliderUpload');
  const previewDiv = document.getElementById('adminSliderImagePreview');
  const uploadForm = document.getElementById('adminSliderUploadForm');
  let loadedImageData = '';

  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', () => {
      if (sliderData.length >= 3) return;
      fileInput.click();
    });
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
          alert('이미지 파일을 읽는 동안 에러가 발생했습니다.');
          fileInput.value = '';
          loadedImageData = '';
          previewDiv.innerHTML = '<span style="font-size: 12px; color: var(--color-text-muted);">미리보기</span>';
        };
        reader.onload = (event) => {
          loadedImageData = event.target.result;
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

  container.querySelectorAll('.btn-delete-slider-image').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      deleteSliderImage(id);
    });
  });
}

const appGlobalScope = typeof window !== 'undefined' ? window : global;
appGlobalScope.deleteSliderImage = function(id) {
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

function isValidUrl(url) {
  if (!url) return false;
  try {
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../') || url.startsWith('#')) {
      return true;
    }
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
}

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
  const activeTab = (window.location && window.location.hash) ? window.location.hash.substring(1) : 'home';
  if (activeTab !== 'home') return;
  
  const hideUntil = localStorage.getItem('popup_hide_until');
  if (hideUntil && Date.now() < Number(hideUntil)) return;

  let allPopups = [];
  try {
    allPopups = JSON.parse(localStorage.getItem('mainPopupData')) || [];
  } catch (e) {
    allPopups = [];
  }

  if (!Array.isArray(allPopups)) {
    if (allPopups && (allPopups.title || allPopups.mediaUrl)) {
      allPopups = [{
        id: Date.now(),
        active: !!allPopups.active,
        title: allPopups.title || 'SUNGMAN FC 공지',
        type: allPopups.type || 'image',
        mediaUrl: allPopups.mediaUrl || '',
        link: allPopups.link || ''
      }];
    } else {
      allPopups = [];
    }
  }

  activePopups = allPopups.filter(p => p.active);
  
  const overlay = document.getElementById('mainNoticePopup');
  if (activePopups.length === 0) {
    if (overlay && overlay.classList) {
      overlay.classList.remove('is-visible');
    }
    return;
  }

  if (currentPopupIdx >= activePopups.length) {
    currentPopupIdx = 0;
  }
  
  renderActivePopupSlide();
}

function renderActivePopupSlide() {
  const overlay = document.getElementById('mainNoticePopup');
  const title = document.getElementById('popupTitle');
  const body = document.getElementById('popupBodyContent');
  const indicators = document.getElementById('popupIndicators');
  if (!overlay || !body) return;

  const popup = activePopups[currentPopupIdx];
  if (!popup) return;
  
  if (title) {
    title.textContent = popup.title || 'SUNGMAN FC 공지';
  }
  
  body.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'main-popup-media-wrapper';

  let html = '';
  if (popup.type === 'image') {
    if (popup.link && isValidUrl(popup.link)) {
      html = `<a href="${escapeHTML(popup.link)}" target="_blank"><img src="${escapeHTML(popup.mediaUrl)}" class="main-popup-img" alt="${escapeHTML(popup.title || '')} 이미지 공지"></a>`;
    } else {
      html = `<img src="${escapeHTML(popup.mediaUrl)}" class="main-popup-img" alt="${escapeHTML(popup.title || '')} 이미지 공지">`;
    }
  } else {
    const parsedUrl = parseYoutubeEmbedUrl(popup.mediaUrl);
    if (parsedUrl && parsedUrl.startsWith('https://www.youtube.com/embed/')) {
      html = `<div class="main-popup-video-container"><iframe src="${escapeHTML(parsedUrl)}" sandbox="allow-scripts allow-same-origin allow-presentation" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    } else if (isValidUrl(popup.mediaUrl)) {
      html = `<div class="main-popup-video-container"><video src="${escapeHTML(popup.mediaUrl)}" controls autoplay muted loop style="width: 100%; display: block;"></video></div>`;
    }
  }
  wrapper.innerHTML = html;

  if (typeof body.appendChild === 'function') {
    body.appendChild(wrapper);
  } else {
    body.innerHTML = wrapper.innerHTML;
  }

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
        dot.style.cursor = 'pointer';
        if (typeof indicators.appendChild === 'function') {
          indicators.appendChild(dot);
        }
      });
    }
  }

  if (overlay && overlay.classList) {
    overlay.classList.add('is-visible');
  }
}

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
      if (overlay.classList) {
        overlay.classList.remove('is-visible');
      }
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

function renderAdminPopup() {
  const parent = document.getElementById('adminWorkContent');
  if (!parent) return;

  parent.innerHTML = '<div id="adminPopupContent"></div>';
  const container = document.getElementById('adminPopupContent');
  if (!container) return;

  let popupList = [];
  try {
    const raw = localStorage.getItem('mainPopupData');
    if (raw) {
      popupList = JSON.parse(raw);
    }
  } catch (e) {
    popupList = [];
  }
  if (!Array.isArray(popupList)) {
    if (popupList && (popupList.title || popupList.mediaUrl)) {
      popupList = [{
        id: Date.now(),
        active: !!popupList.active,
        title: popupList.title || 'SUNGMAN FC 공지',
        type: popupList.type || 'image',
        mediaUrl: popupList.mediaUrl || '',
        link: popupList.link || ''
      }];
    } else {
      popupList = [];
    }
  }

  let listHtml = '';
  if (popupList.length === 0) {
    listHtml = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 15px;">등록된 팝업이 없습니다.</td>
      </tr>
    `;
  } else {
    popupList.forEach((popup, idx) => {
      const activeText = popup.active ? '활성' : '비활성';
      const activeColor = popup.active ? 'var(--color-gold-solid)' : 'var(--color-text-muted)';
      const typeText = popup.type === 'image' ? '이미지' : '비디오';
      listHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td style="text-align: left;">${escapeHTML(popup.title || '')}</td>
          <td>${typeText}</td>
          <td style="color: ${activeColor}; font-weight: bold;">${activeText}</td>
          <td style="text-align: center;">
            <div class="admin-actions" style="justify-content: center; gap: 8px;">
              <button class="btn btn-outline btn-sm btn-toggle-popup-active" data-id="${escapeHTML(String(popup.id))}">토글</button>
              <button class="btn btn-outline btn-sm btn-delete-popup" data-id="${escapeHTML(String(popup.id))}" style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3);">삭제</button>
            </div>
          </td>
        </tr>
      `;
    });
  }

  container.innerHTML = `
    <h4 style="color: var(--color-gold-solid); margin-bottom: 15px;">등록된 공지 팝업 목록</h4>
    <div class="admin-table-wrapper" style="margin-bottom: 30px;">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 60px;">번호</th>
            <th>제목</th>
            <th style="width: 100px;">유형</th>
            <th style="width: 100px;">상태</th>
            <th style="width: 150px; text-align: center;">작업</th>
          </tr>
        </thead>
        <tbody>
          ${listHtml}
        </tbody>
      </table>
    </div>

    <div style="border-top: 1px solid var(--color-glass-border); padding-top: 20px;">
      <h4 style="color: var(--color-gold-solid); margin-bottom: 15px;">새 팝업 공지 등록</h4>
      <form id="adminPopupConfigForm" style="display: flex; flex-direction: column; gap: 15px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
          <input type="checkbox" id="popupActive" checked style="width: 18px; height: 18px; cursor: pointer;">
          <label for="popupActive" style="font-weight: bold; cursor: pointer;">등록 즉시 활성화</label>
        </div>
        
        <div class="admin-form-group">
          <label for="popupTitleInput">팝업 제목 (공지명)</label>
          <input type="text" id="popupTitleInput" required value="" placeholder="예: SUNGMAN FC 특별 공지">
        </div>

        <div class="admin-form-group">
          <label>팝업 콘텐츠 미디어 형식</label>
          <div style="display: flex; gap: 20px; margin-top: 5px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" name="popupType" value="image" checked style="cursor: pointer;"> 이미지
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" name="popupType" value="video" style="cursor: pointer;"> 동영상 (비디오)
            </label>
          </div>
        </div>

        <!-- 이미지 설정 영역 -->
        <div id="popupImageFieldArea" style="display: block; border: 1px dashed var(--color-glass-border); padding: 15px; border-radius: 6px; background: rgba(0,0,0,0.1);">
          <div class="admin-form-group">
            <label>공지 이미지 등록 (파일 선택 또는 이미지 URL 입력)</label>
            <div style="display: flex; gap: 15px; align-items: center; margin-top: 5px; margin-bottom: 10px;">
              <div id="adminPopupImgPreview" style="width: 100px; height: 100px; border-radius: 6px; border: 1px solid var(--color-glass-border); display: flex; align-items: center; justify-content: center; overflow: hidden; background: rgba(0,0,0,0.3); flex-shrink: 0;">
                <span style="font-size: 11px; color: var(--color-text-muted);">미리보기</span>
              </div>
              <div style="flex: 1;">
                <input type="file" id="popupImageFile" accept="image/*" style="display: none;" aria-label="팝업 이미지 파일 선택">
                <button type="button" class="btn btn-outline btn-sm" id="btnTriggerPopupImgUpload">파일 선택</button>
                <p style="font-size: 11px; color: var(--color-text-muted); margin-top: 5px; margin-bottom: 0;">1.5MB 이하의 이미지 파일만 업로드 가능합니다.</p>
              </div>
            </div>
            <label for="popupImageUrlInput" style="font-size: 12px; margin-top: 10px;">또는 외부 이미지 주소(URL)</label>
            <input type="text" id="popupImageUrlInput" value="" placeholder="예: https://example.com/image.jpg" style="margin-top: 5px;">
          </div>
          
          <div class="admin-form-group" style="margin-top: 15px;">
            <label for="popupLinkInput">이미지 클릭 시 이동할 링크 URL (선택사항)</label>
            <input type="text" id="popupLinkInput" value="" placeholder="https://example.com/event">
          </div>
        </div>

        <!-- 동영상 설정 영역 -->
        <div id="popupVideoFieldArea" style="display: none; border: 1px dashed var(--color-glass-border); padding: 15px; border-radius: 6px; background: rgba(0,0,0,0.1);">
          <div class="admin-form-group">
            <label>공지 비디오 등록 (파일 선택 또는 동영상 URL 입력)</label>
            <div style="display: flex; gap: 15px; align-items: center; margin-top: 5px; margin-bottom: 10px;">
              <div id="adminPopupVideoPreview" style="width: 100px; height: 100px; border-radius: 6px; border: 1px solid var(--color-glass-border); display: flex; align-items: center; justify-content: center; overflow: hidden; background: rgba(0,0,0,0.3); flex-shrink: 0;">
                <span style="font-size: 11px; color: var(--color-text-muted);">미리보기</span>
              </div>
              <div style="flex: 1;">
                <input type="file" id="popupVideoFile" accept="video/*" style="display: none;" aria-label="팝업 비디오 파일 선택">
                <button type="button" class="btn btn-outline btn-sm" id="btnTriggerPopupVidUpload">파일 선택</button>
                <p style="font-size: 11px; color: var(--color-text-muted); margin-top: 5px; margin-bottom: 0;">1.5MB 이하의 비디오 파일만 업로드 가능합니다.</p>
              </div>
            </div>
            <label for="popupVideoUrlInput" style="font-size: 12px; margin-top: 10px;">또는 동영상 재생 주소(유튜브 링크 또는 mp4 URL)</label>
            <input type="text" id="popupVideoUrlInput" value="" placeholder="예: https://www.youtube.com/watch?v=영상ID 또는 https://example.com/video.mp4" style="margin-top: 5px;">
            <p style="font-size: 11px; color: var(--color-text-muted); margin-top: 5px; margin-bottom: 0;">* 유튜브 주소는 공유 링크, 일반 주소 등을 넣으면 모달에서 자동으로 임베드 주소로 변환되어 적용됩니다.</p>
          </div>
        </div>

        <button type="submit" class="btn btn-gold" style="margin-top: 10px;">새 팝업 공지 등록</button>
      </form>
    </div>
  `;

  const imgField = document.getElementById('popupImageFieldArea');
  const vidField = document.getElementById('popupVideoFieldArea');
  const radios = document.getElementsByName('popupType');
  const fileInput = document.getElementById('popupImageFile');
  const triggerBtn = document.getElementById('btnTriggerPopupImgUpload');
  const previewDiv = document.getElementById('adminPopupImgPreview');
  const urlInput = document.getElementById('popupImageUrlInput');

  const vidFileInput = document.getElementById('popupVideoFile');
  const vidTriggerBtn = document.getElementById('btnTriggerPopupVidUpload');
  const vidPreviewDiv = document.getElementById('adminPopupVideoPreview');
  const vidUrlInput = document.getElementById('popupVideoUrlInput');

  const form = document.getElementById('adminPopupConfigForm');

  let loadedImageData = '';
  let loadedVideoData = '';

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

  if (vidTriggerBtn && vidFileInput) {
    vidTriggerBtn.addEventListener('click', () => vidFileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      try {
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
            alert('이미지 파일을 읽는 동안 에러가 발생했습니다.');
            fileInput.value = '';
            loadedImageData = '';
            previewDiv.innerHTML = '<span style="font-size: 11px; color: var(--color-text-muted);">미리보기</span>';
          };
          reader.onload = (event) => {
            loadedImageData = event.target.result;
            if (urlInput) urlInput.value = '';
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
      } catch (err) {
        alert('파일을 읽는 동안 오류가 발생했습니다.');
        fileInput.value = '';
        loadedImageData = '';
        if (previewDiv) {
          previewDiv.innerHTML = '<span style="font-size: 11px; color: var(--color-text-muted);">미리보기</span>';
        }
      }
    });
  }

  if (vidFileInput) {
    vidFileInput.addEventListener('change', (e) => {
      try {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.startsWith('video/')) {
            alert('비디오 파일만 업로드할 수 있습니다.');
            vidFileInput.value = '';
            return;
          }
          if (file.size > 1500000) {
            alert('1.5MB 이하의 비디오만 업로드 가능합니다.');
            vidFileInput.value = '';
            return;
          }
          const reader = new FileReader();
          reader.onerror = () => {
            alert('비디오 파일을 읽는 동안 에러가 발생했습니다.');
            vidFileInput.value = '';
            loadedVideoData = '';
            vidPreviewDiv.innerHTML = '<span style="font-size: 11px; color: var(--color-text-muted);">미리보기</span>';
          };
          reader.onload = (event) => {
            loadedVideoData = event.target.result;
            if (vidUrlInput) vidUrlInput.value = '';
            vidPreviewDiv.innerHTML = '';
            const video = document.createElement('video');
            video.src = loadedVideoData;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            video.muted = true;
            video.autoplay = true;
            video.loop = true;
            vidPreviewDiv.appendChild(video);
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        alert('파일을 읽는 동안 오류가 발생했습니다.');
        vidFileInput.value = '';
        loadedVideoData = '';
        if (vidPreviewDiv) {
          vidPreviewDiv.innerHTML = '<span style="font-size: 11px; color: var(--color-text-muted);">미리보기</span>';
        }
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
        const typedUrl = urlInput ? urlInput.value.trim() : '';
        mediaUrl = typedUrl || loadedImageData;
        link = document.getElementById('popupLinkInput').value.trim();
        if (!mediaUrl) {
          alert('팝업에 띄울 이미지를 업로드하거나 외부 주소를 적어 주세요.');
          return;
        }
      } else {
        const typedVidUrl = vidUrlInput ? vidUrlInput.value.trim() : '';
        mediaUrl = typedVidUrl || loadedVideoData;
        if (!mediaUrl) {
          alert('팝업에 띄울 동영상 업로드하거나 외부 주소를 적어 주세요.');
          return;
        }
      }

      const newPopup = {
        id: Date.now(),
        active,
        title,
        type: selectedType,
        mediaUrl,
        link
      };

      popupList.push(newPopup);
      localStorage.setItem('mainPopupData', JSON.stringify(popupList));
      alert('새 팝업 공지가 추가되었습니다.');

      form.reset();
      loadedImageData = '';
      loadedVideoData = '';
      if (previewDiv) previewDiv.innerHTML = '<span style="font-size: 11px; color: var(--color-text-muted);">미리보기</span>';
      if (vidPreviewDiv) vidPreviewDiv.innerHTML = '<span style="font-size: 11px; color: var(--color-text-muted);">미리보기</span>';

      renderAdminPopup();
    });
  }

  container.querySelectorAll('.btn-toggle-popup-active').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      popupList = popupList.map(p => {
        if (p.id === id) {
          return { ...p, active: !p.active };
        }
        return p;
      });
      localStorage.setItem('mainPopupData', JSON.stringify(popupList));
      renderAdminPopup();
    });
  });

  container.querySelectorAll('.btn-delete-popup').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('해당 팝업 공지를 삭제하시겠습니까?')) return;
      const id = parseInt(btn.getAttribute('data-id'), 10);
      popupList = popupList.filter(p => p.id !== id);
      localStorage.setItem('mainPopupData', JSON.stringify(popupList));
      renderAdminPopup();
    });
  });
}

function renderAdminApplications() {
  const container = document.getElementById('adminWorkContent');
  if (!container) return;

  let appList = [];
  try {
    appList = JSON.parse(localStorage.getItem('fanApplicationsData')) || [];
  } catch (err) {
    appList = [];
  }

  let html = `
    <div class="admin-section-header">
      <h3>팬 예약 신청 현황 관리</h3>
    </div>
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 100px;">신청일</th>
            <th style="width: 120px;">신청 구분</th>
            <th style="width: 100px;">신청인</th>
            <th style="width: 130px;">연락처</th>
            <th>상세 내용</th>
            <th style="width: 100px; text-align: center;">상태</th>
            <th style="width: 200px; text-align: center;">관리 작업</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (appList.length === 0) {
    html += `
          <tr>
            <td colspan="7" style="text-align: center; color: var(--color-text-muted); padding: 15px;">등록된 신청 현황이 없습니다.</td>
          </tr>
    `;
  } else {
    appList.forEach(app => {
      const typeLabel = app.type === 'escort' ? '에스코트 키즈' : '원정 버스';
      
      let statusStyle = '';
      let statusText = '';
      if (app.status === 'pending') {
        statusStyle = 'background: rgba(255, 193, 7, 0.15); color: #ffc107; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;';
        statusText = '대기중';
      } else if (app.status === 'approved') {
        statusStyle = 'background: rgba(40, 167, 69, 0.15); color: #28a745; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;';
        statusText = '승인됨';
      } else if (app.status === 'rejected') {
        statusStyle = 'background: rgba(220, 53, 69, 0.15); color: #dc3545; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;';
        statusText = '반려됨';
      }

      html += `
          <tr>
            <td>${escapeHTML(app.createdAt || '')}</td>
            <td><strong>${escapeHTML(typeLabel)}</strong></td>
            <td>${escapeHTML(app.name)}</td>
            <td>${escapeHTML(app.phone)}</td>
            <td>${escapeHTML(app.detail)}</td>
            <td style="text-align: center;">
              <span style="${statusStyle}">${statusText}</span>
            </td>
            <td style="text-align: center;">
              <div class="admin-actions" style="justify-content: center; gap: 8px;">
                <button class="btn btn-outline btn-sm btn-approve-app" data-id="${escapeHTML(String(app.id))}" style="color: #28a745; border-color: rgba(40, 167, 69, 0.3);">승인</button>
                <button class="btn btn-outline btn-sm btn-reject-app" data-id="${escapeHTML(String(app.id))}" style="color: #ffc107; border-color: rgba(255, 193, 7, 0.3);">반려</button>
                <button class="btn btn-outline btn-sm btn-delete-app" data-id="${escapeHTML(String(app.id))}" style="color: #ff4a4a; border-color: rgba(255, 74, 74, 0.3);">삭제</button>
              </div>
            </td>
          </tr>
      `;
    });
  }

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  if (container.querySelectorAll) {
    container.querySelectorAll('.btn-approve-app').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        let list = [];
        try {
          list = JSON.parse(localStorage.getItem('fanApplicationsData')) || [];
        } catch (err) {}
        list = list.map(item => {
          if (String(item.id) === String(id)) {
            return { ...item, status: 'approved' };
          }
          return item;
        });
        localStorage.setItem('fanApplicationsData', JSON.stringify(list));
        renderAdminApplications();
      });
    });

    container.querySelectorAll('.btn-reject-app').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        let list = [];
        try {
          list = JSON.parse(localStorage.getItem('fanApplicationsData')) || [];
        } catch (err) {}
        list = list.map(item => {
          if (String(item.id) === String(id)) {
            return { ...item, status: 'rejected' };
          }
          return item;
        });
        localStorage.setItem('fanApplicationsData', JSON.stringify(list));
        renderAdminApplications();
      });
    });

    container.querySelectorAll('.btn-delete-app').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('해당 신청 내역을 삭제하시겠습니까?')) return;
        const id = btn.getAttribute('data-id');
        let list = [];
        try {
          list = JSON.parse(localStorage.getItem('fanApplicationsData')) || [];
        } catch (err) {}
        list = list.filter(item => String(item.id) !== String(id));
        localStorage.setItem('fanApplicationsData', JSON.stringify(list));
        renderAdminApplications();
      });
    });
  }
}

appGlobalScope.parseYoutubeEmbedUrl = parseYoutubeEmbedUrl;
appGlobalScope.checkAndShowPopup = checkAndShowPopup;
appGlobalScope.initPopupEvents = initPopupEvents;
appGlobalScope.renderAdminPopup = renderAdminPopup;
appGlobalScope.renderAdminApplications = renderAdminApplications;
appGlobalScope.isValidUrl = isValidUrl;



