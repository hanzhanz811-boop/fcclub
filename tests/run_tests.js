const assert = require('assert');
const { squadData, matchData, standingData } = require('../js/data.js');

console.log('--- RUNNING SUNGMAN FC DATA UNIT TESTS ---');

// 1. Data Integrity Tests
try {
  assert.strictEqual(squadData.length, 5, 'Squad data should have 5 default players');
  assert.strictEqual(squadData[0].name, '김성민', 'First player name should be 김성민');
  assert.strictEqual(squadData[0].stats.goals, 9, '김성민 should have 9 goals');
  
  assert.strictEqual(matchData.filter(m => m.status === 'upcoming').length, 2, 'Should have 2 upcoming matches');
  assert.strictEqual(standingData.find(t => t.teamName === '성만 FC').rank, 2, '성만 FC should be ranked 2nd');

  console.log('✔ Data Integrity Tests Passed!');
} catch (error) {
  console.error('❌ Data Integrity Tests Failed:', error.message);
  process.exit(1);
}
