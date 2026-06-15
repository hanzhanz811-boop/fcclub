# 2026-06-15 뉴스 상세 모달(News Modal) 디자인 스펙

## 1. 개요
홈 화면의 "Latest News" 항목을 클릭하면 선수단 정보 모달과 같은 방식으로 **뉴스 상세 모달**을 띄워 뉴스 본문을 보여주는 기능을 추가합니다.

## 2. UI / HTML 구조 및 CSS 스타일 정의

### **HTML 구조 (`index.html`)**
`#squadModal` 근처 또는 바디 하단에 뉴스 상세용 모달 구조를 추가합니다.
```html
<!-- News Modal -->
<div id="newsModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="newsModalTitle">
  <div class="modal-wrapper">
    <div class="modal-content">
      <button class="modal-close" id="closeNewsModal" aria-label="닫기">&times;</button>
      <div class="modal-body">
        <div class="news-modal-date" id="newsModalDate"></div>
        <h2 class="news-modal-title" id="newsModalTitle"></h2>
        <div class="news-modal-content" id="newsModalContent"></div>
      </div>
    </div>
  </div>
</div>
```

### **CSS 스타일 (`css/components.css`)**
선수단 모달의 스타일(`.modal`, `.modal-wrapper`, `.modal-close` 등)을 재사용하고, 뉴스 전용 세부 항목의 타이포그래피만 추가 정의합니다.
```css
.news-modal-date {
  font-size: 14px;
  color: var(--color-gold-solid);
  margin-bottom: 10px;
}
.news-modal-title {
  font-family: var(--font-header);
  font-size: 24px;
  color: #fff;
  margin-bottom: 20px;
  line-height: 1.4;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
}
.news-modal-content {
  font-size: 15px;
  line-height: 1.8;
  color: #ddd;
  white-space: pre-wrap;
  word-break: break-all;
}
```

## 3. 데이터 구조 (`js/data.js`)
기존 Mock 데이터 파일인 `js/data.js` 파일 하단에 `newsData` 배열을 정의하여 노출합니다.
```javascript
const newsData = [
  {
    id: 1,
    date: "2026.06.12",
    title: "성만 FC, 하반기 전력 강화를 위한 국가대표 공격수 영입 임박",
    content: "성만 FC가 팀의 전력 강화를 위해 국가대표 출신 공격수 영입에 임박한 것으로 알려졌습니다.\n\n구단 관계자에 따르면 최근 공격진의 득점력 보강을 위해 해외 리그에서 활약 중인 국가대표 출신 공격수와 긴밀한 협상을 진행해  왔으며, 현재 이적료 및 세부 계약 조항 조율만을 남겨두고 있습니다.\n\n구단 측은 \"다가오는 하반기 일정에 대비해 공격력을 대폭 강화할 수 있는 적임자를 찾아왔다\"며, \"공식 발표는 계약서 조율이 완료되는 대로 며칠 내로 진행할 계획\"이라고 전했습니다.\n\n서포터즈들의 뜨거운 열망에 보답하기 위해 최고 수준의 전력 보강을 꾀하고 있는 성만 FC의 다음 행보가 주목됩니다."
  },
  {
    id: 2,
    date: "2026.06.10",
    title: "성만 아레나 홈 경기 가족 특별석 패키지 티켓 오픈 안내",
    content: "성만 FC의 홈구장인 '성만 아레나'에서 진행되는 다음 홈 경기를 맞아, 가족 서포터즈들을 위한 특별 패키지 티켓을 오픈합니다.\n\n이번 특별 패키지는 가족 구성원 전체가 안락하게 경기를 관람할 수 있는 지정 테이블석과 구단 공식 푸드존 쿠폰, 그리고 한정판 성만 FC 응원 머플러가 포함된 구성입니다.\n\n패키지 티켓 예매는 6월 15일 월요일 오전 10시부터 구단 공식 온라인 예매 사이트를 통해 선착순으로 가능하며, 성만 FC 유료 멤버십 회원은 1시간 먼저 선예매 혜택을 제공받을 수 있습니다.\n\n서포터즈 여러분의 많은 관심과 응원 부탁드립니다."
  }
];
```

## 4. 비즈니스 로직 및 이벤트 바인딩 (`js/app.js`)
*   `bindNewsWidget()` 함수를 구현하여 `newsData`를 바탕으로 `index.html` 내의 `.news-list` 영역에 동적으로 카드를 렌더링합니다.
*   각 카드 클릭 시 모달창을 오픈하고 해당 뉴스 기사를 렌더링합니다.
*   ESC 키 감지 및 바깥 영역 클릭으로 닫기 이벤트를 바인딩합니다.
