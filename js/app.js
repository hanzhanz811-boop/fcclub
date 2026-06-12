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
