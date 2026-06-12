const assert = require('assert');
const { squadData, matchData, standingData } = require('../js/data.js');

console.log('=== SUNGMAN FC DATA TEST SUITE ===\n');

let allPassed = true;
const testResults = [];

function runTestBlock(name, fn) {
  console.log(`Running [${name}]...`);
  try {
    fn();
    console.log(`✔ [${name}] Passed!\n`);
    testResults.push({ name, passed: true });
  } catch (error) {
    console.error(`❌ [${name}] Failed:`, error.message);
    console.error(error.stack);
    console.log();
    testResults.push({ name, passed: false, error: error.message });
    allPassed = false;
  }
}

function runSquadTests() {
  assert.ok(Array.isArray(squadData), 'squadData should be an array');
  assert.ok(squadData.length > 0, 'squadData should not be empty');

  squadData.forEach((player, index) => {
    const pStr = `Player at index ${index} (${player.name || 'Unknown'})`;
    assert.strictEqual(typeof player.id, 'number', `${pStr} must have a numeric id`);
    assert.strictEqual(typeof player.name, 'string', `${pStr} must have a string name`);
    assert.strictEqual(typeof player.engName, 'string', `${pStr} must have a string engName`);
    assert.strictEqual(typeof player.number, 'number', `${pStr} must have a numeric number`);
    
    assert.ok(['GK', 'DF', 'MF', 'FW'].includes(player.position), `${pStr} position must be one of GK, DF, MF, FW`);
    
    // Stats verification
    assert.strictEqual(typeof player.stats, 'object', `${pStr} must have a stats object`);
    assert.strictEqual(typeof player.stats.matches, 'number', `${pStr} stats.matches must be a number`);
    assert.strictEqual(typeof player.stats.goals, 'number', `${pStr} stats.goals must be a number`);
    assert.strictEqual(typeof player.stats.assists, 'number', `${pStr} stats.assists must be a number`);

    // Details verification
    assert.strictEqual(typeof player.details, 'object', `${pStr} must have a details object`);
    assert.strictEqual(typeof player.details.height, 'number', `${pStr} details.height must be a number`);
    assert.strictEqual(typeof player.details.weight, 'number', `${pStr} details.weight must be a number`);
    assert.strictEqual(typeof player.details.birth, 'string', `${pStr} details.birth must be a string`);
    
    assert.strictEqual(typeof player.image, 'string', `${pStr} must have a string image reference`);
  });
}

function runMatchTests() {
  assert.ok(Array.isArray(matchData), 'matchData should be an array');
  assert.ok(matchData.length > 0, 'matchData should not be empty');

  matchData.forEach((match, index) => {
    const mStr = `Match at index ${index} (vs ${match.opponent || 'Unknown'})`;
    assert.strictEqual(typeof match.id, 'number', `${mStr} must have a numeric id`);
    assert.strictEqual(typeof match.opponent, 'string', `${mStr} must have a string opponent`);
    assert.strictEqual(typeof match.date, 'string', `${mStr} must have a string date`);
    assert.strictEqual(typeof match.time, 'string', `${mStr} must have a string time`);
    assert.strictEqual(typeof match.venue, 'string', `${mStr} must have a string venue`);
    assert.ok(['Home', 'Away'].includes(match.type), `${mStr} type must be either 'Home' or 'Away'`);
    assert.ok(['upcoming', 'finished'].includes(match.status), `${mStr} status must be either 'upcoming' or 'finished'`);

    if (match.status === 'finished') {
      assert.strictEqual(typeof match.score, 'object', `${mStr} (finished) must have a score object`);
      assert.strictEqual(typeof match.score.home, 'number', `${mStr} score.home must be a number`);
      assert.strictEqual(typeof match.score.away, 'number', `${mStr} score.away must be a number`);
    } else {
      assert.strictEqual(match.score, undefined, `${mStr} (upcoming) should not have a score object`);
    }
  });
}

function runStandingTests() {
  assert.ok(Array.isArray(standingData), 'standingData should be an array');
  assert.ok(standingData.length > 0, 'standingData should not be empty');

  standingData.forEach((row, index) => {
    const rStr = `Standing row at index ${index} (${row.teamName || 'Unknown'})`;
    assert.strictEqual(typeof row.rank, 'number', `${rStr} must have a numeric rank`);
    assert.strictEqual(typeof row.teamName, 'string', `${rStr} must have a string teamName`);
    assert.strictEqual(typeof row.played, 'number', `${rStr} must have a numeric played matches count`);
    assert.strictEqual(typeof row.wins, 'number', `${rStr} must have a numeric wins count`);
    assert.strictEqual(typeof row.draws, 'number', `${rStr} must have a numeric draws count`);
    assert.strictEqual(typeof row.losses, 'number', `${rStr} must have a numeric losses count`);
    assert.strictEqual(typeof row.gd, 'number', `${rStr} must have a numeric goal difference`);
    assert.strictEqual(typeof row.points, 'number', `${rStr} must have numeric points`);
  });
}

function runSpecificIntegrityTests() {
  // Check exact counts and properties of the default mock dataset
  assert.strictEqual(squadData.length, 5, 'Squad data should have exactly 5 players');
  assert.strictEqual(squadData[0].name, '김성민', 'First player name must be 김성민');
  assert.strictEqual(squadData[0].stats.goals, 9, '김성민 should have 9 goals');
  
  assert.strictEqual(matchData.filter(m => m.status === 'upcoming').length, 2, 'Should have exactly 2 upcoming matches');
  assert.strictEqual(matchData.filter(m => m.status === 'finished').length, 2, 'Should have exactly 2 finished matches');
  
  const sungmanFC = standingData.find(t => t.teamName === '성만 FC');
  assert.ok(sungmanFC, '성만 FC must exist in standings');
  assert.strictEqual(sungmanFC.rank, 2, '성만 FC should be ranked 2nd');
}

function runRouterTests() {
  const fs = require('fs');
  const path = require('path');
  const appJsPath = path.join(__dirname, '../js/app.js');
  const appJsCode = fs.readFileSync(appJsPath, 'utf8');
  assert.ok(appJsCode.includes('switchTab'), 'app.js should contain switchTab logic');
  assert.ok(appJsCode.includes('window.location.hash'), 'app.js should use window.location.hash');
}

// Run the test blocks
runTestBlock('Squad Data Schema Tests (runSquadTests)', runSquadTests);
runTestBlock('Match Data Schema Tests (runMatchTests)', runMatchTests);
runTestBlock('Standing Data Schema Tests (runStandingTests)', runStandingTests);
runTestBlock('Specific Integrity Tests (runSpecificIntegrityTests)', runSpecificIntegrityTests);
runTestBlock('Router Syntax Verification (runRouterTests)', runRouterTests);

// Print clean test report
console.log('=== TEST REPORT SUMMARY ===');
testResults.forEach(res => {
  const statusIcon = res.passed ? '✔ PASS' : '❌ FAIL';
  console.log(`[${statusIcon}] - ${res.name}${res.passed ? '' : ` (${res.error})`}`);
});
console.log('===========================\n');

if (!allPassed) {
  console.error('Some tests failed. Exiting with failure code.');
  process.exit(1);
} else {
  console.log('All test blocks completed successfully.');
  process.exit(0);
}
