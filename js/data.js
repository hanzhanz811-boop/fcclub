const squadData = [
  { id: 1, name: "김성민", engName: "KIM Sungmin", number: 10, position: "FW", stats: { matches: 15, goals: 9, assists: 4 }, details: { height: 183, weight: 78, birth: "1998-05-12" }, image: "player_fw_10" },
  { id: 2, name: "이마에", engName: "LEE Mae", number: 7, position: "MF", stats: { matches: 14, goals: 3, assists: 7 }, details: { height: 175, weight: 70, birth: "1999-11-20" }, image: "player_mf_7" },
  { id: 3, name: "박수벽", engName: "PARK Subyeok", number: 4, position: "DF", stats: { matches: 15, goals: 1, assists: 1 }, details: { height: 188, weight: 82, birth: "1995-02-08" }, image: "player_df_4" },
  { id: 4, name: "최철벽", engName: "CHOI Cheolbyeok", number: 1, position: "GK", stats: { matches: 15, goals: 0, assists: 0 }, details: { height: 191, weight: 85, birth: "1994-07-25" }, image: "player_gk_1" },
  { id: 5, name: "성만용", engName: "SUNG Manyong", number: 9, position: "FW", stats: { matches: 10, goals: 5, assists: 1 }, details: { height: 185, weight: 80, birth: "2000-01-15" }, image: "player_fw_9" }
];

const matchData = [
  { id: 101, opponent: "수원 삼성", date: "2026-06-20", time: "19:00", venue: "성만 아레나", type: "Home", status: "upcoming" },
  { id: 102, opponent: "FC 서울", date: "2026-06-25", time: "19:30", venue: "서울월드컵경기장", type: "Away", status: "upcoming" },
  { id: 100, opponent: "전북 현대", date: "2026-06-07", time: "19:00", venue: "성만 아레나", type: "Home", score: { home: 2, away: 1 }, status: "finished" },
  { id: 99, opponent: "울산 HD", date: "2026-06-03", time: "19:00", venue: "울산문수경기장", type: "Away", score: { home: 1, away: 1 }, status: "finished" }
];

const standingData = [
  { rank: 1, teamName: "울산 HD", played: 15, wins: 9, draws: 4, losses: 2, gd: 12, points: 31 },
  { rank: 2, teamName: "성만 FC", played: 15, wins: 8, draws: 5, losses: 2, gd: 9, points: 29 },
  { rank: 3, teamName: "포항 스틸러스", played: 15, wins: 7, draws: 5, losses: 3, gd: 6, points: 26 },
  { rank: 4, teamName: "FC 서울", played: 15, wins: 6, draws: 4, losses: 5, gd: 2, points: 22 },
  { rank: 5, teamName: "수원 삼성", played: 15, wins: 5, draws: 4, losses: 6, gd: -2, points: 19 }
];

const newsData = [
  {
    id: 1,
    date: "2026.06.12",
    title: "성만 FC, 하반기 전력 강화를 위한 국가대표 공격수 영입 임박",
    content: "성만 FC가 팀의 전력 강화를 위해 국가대표 출신 공격수 영입에 임박한 것으로 알려졌습니다.\n\n구단 관계자에 따르면 최근 공격진의 득점력 보강을 위해 해외 리그에서 활약 중인 국가대표 출신 공격수와 긴밀한 협상을 진행해 왔으며, 현재 이적료 및 세부 계약 조항 조율만을 남겨두고 있습니다.\n\n구단 측은 \"다가오는 하반기 일정에 대비해 공격력을 대폭 강화할 수 있는 적임자를 찾아왔다\"며, \"공식 발표는 계약서 조율이 완료되는 대로 며칠 내로 진행할 계획\"이라고 전했습니다.\n\n서포터즈들의 뜨거운 열망에 보답하기 위해 최고 수준의 전력 보강을 꾀하고 있는 성만 FC의 다음 행보가 주목됩니다."
  },
  {
    id: 2,
    date: "2026.06.10",
    title: "성만 아레나 홈 경기 가족 특별석 패키지 티켓 오픈 안내",
    content: "성만 FC의 홈구장인 '성만 아레나'에서 진행되는 다음 홈 경기를 맞아, 가족 서포터즈들을 위한 특별 패키지 티켓을 오픈합니다.\n\n이번 특별 패키지는 가족 구성원 전체가 안락하게 경기를 관람할 수 있는 지정 테이블석과 구단 공식 푸드존 쿠폰, 그리고 한정판 성만 FC 응원 머플러가 포함된 구성입니다.\n\n패키지 티켓 예매는 6월 15일 월요일 오전 10시부터 구단 공식 온라인 예매 사이트를 통해 선착순으로 가능하며, 성만 FC 유료 멤버십 회원은 1시간 먼저 선예매 혜택을 제공받을 수 있습니다.\n\n서포터즈 여러분의 많은 관심과 응원 부탁드립니다."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { squadData, matchData, standingData, newsData };
}
