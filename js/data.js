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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { squadData, matchData, standingData };
}
