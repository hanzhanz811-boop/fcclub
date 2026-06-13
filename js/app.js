document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  bindNextMatchWidget();
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

