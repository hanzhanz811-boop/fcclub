# 성만 FC 기능 개선 및 추가 시스템 디자인 스펙 (Spec)

본 문서는 성만 FC 공식 홈페이지의 사용자 편의성 및 관리 기능 강화를 위한 8대 요구사항에 대한 세부 아키텍처 및 디자인 설계를 기술합니다.

---

## 1. 개요 및 목표
- **목표**: 메인 화면 비주얼 고정, 관리자 사용성(상단 탭 레이아웃, 달력 입력, 선수 썸네일) 강화, 다중 팝업 Carousel 탑재, 경기 관련 외부 링크 연결, 팬 참여 예약 신청서 및 관리 어드민 신규 연동.
- **범위**: `index.html`, `js/app.js`, `js/community.js`, `css/components.css`, `tests/run_tests.js`.

---

## 2. 세부 설계 및 요구사항

### 2.1. 메인 배너 문구 레이어링 고정 및 텍스트 수정 (1번)
- **현상**: 배경 슬라이더가 5초마다 동작하며 HTML 요소를 갱신할 때 메인 텍스트가 묻히거나 가려지는 현상 발생.
- **해결책**: `.hero-content`와 `.hero-overlay`에 명시적인 `z-index`를 부여하여 배경 이미지 슬라이더(`hero-slider-bg`) 레이어보다 무조건 위에 노출되도록 고정.
- **텍스트 변경**: 기존 `WE ARE SUNGMAN` 문구를 **`WE ARE SUNGMAN FC`**로 수정하고 골드 그라데이션 포인트 유지.

### 2.2. 관리자 대시보드 상단 가로 탭 전환 (2번)
- **변경 전**: 왼쪽 1열 메뉴 사이드바 (`admin-nav-column`), 오른쪽 3열 작업 영역 (`admin-work-column`)의 Grid 레이아웃.
- **변경 후**: 가로형 상단 탭 구조로 개편.
  - `.admin-layout` 구조를 `flex-direction: column`으로 전환하여 가로폭 공간을 100% 활용.
  - 메뉴 버튼들(`admin-nav-btn`)을 가로 정렬(`flex-direction: row; flex-wrap: wrap`)하고, 로그아웃 버튼은 맨 오른쪽에 배치.
  - 본문 작업 영역(`admin-work-column`)이 가로폭 전체를 사용하여 넓은 뉴스/선수단 관리 테이블을 지원.

### 2.3. 관리자 선수단 리스트 프로필 썸네일 추가 (3번)
- **해결책**: 관리자 선수단 관리 탭(`renderAdminSquad`)의 목록 테이블 첫 번째 컬럼에 `사진` 컬럼을 신설하고, 선수 이미지 데이터를 가로세로 **`32px * 32px`** 크기의 둥근 모서리(Border-radius 4px) 썸네일로 노출. 이미지가 없는 경우 기본 포지션명(GK, DF 등)이 텍스트로 박힌 placeholder를 출력.

### 2.4. 사용자 스쿼드 카드 등번호 배지 추가 (4번)
- **해결책**: 사용자 선수단 탭(`squad`)의 개별 선수 카드 렌더링 시, 이름 아래 영역에 등번호 배지(**`No. [배번]`**)와 포지션을 나타내는 골드/유리 효과 하이라이트 배지를 추가하여 디자인의 가독성 향상.

### 2.5. 다중 팝업 시스템 Carousel 모달 구축 (5번)
- **데이터 구조 변경**: 단일 객체 저장 방식에서 객체 배열 `mainPopupData = [{ id, active, title, type, mediaUrl, link }, ...]` 구조로 전환.
- **사용자 화면**: 메인 홈 탭 진입 시 활성화(`active: true`) 상태인 모든 팝업 데이터를 가져와, **슬라이드(Carousel) 형태의 단일 팝업 모달창**을 렌더링. 이전/다음 화살표 단추와 하단 인디케이터 점을 통해 공지를 회전하며 탐색 가능.
- **관리자 화면**: `renderAdminPopup`에서 등록된 팝업들의 목록 테이블(제목, 타입, 활성 상태, 수정/삭제 액션)을 보여주고, 신규 등록 및 수정 시 Quill 에디터처럼 폼을 열어 관리할 수 있도록 설계.

### 2.6. 경기 일정 등록 날짜 달력 연동 (6번)
- **변경**: 경기 일정 등록 및 수정 폼 내의 날짜 입력 필드(`<input type="text" id="matchFormDate">`)를 HTML5 표준 달력 컨트롤인 **`<input type="date" id="matchFormDate">`**로 전면 전환하여 타이핑 오작동 및 서식 불일치 방지.
- **데이터 가공**: 브라우저 달력 컨트롤의 반환 포맷인 `YYYY-MM-DD` 형식을 기존 데이터 서식(예: `2026.06.25`)과 호환되도록 저장 및 로딩 시 적절하게 문자열 파싱 처리.

### 2.7. 경기 외부 링크 필드 추가 및 사용자 matches 카드 반영 (7번)
- **데이터 필드 신설**: 경기 일정 객체 스키마에 `ticketUrl`, `videoUrl`, `newsUrl` 필드 추가.
- **관리자 화면**: 경기 등록/수정 폼 내에 이 3개의 URL을 입력할 수 있는 텍스트 필드 추가.
- **사용자 화면**: 경기 일정 탭(`matches`)의 경기 카드 하단에 가로 3열 단추형 링크 버튼 그룹을 렌더링.
  - **티켓 예매**: 골드 배경 단추(`btn-gold`)로 가장 밝게 부각.
  - **영상 보기** (하이라이트): 투명 유리 테두리 단추.
  - **관련 뉴스**: 투명 유리 테두리 단추.
  - *각 링크가 등록되어 있는 경우에만 버튼을 생성/노출하며, 클릭 시 새 탭(`target="_blank"`)으로 안전하게 링크를 오픈.*

### 2.8. 팬존 예약 신청 시스템 탑재 (8번)
- **사용자 화면**: 팬존(`fanzone`) 화면 좌측 사이드바(혹은 상단 영역)에 **"에스코트 키즈 신청"** 및 **"원정 버스 예약"** 모달창을 띄우는 핫링크 신청 버튼들을 추가.
  - 신청 모달 오픈 시 참가자 이름, 연락처, 세부 내용(나이, 탑승지 등)을 기재할 수 있는 양식 폼 제공.
  - 데이터를 수집하여 로컬스토리지 `fanApplicationsData = [{ id, type, name, phone, detail, status, createdAt }, ...]` 배열에 저장.
- **관리자 화면**: 관리자 대시보드 탭 리스트에 **"신청 현황 관리"** 메뉴를 추가하여 접수된 명단 목록을 테이블로 시각화하고, 상태 제어(대기/승인/반려/삭제) 기능을 제공.

---

## 3. 데이터 스키마 명세

### 3.1. 팝업 데이터 배열 (`mainPopupData`)
```json
[
  {
    "id": 1,
    "active": true,
    "title": "SUNGMAN FC 멤버십 모집",
    "type": "image",
    "mediaUrl": "data:image/png;base64,...",
    "link": "https://example.com/membership"
  }
]
```

### 3.2. 경기 데이터 추가 필드 (`matchData`)
```json
{
  "id": 1,
  "opponent": "수원 삼성",
  "venue": "성만 아레나",
  "date": "2026-06-25",
  "time": "19:00",
  "scoreHome": null,
  "scoreAway": null,
  "ticketUrl": "https://example.com/ticket",
  "videoUrl": "https://example.com/highlights",
  "newsUrl": "https://example.com/news/1"
}
```

### 3.3. 팬 신청 데이터 (`fanApplicationsData`)
```json
[
  {
    "id": 1,
    "type": "escort", // "escort" (에스코트 키즈) 또는 "bus" (원정 버스)
    "name": "홍길동",
    "phone": "010-1234-5678",
    "detail": "나이: 8세 / 성별: 남",
    "status": "pending", // "pending" (대기), "approved" (승인), "rejected" (반려)
    "createdAt": "2026-06-17"
  }
]
```

---

## 4. 보안 및 예외 처리
- 모든 입력받는 외부 URL(`ticketUrl`, `videoUrl`, `newsUrl`, `mediaUrl` 등)은 렌더링 시 XSS 공격을 방지하기 위해 `isValidUrl(url)` 체크와 `escapeHTML(url)` 인코딩 처리를 통과해야 합니다.
- 파일 업로드 및 데이터 제한 크기(1.5MB 이하 이미지 확인 등) 규칙을 철저히 검사하여 로컬스토리지 메모리 한도를 관리합니다.

---

## 5. 테스트 및 검증 계획
- `tests/run_tests.js` 내에 다음 단위 및 통합 검증 블록들을 신설합니다:
  - `runHeroTextLayerTests()`: 배너 텍스트 렌더링 및 z-index 설정 검증.
  - `runAdminDashboardLayoutTests()`: 가로형 탭 구성 및 DOM 구조 검증.
  - `runSquadThumbnailAndBadgeTests()`: 목록 내 32px 썸네일 탑재 여부 및 스쿼드 배번 카드 렌더링 검사.
  - `runMultiPopupCarouselTests()`: 다중 팝업 Carousel 루프 제어 및 로컬스토리지 데이터 배열 제어 검증.
  - `runMatchCalendarAndUrlTests()`: Date picker 데이터 포맷팅 검증 및Matches 카드 3열 링크 버튼 정상 노출 확인.
  - `runFanApplicationsTests()`: 예약 신청 등록(에스코트, 버스) 및 어드민 관리 탭 내 승인/삭제 로직 무결성 검증.
