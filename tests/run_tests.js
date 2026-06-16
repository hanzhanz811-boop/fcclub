const assert = require('assert');
const { squadData, matchData, standingData, newsData } = require('../js/data.js');

if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    store: {},
    getItem(key) { return this.store[key] || null; },
    setItem(key, value) { this.store[key] = String(value); },
    removeItem(key) { delete this.store[key]; },
    clear() { this.store = {}; }
  };
}

function mockParseHTML(html) {
  const root = { tagName: 'BODY', attributes: {}, children: [], isRemoved: false };
  const stack = [root];
  
  const regex = /(<\/?[a-z1-6]+[^>]*>)/gi;
  const parts = html.split(regex);
  
  parts.forEach(part => {
    if (!part) return;
    if (part.startsWith('</')) {
      const tagName = part.substring(2, part.length - 1).trim().toUpperCase();
      while (stack.length > 1 && stack[stack.length - 1].tagName !== tagName) {
        stack.pop();
      }
      if (stack.length > 1) {
        stack.pop();
      }
    } else if (part.startsWith('<')) {
      const isSelfClosing = part.endsWith('/>');
      const tagContent = part.substring(1, part.length - (isSelfClosing ? 2 : 1)).trim();
      const firstSpace = tagContent.search(/\s/);
      const tagName = (firstSpace === -1 ? tagContent : tagContent.substring(0, firstSpace)).toUpperCase();
      const rawAttrs = firstSpace === -1 ? '' : tagContent.substring(firstSpace).trim();
      
      const attributes = {};
      Object.defineProperty(attributes, 'length', {
        value: 0,
        writable: true,
        enumerable: false,
        configurable: true
      });
      
      const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/g;
      let attrMatch;
      let index = 0;
      while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
        const name = attrMatch[1].toLowerCase();
        const value = attrMatch[2];
        Object.defineProperty(attributes, index, {
          value: { name, value },
          writable: true,
          enumerable: false,
          configurable: true
        });
        attributes[name] = value;
        index++;
      }
      attributes.length = index;
      
      const parent = stack[stack.length - 1];
      const el = {
        tagName,
        attributes,
        children: [],
        parent,
        isRemoved: false,
        remove() {
          this.isRemoved = true;
        },
        getAttribute(name) {
          return this.attributes[name.toLowerCase()] || null;
        },
        removeAttribute(name) {
          const lowerName = name.toLowerCase();
          delete this.attributes[lowerName];
          const list = [];
          for (let idx = 0; idx < this.attributes.length; idx++) {
            const item = this.attributes[idx];
            if (item && item.name !== lowerName) {
              list.push(item);
            }
            delete this.attributes[idx];
          }
          list.forEach((item, idx) => {
            Object.defineProperty(this.attributes, idx, {
              value: item,
              writable: true,
              enumerable: false,
              configurable: true
            });
          });
          this.attributes.length = list.length;
        },
        get innerHTML() {
          return mockSerializeHTML(this);
        }
      };
      
      parent.children.push(el);
      if (!isSelfClosing && !['IMG', 'HR', 'BR', 'INPUT'].includes(tagName)) {
        stack.push(el);
      }
    } else {
      const parent = stack[stack.length - 1];
      parent.children.push({
        isText: true,
        text: part,
        isRemoved: false,
        remove() { this.isRemoved = true; }
      });
    }
  });
  
  return root;
}

function mockSerializeHTML(node) {
  if (node.isRemoved) return '';
  if (node.isText) return node.text;
  
  let childrenHTML = node.children.map(child => mockSerializeHTML(child)).join('');
  if (node.tagName === 'BODY') {
    return childrenHTML;
  }
  
  let attrs = '';
  for (let k in node.attributes) {
    attrs += ` ${k}="${node.attributes[k]}"`;
  }
  
  return `<${node.tagName.toLowerCase()}${attrs}>${childrenHTML}</${node.tagName.toLowerCase()}>`;
}

function mockQuerySelectorAll(node, selector) {
  const results = [];
  function traverse(curr) {
    if (curr.isText) return;
    if (curr !== node) {
      if (mockMatches(curr, selector)) {
        results.push(curr);
      }
    }
    if (curr.children) {
      curr.children.forEach(traverse);
    }
  }
  traverse(node);
  return results;
}

function mockMatches(node, selector) {
  const selectors = selector.split(',').map(s => s.trim().toLowerCase());
  return selectors.some(sel => {
    if (sel === '*') return true;
    if (sel.includes('script') && ['SCRIPT', 'OBJECT', 'EMBED', 'LINK', 'META', 'STYLE'].includes(node.tagName)) return true;
    return node.tagName.toLowerCase() === sel;
  });
}

global.DOMParser = class {
  parseFromString(html, type) {
    const root = mockParseHTML(html);
    const body = {
      querySelectorAll: (selector) => {
        return mockQuerySelectorAll(root, selector);
      },
      get innerHTML() {
        return mockSerializeHTML(root);
      }
    };
    return { body };
  }
};

const { CommunityManager, escapeHTML, sanitizeHTML } = require('../js/community.js');
global.sanitizeHTML = sanitizeHTML;

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
  assert.ok(appJsCode.includes('renderNewsPage'), 'app.js should contain renderNewsPage');
  assert.ok(appJsCode.includes('renderAdminLogin'), 'app.js should contain renderAdminLogin');
  assert.ok(!appJsCode.includes('openNewsModal'), 'app.js should not contain openNewsModal');
  assert.ok(appJsCode.includes('renderLoginTab'), 'app.js should contain renderLoginTab');
  assert.ok(appJsCode.includes('renderSignupTab'), 'app.js should contain renderSignupTab');
  assert.ok(appJsCode.includes('currentUser'), 'app.js should use currentUser session state');
}

function runCommunityTests() {
  localStorage.clear();
  const manager = new CommunityManager();
  
  // 1. 초기 로드 및 기본글 탑재 테스트
  const initialPosts = manager.loadPosts();
  assert.ok(Array.isArray(initialPosts), 'loadPosts should return an array');
  assert.ok(initialPosts.length > 0, 'Should load default posts if store is empty');
  
  // 2. 글 작성 테스트
  const userA = { nickname: '작성자A', email: 'userA@example.com' };
  const newPost = manager.createPost('테스트 제목', '본문 내용', userA);
  assert.strictEqual(newPost.title, '테스트 제목');
  assert.strictEqual(newPost.author, '작성자A');
  assert.strictEqual(newPost.likes, 0);
  assert.ok(Array.isArray(newPost.comments));
  assert.strictEqual(typeof newPost.id, 'number', 'Post ID must be a number');
  assert.ok(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(newPost.createdAt), 'Post createdAt should match YYYY-MM-DD HH:MM format');
  
  const posts = manager.loadPosts();
  const found = posts.find(p => p.id === newPost.id);
  assert.ok(found, 'Created post must exist in loaded posts');
  
  // 2b. 실제 localStorage 영속성 및 타 인스턴스 연동 테스트
  const manager2 = new CommunityManager();
  const persistedPosts = manager2.loadPosts();
  const foundPersisted = persistedPosts.find(p => p.id === newPost.id);
  assert.ok(foundPersisted, 'Data must persist in localStorage across manager instances');
  
  // 3. 추천수 증가 테스트
  const likesBefore = found.likes;
  const likeSuccess = manager.likePost(newPost.id);
  assert.strictEqual(likeSuccess, true, 'likePost should return true on success');
  const updatedPosts = manager.loadPosts();
  const updatedFound = updatedPosts.find(p => p.id === newPost.id);
  assert.strictEqual(updatedFound.likes, likesBefore + 1, 'Likes count should increase by 1');
  
  // 4. 댓글 작성 테스트
  const commenter = { nickname: '댓글러', email: 'commenter@example.com' };
  const comment = manager.addComment(newPost.id, '댓글내용', commenter);
  assert.strictEqual(comment.author, '댓글러');
  assert.strictEqual(comment.content, '댓글내용');
  assert.strictEqual(typeof comment.id, 'number', 'Comment ID must be a number');
  assert.ok(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(comment.createdAt), 'Comment createdAt should match YYYY-MM-DD HH:MM format');
  
  const postsWithComment = manager.loadPosts();
  const postWithComment = postsWithComment.find(p => p.id === newPost.id);
  assert.strictEqual(postWithComment.comments.length, 1, 'Should have exactly 1 comment');
  assert.strictEqual(postWithComment.comments[0].id, comment.id);
  
  // 4b. 예외 케이스 / 오류 처리 검증 테스트
  assert.strictEqual(manager.likePost(999999), false, 'likePost on invalid ID should return false');
  assert.strictEqual(manager.addComment(999999, '본문 내용', commenter), null, 'addComment on invalid ID should return null');
  assert.strictEqual(manager.deletePost(999999, userA), false, 'deletePost on invalid ID should return false');
  assert.strictEqual(manager.deleteComment(newPost.id, 999999, commenter), false, 'deleteComment on invalid comment ID should return false');
  assert.strictEqual(manager.deleteComment(999999, comment.id, commenter), false, 'deleteComment on invalid post ID should return false');
  
  // 5. 잘못된 사용자로 댓글 삭제 거부 테스트
  const wrongUser = { nickname: '다른사람', email: 'wrong@example.com', role: 'user', password: 'wrong' };
  const isDeletedCommentFail = manager.deleteComment(newPost.id, comment.id, wrongUser);
  assert.strictEqual(isDeletedCommentFail, false, 'Should fail to delete comment with wrong user');
  
  // 6. 올바른 사용자로 댓글 삭제 테스트
  const isDeletedCommentSuccess = manager.deleteComment(newPost.id, comment.id, commenter);
  assert.strictEqual(isDeletedCommentSuccess, true, 'Should succeed to delete comment with correct user');
  
  const postsAfterCommentDelete = manager.loadPosts();
  const postAfterCommentDelete = postsAfterCommentDelete.find(p => p.id === newPost.id);
  assert.strictEqual(postAfterCommentDelete.comments.length, 0, 'Comment list should be empty after deletion');
  
  // 7. 잘못된 사용자로 게시글 삭제 거부 테스트
  const isDeletedFail = manager.deletePost(newPost.id, wrongUser);
  assert.strictEqual(isDeletedFail, false, 'Should fail to delete post with wrong user');
  
  // 8. 올바른 사용자로 게시글 삭제 테스트
  const isDeletedSuccess = manager.deletePost(newPost.id, userA);
  assert.strictEqual(isDeletedSuccess, true, 'Should succeed to delete post with correct user');
  
  const finalPosts = manager.loadPosts();
  const finalFound = finalPosts.find(p => p.id === newPost.id);
  assert.strictEqual(finalFound, undefined, 'Post must be removed after deletion');

  // 9. 레거시 글/댓글 삭제 테스트 추가
  // 레거시 웰컴 포스트 ID: 1718246400000, 웰컴 댓글 ID: 1718246450000
  const legacyUserWrong = { role: 'user', password: 'wrong' };
  const legacyUserCorrect = { role: 'user', password: '1234' };
  
  // 레거시 댓글 삭제 거부/수행 테스트
  assert.strictEqual(manager.deleteComment(1718246400000, 1718246450000, legacyUserWrong), false, 'Should fail to delete legacy comment with wrong password');
  assert.strictEqual(manager.deleteComment(1718246400000, 1718246450000, legacyUserCorrect), true, 'Should succeed to delete legacy comment with correct password');

  // 레거시 게시글 삭제 거부/수행 테스트
  assert.strictEqual(manager.deletePost(1718246400000, legacyUserWrong), false, 'Should fail to delete legacy post with wrong password');
  assert.strictEqual(manager.deletePost(1718246400000, legacyUserCorrect), true, 'Should succeed to delete legacy post with correct password');
}

function runNewsTests() {
  assert.ok(Array.isArray(newsData), 'newsData should be an array');
  assert.strictEqual(newsData.length, 2, 'newsData should have exactly 2 news items');
  
  newsData.forEach((news, index) => {
    const nStr = `News at index ${index} (${news.title || 'Unknown'})`;
    assert.strictEqual(typeof news.id, 'number', `${nStr} must have a numeric id`);
    assert.strictEqual(typeof news.date, 'string', `${nStr} must have a string date`);
    assert.strictEqual(typeof news.title, 'string', `${nStr} must have a string title`);
    assert.strictEqual(typeof news.content, 'string', `${nStr} must have a string content`);
  });
}

function runEscapeHTMLTests() {
  const escaped = escapeHTML('<div> & "hello" \' </div>');
  assert.strictEqual(escaped, '&lt;div&gt; &amp; &quot;hello&quot; &#39; &lt;/div&gt;');
  assert.strictEqual(escapeHTML(0), '0');
  assert.strictEqual(escapeHTML(false), 'false');
  assert.strictEqual(escapeHTML(null), '');
  assert.strictEqual(escapeHTML(undefined), '');
}

function runSanitizeHTMLTests() {
  // 1. script tag blocking
  const payload1 = '<p>안녕</p><script>alert("xss")<\/script><div>하세요</div>';
  const clean1 = sanitizeHTML(payload1);
  assert.strictEqual(clean1.includes('<script>'), false, 'Should remove script tags');
  assert.strictEqual(clean1.includes('안녕'), true);
  assert.strictEqual(clean1.includes('하세요'), true);

  // 2. inline event handler removal
  const payload2 = '<img src="x" onerror="alert(1)" onclick="console.log(2)" alt="test">';
  const clean2 = sanitizeHTML(payload2);
  assert.strictEqual(clean2.includes('onerror'), false, 'Should remove onerror attribute');
  assert.strictEqual(clean2.includes('onclick'), false, 'Should remove onclick attribute');
  assert.strictEqual(clean2.includes('alt="test"'), true);

  // 3. javascript: protocol removal
  const payload3 = '<a href="javascript:alert(1)">클릭</a><iframe src="javascript:alert(2)"></iframe>';
  const clean3 = sanitizeHTML(payload3);
  assert.strictEqual(clean3.includes('javascript:'), false, 'Should remove javascript: protocol');

  // 4. allowed youtube iframe preservation
  const payload4 = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560"></iframe>';
  const clean4 = sanitizeHTML(payload4);
  assert.strictEqual(clean4.includes('https://www.youtube.com/embed/dQw4w9WgXcQ'), true, 'Should allow youtube embed src');
}

function runUserDataInitializationTests() {
  const fs = require('fs');
  const path = require('path');
  
  localStorage.clear();
  
  const originalDocument = global.document;
  const originalWindow = global.window;
  const originalSessionStorage = global.sessionStorage;
  
  let domContentLoadedCallback = null;
  global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({
      setAttribute: () => {},
      addEventListener: () => {},
      appendChild: () => {},
      querySelector: () => null,
      classList: {
        add: () => {},
        remove: () => {}
      }
    }),
    addEventListener: (event, callback) => {
      if (event === 'DOMContentLoaded') {
        domContentLoadedCallback = callback;
      }
    }
  };
  global.window = {
    location: { hash: '' },
    addEventListener: () => {},
    scrollTo: () => {}
  };
  global.sessionStorage = {
    getItem: () => 'false',
    setItem: () => {}
  };
  
  global.newsData = [];
  global.squadData = [];
  global.matchData = [];
  global.bindAdminFeatures = () => {};
  global.initRouter = () => {};
  global.bindNextMatchWidget = () => {};
  global.bindNewsWidget = () => {};
  global.initSquadFeatures = () => {};
  global.bindMatchCenter = () => {};
  global.initCommunity = () => {};
  
  const appJsPath = path.join(__dirname, '../js/app.js');
  const appJsCode = fs.readFileSync(appJsPath, 'utf8') + '\nObject.defineProperty(global, "usersList", { get: () => usersList, configurable: true });\nglobal.initLocalStorageData = initLocalStorageData;\n';
  
  eval(appJsCode);
  
  if (domContentLoadedCallback) {
    domContentLoadedCallback();
  }
  
  assert.ok(Array.isArray(global.usersList), 'global.usersList should be an array');
  assert.strictEqual(global.usersList.length, 2, 'global.usersList should contain exactly 2 initial users');
  
  const adminUser = global.usersList.find(u => u.role === 'admin');
  assert.ok(adminUser, 'Admin user should be initialized');
  assert.strictEqual(adminUser.email, 'admin@sungmanfc.com');
  assert.strictEqual(adminUser.password, 'admin1234');
  assert.strictEqual(adminUser.nickname, '관리자');
  assert.strictEqual(adminUser.id, 1);
  assert.strictEqual(adminUser.createdAt, '2026-06-15');
  
  const regularUser = global.usersList.find(u => u.role === 'user');
  assert.ok(regularUser, 'Regular user should be initialized');
  assert.strictEqual(regularUser.email, 'user@sungmanfc.com');
  assert.strictEqual(regularUser.password, 'user1234');
  assert.strictEqual(regularUser.nickname, '성만팬');
  assert.strictEqual(regularUser.id, 2);
  assert.strictEqual(regularUser.createdAt, '2026-06-15');
  
  const storedData = localStorage.getItem('userData');
  assert.ok(storedData, 'userData should exist in localStorage');
  const parsedStored = JSON.parse(storedData);
  assert.strictEqual(parsedStored.length, 2);
  assert.strictEqual(parsedStored[0].email, 'admin@sungmanfc.com');
  
  localStorage.setItem('userData', JSON.stringify([{ id: 99, email: 'custom@example.com' }]));
  global.initLocalStorageData();
  assert.strictEqual(global.usersList.length, 1, 'Should load existing userData instead of overriding');
  assert.strictEqual(global.usersList[0].email, 'custom@example.com');
  
  localStorage.setItem('userData', 'corrupted-json-{[');
  global.initLocalStorageData();
  assert.deepStrictEqual(global.usersList, [], 'Should fallback to empty array on corrupted JSON');
  
  global.document = originalDocument;
  global.window = originalWindow;
  global.sessionStorage = originalSessionStorage;
  
  delete global.usersList;
  delete global.newsList;
  delete global.squadList;
  delete global.matchList;
  delete global.isAdminLoggedIn;
  delete global.activeAdminTab;
  delete global.activeNewsId;
  delete global.initLocalStorageData;
  delete global.initRouter;
  delete global.switchTab;

  delete global.newsData;
  delete global.squadData;
  delete global.matchData;
  delete global.bindAdminFeatures;
  delete global.bindNextMatchWidget;
  delete global.bindNewsWidget;
  delete global.initSquadFeatures;
  delete global.bindMatchCenter;
  delete global.initCommunity;
}

function runSignupNicknameValidationTests() {
  const fs = require('fs');
  const path = require('path');

  const originalDocument = global.document;
  const originalWindow = global.window;

  let signupSubmitCallback = null;
  const errorMsgEl = { textContent: '' };
  
  const mockElements = {
    'memberLoginForm': null,
    'memberSignupForm': {
      addEventListener: (event, callback) => {
        if (event === 'submit') {
          signupSubmitCallback = callback;
        }
      }
    },
    'signupEmail': { value: 'test@example.com' },
    'signupNickname': { value: '   ' }, // empty nickname after trim
    'signupPassword': { value: 'password123' },
    'signupPasswordConfirm': { value: 'password123' },
    'signupErrorMsg': errorMsgEl
  };

  global.document = {
    getElementById: (id) => mockElements[id] || null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
  global.window = {
    location: { hash: '' }
  };

  const appJsPath = path.join(__dirname, '../js/app.js');
  const appJsCode = fs.readFileSync(appJsPath, 'utf8') + '\nglobal.bindAuthFeatures = bindAuthFeatures;\n';
  
  eval(appJsCode);

  global.bindAuthFeatures();

  assert.ok(signupSubmitCallback, 'Signup submit callback should be registered');
  
  // Trigger form submission
  let preventDefaultCalled = false;
  const mockEvent = {
    preventDefault: () => { preventDefaultCalled = true; }
  };
  
  signupSubmitCallback(mockEvent);
  
  assert.ok(preventDefaultCalled, 'preventDefault should be called');
  assert.strictEqual(errorMsgEl.textContent, '닉네임을 입력해 주세요.', 'Error message should complain about empty nickname');

  // Clean up
  global.document = originalDocument;
  global.window = originalWindow;
  delete global.bindAuthFeatures;
}

function runAdminMembersDashboardTests() {
  const fs = require('fs');
  const path = require('path');

  const originalDocument = global.document;
  const originalWindow = global.window;
  
  localStorage.clear();

  let innerHTMLContent = '';
  const toggleRoleButtons = [];
  const deleteMemberButtons = [];

  const mockContainer = {
    get innerHTML() {
      return innerHTMLContent;
    },
    set innerHTML(val) {
      innerHTMLContent = val;
    },
    querySelectorAll: (selector) => {
      if (selector === '.btn-toggle-role') {
        return toggleRoleButtons;
      }
      if (selector === '.btn-delete-member') {
        return deleteMemberButtons;
      }
      return [];
    }
  };

  const createMockButton = (id, type) => {
    const btn = {
      getAttribute: (attr) => id.toString(),
      addEventListener: (event, callback) => {
        btn.clickCallback = callback;
      }
    };
    if (type === 'toggle') toggleRoleButtons.push(btn);
    if (type === 'delete') deleteMemberButtons.push(btn);
    return btn;
  };

  global.document = {
    getElementById: (id) => {
      if (id === 'adminWorkContent') {
        return mockContainer;
      }
      return null;
    },
    querySelectorAll: () => [],
    addEventListener: () => {}
  };

  let confirmCalled = false;
  let confirmMsg = '';
  global.confirm = (msg) => {
    confirmCalled = true;
    confirmMsg = msg;
    return true;
  };

  const appJsPath = path.join(__dirname, '../js/app.js');
  const appJsCode = fs.readFileSync(appJsPath, 'utf8') + `
    Object.defineProperty(global, "currentUser", { get: () => currentUser, set: (val) => { currentUser = val; }, configurable: true });
    Object.defineProperty(global, "usersList", { get: () => usersList, set: (val) => { usersList = val; }, configurable: true });
    global.renderAdminMembers = renderAdminMembers;
  `;
  
  eval(appJsCode);

  global.usersList = [
    { id: 1, email: 'admin@sungmanfc.com', nickname: '관리자', role: 'admin', createdAt: '2026-06-15' },
    { id: 2, email: 'user@sungmanfc.com', nickname: '성만팬', role: 'user', createdAt: '2026-06-15' }
  ];
  global.currentUser = global.usersList[0];

  createMockButton(2, 'toggle');
  createMockButton(2, 'delete');

  global.renderAdminMembers();

  assert.ok(innerHTMLContent.includes('회원 관리'), 'Should contain "회원 관리" header');
  assert.ok(innerHTMLContent.includes('admin@sungmanfc.com (본인)'), 'Should label the logged-in admin user as (본인)');
  assert.ok(innerHTMLContent.includes('user@sungmanfc.com'), 'Should display user email');
  assert.ok(innerHTMLContent.includes('관리자로 격상'), 'Should show action button "관리자로 격상" for user');
  assert.ok(innerHTMLContent.includes('disabled'), 'Should disable buttons for self');

  toggleRoleButtons[0].clickCallback();
  assert.ok(confirmCalled, 'confirm should be called');
  assert.ok(confirmMsg.includes('성만팬') && confirmMsg.includes('관리자'), 'Confirm message should contain nickname and target role');
  assert.strictEqual(global.usersList[1].role, 'admin', 'Role should be toggled to admin');

  confirmCalled = false;
  confirmMsg = '';
  deleteMemberButtons[0].clickCallback();
  assert.ok(confirmCalled, 'confirm should be called');
  assert.ok(confirmMsg.includes('성만팬') && confirmMsg.includes('강제 탈퇴'), 'Confirm message should contain nickname and delete notice');
  assert.strictEqual(global.usersList.length, 1, 'User should be deleted');
  assert.strictEqual(global.usersList[0].id, 1, 'Only admin should remain');

  global.document = originalDocument;
  global.window = originalWindow;
  delete global.confirm;
  delete global.usersList;
  delete global.currentUser;
  delete global.renderAdminMembers;
}

function runSquadFormImageTests() {
  const fs = require('fs');
  const path = require('path');

  const originalDocument = global.document;
  const originalWindow = global.window;
  const originalAlert = global.alert;
  const originalFileReader = global.FileReader;

  let innerHTMLContent = '';
  const mockContainer = {
    get innerHTML() { return innerHTMLContent; },
    set innerHTML(val) { innerHTMLContent = val; }
  };

  const previewChildren = [];
  const mockPreviewDiv = {
    get innerHTML() { return innerHTMLContent; },
    set innerHTML(val) { innerHTMLContent = val; },
    appendChild(child) {
      previewChildren.push(child);
    }
  };

  let fileChangeCallback = null;
  const mockFileInput = {
    value: 'dummy',
    addEventListener: (event, callback) => {
      if (event === 'change') {
        fileChangeCallback = callback;
      }
    }
  };

  const createdElements = [];
  global.document = {
    getElementById: (id) => {
      if (id === 'adminWorkContent') return mockContainer;
      if (id === 'adminPlayerImagePreview') return mockPreviewDiv;
      if (id === 'squadFormImageFile') return mockFileInput;
      return {
        value: '',
        addEventListener: () => {},
        style: {}
      };
    },
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        style: {},
        setAttribute: () => {},
        appendChild: () => {}
      };
      createdElements.push(el);
      return el;
    },
    querySelectorAll: () => [],
    addEventListener: () => {}
  };

  let alertMessage = '';
  global.alert = (msg) => {
    alertMessage = msg;
  };

  // Mock FileReader
  let fileReaderInstance = null;
  global.FileReader = class {
    constructor() {
      fileReaderInstance = this;
    }
    readAsDataURL(file) {
      this.file = file;
    }
  };

  // Load app.js and expose showSquadForm
  const appJsPath = path.join(__dirname, '../js/app.js');
  const appJsCode = fs.readFileSync(appJsPath, 'utf8') + `
    global.showSquadForm = showSquadForm;
    global.squadList = squadList;
  `;
  eval(appJsCode);

  // Invoke showSquadForm
  global.showSquadForm();

  // Test 1: Check initial rendering calls updatePreview, which shouldn't have img because loadedImageData is empty initially
  assert.strictEqual(previewChildren.length, 0, 'Should not have appended any image child initially');

  // Test 2: Trigger file change with a non-image file
  alertMessage = '';
  mockFileInput.value = 'invalid-image.txt';
  fileChangeCallback({
    target: {
      files: [{
        name: 'test.txt',
        type: 'text/plain',
        size: 500
      }]
    }
  });
  assert.strictEqual(alertMessage, '이미지 파일만 업로드할 수 있습니다.', 'Should alert on non-image file');
  assert.strictEqual(mockFileInput.value, '', 'Should reset file input value');

  // Test 3: Trigger file change with a valid image file, verify file reader error handling
  alertMessage = '';
  mockFileInput.value = 'image.png';
  fileChangeCallback({
    target: {
      files: [{
        name: 'image.png',
        type: 'image/png',
        size: 50000
      }]
    }
  });
  // Simulate FileReader error
  assert.ok(fileReaderInstance, 'FileReader instance should be created');
  assert.ok(typeof fileReaderInstance.onerror === 'function', 'FileReader.onerror should be a function');
  fileReaderInstance.onerror();
  assert.strictEqual(alertMessage, '이미지 파일을 읽는 동안 에러가 발생했습니다.', 'Should alert on file read error');
  assert.strictEqual(mockFileInput.value, '', 'Should reset file input value on error');

  // Test 4: Trigger file change with a valid image, mock success, verify secure DOM manipulation preview
  alertMessage = '';
  mockFileInput.value = 'image.png';
  fileChangeCallback({
    target: {
      files: [{
        name: 'image.png',
        type: 'image/png',
        size: 50000
      }]
    }
  });
  
  // Clear previewChildren to check new append
  previewChildren.length = 0;
  mockPreviewDiv.innerHTML = 'some-dummy';
  
  fileReaderInstance.onload({
    target: {
      result: 'data:image/png;base64,abcdef'
    }
  });

  assert.strictEqual(mockPreviewDiv.innerHTML, '', 'previewDiv should be cleared before appending');
  assert.strictEqual(previewChildren.length, 1, 'Should append exactly 1 child to previewDiv');
  const appendedImg = previewChildren[0];
  assert.strictEqual(appendedImg.tagName, 'IMG', 'Appended child must be an IMG element');
  assert.strictEqual(appendedImg.src, 'data:image/png;base64,abcdef', 'IMG src must be the loaded image data');
  assert.strictEqual(appendedImg.alt, '업로드된 이미지', 'IMG alt must be correct');
  assert.strictEqual(appendedImg.style.width, '100%', 'IMG width style must be 100%');
  assert.strictEqual(appendedImg.style.height, '100%', 'IMG height style must be 100%');
  assert.strictEqual(appendedImg.style.objectFit, 'cover', 'IMG objectFit style must be cover');

  // Test 5: Trigger file change with a file exceeding 1.5MB limit
  alertMessage = '';
  mockFileInput.value = 'large-image.png';
  fileChangeCallback({
    target: {
      files: [{
        name: 'large-image.png',
        type: 'image/png',
        size: 2000000
      }]
    }
  });
  assert.strictEqual(alertMessage, '1.5MB 이하의 이미지만 업로드 가능합니다.', 'Should alert on file exceeding 1.5MB');
  assert.strictEqual(mockFileInput.value, '', 'Should reset file input value');

  // Clean up
  global.document = originalDocument;
  global.window = originalWindow;
  global.alert = originalAlert;
  global.FileReader = originalFileReader;
  delete global.showSquadForm;
  delete global.squadList;
}

function runPlayerImageIntegrationTests() {
  const fs = require('fs');
  const path = require('path');

  const originalDocument = global.document;
  const originalWindow = global.window;

  let squadGridHTML = '';
  const mockSquadGrid = {
    get innerHTML() {
      return squadGridHTML;
    },
    set innerHTML(val) {
      squadGridHTML = val;
    },
    appendChild: (child) => {
      squadGridHTML += child.innerHTML;
    }
  };

  global.document = {
    getElementById: (id) => {
      if (id === 'squadGrid') {
        return mockSquadGrid;
      }
      return null;
    },
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        style: {},
        setAttribute: () => {},
        addEventListener: () => {},
        classList: {
          add: () => {},
          remove: () => {}
        },
        innerHTML: ''
      };
      return el;
    },
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => null
  };

  global.window = {
    addEventListener: () => {}
  };

  try {
    const appJsPath = path.join(__dirname, '../js/app.js');
    const appJsCode = fs.readFileSync(appJsPath, 'utf8') + `
      Object.defineProperty(global, "squadList", {
        get: () => squadList,
        set: (val) => { squadList = val; },
        configurable: true
      });
      global.renderSquad = renderSquad;
    `;
    eval(appJsCode);

    // Setup mock squadList
    global.squadList = [
      {
        id: 10,
        name: '홍길동',
        engName: 'Hong Gildong',
        number: 10,
        position: 'FW',
        image: 'player_fw_10',
        stats: { matches: 0, goals: 0, assists: 0 },
        details: { height: 180, weight: 75, birth: '1995-01-01' }
      },
      {
        id: 20,
        name: '이순신',
        engName: 'Yi Sunsin',
        number: 20,
        position: 'DF',
        image: 'data:image/png;base64,abcdef',
        stats: { matches: 0, goals: 0, assists: 0 },
        details: { height: 185, weight: 80, birth: '1990-01-01' }
      }
    ];

    // Run the renderSquad function
    global.renderSquad('ALL');

    // Verify Case A: Legacy image key 'player_fw_10' yields a placeholder
    assert.ok(squadGridHTML.includes('player-img-placeholder'), 'Legacy image should yield player-img-placeholder class');
    assert.ok(!squadGridHTML.includes('src="player_fw_10"'), 'Legacy image should not render as a source attribute');

    // Verify Case B: Base64 image renders in an img tag
    assert.ok(squadGridHTML.includes('src="data:image/png;base64,abcdef"'), 'Base64 image should render inside img src attribute');
    assert.ok(squadGridHTML.includes('class="player-img"'), 'Base64 image should render with player-img class');
  } finally {
    // Restore mocks
    global.document = originalDocument;
    global.window = originalWindow;
    delete global.squadList;
    delete global.renderSquad;
  }
}

function runMainSliderTests() {
  const fs = require('fs');
  const path = require('path');

  localStorage.clear();

  const originalDocument = global.document;
  const originalWindow = global.window;
  const originalAlert = global.alert;
  const originalConfirm = global.confirm;
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;

  let alertMessage = '';
  global.alert = (msg) => { alertMessage = msg; };

  let confirmCalled = false;
  global.confirm = (msg) => { confirmCalled = true; return true; };

  const activeIntervals = [];
  global.setInterval = (cb, delay) => {
    const id = originalSetInterval(cb, delay);
    activeIntervals.push(id);
    return id;
  };
  global.clearInterval = (id) => {
    originalClearInterval(id);
    const index = activeIntervals.indexOf(id);
    if (index > -1) activeIntervals.splice(index, 1);
  };

  // Mock document and elements
  const appendedChildren = [];
  const mockHero = {
    style: { backgroundImage: '' },
    querySelector: (sel) => {
      if (sel === '.hero-slider-bg') return { remove: () => {} };
      return null;
    },
    insertBefore: (newChild, refChild) => {
      appendedChildren.push(newChild);
    },
    firstChild: {}
  };

  let adminWorkContentHTML = '';
  let adminSliderContentHTML = '';
  const fileInputListeners = {};
  const triggerBtnListeners = {};
  const uploadFormListeners = {};

  const mockElements = {
    'adminWorkContent': {
      get innerHTML() { return adminWorkContentHTML; },
      set innerHTML(val) { adminWorkContentHTML = val; }
    },
    'adminSliderContent': {
      get innerHTML() { return adminSliderContentHTML; },
      set innerHTML(val) { adminSliderContentHTML = val; },
      querySelectorAll: (sel) => []
    },
    'sliderImageFile': {
      value: '',
      addEventListener: (ev, cb) => { fileInputListeners[ev] = cb; },
      style: {}
    },
    'btnTriggerSliderUpload': {
      addEventListener: (ev, cb) => { triggerBtnListeners[ev] = cb; },
      style: {}
    },
    'adminSliderImagePreview': {
      innerHTML: '',
      appendChild: (child) => {}
    },
    'adminSliderUploadForm': {
      addEventListener: (ev, cb) => { uploadFormListeners[ev] = cb; }
    }
  };

  const createdElements = [];
  global.document = {
    querySelector: (sel) => {
      if (sel === '.hero-section' || sel === '.hero-banner') return mockHero;
      if (sel === '.admin-layout nav.admin-nav-column ul[role="tablist"]') return { appendChild: () => {} };
      return null;
    },
    getElementById: (id) => {
      if (id === 'admin-tab-slider') return null; // dynamically added button doesn't exist initially
      return mockElements[id] || {
        value: '',
        addEventListener: () => {},
        style: {},
        innerHTML: '',
        querySelectorAll: () => []
      };
    },
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        style: {},
        setAttribute: () => {},
        appendChild: (child) => {
          if (!el.children) el.children = [];
          el.children.push(child);
        },
        querySelectorAll: () => []
      };
      createdElements.push(el);
      return el;
    },
    addEventListener: () => {},
    querySelectorAll: () => []
  };

  global.window = {
    addEventListener: () => {}
  };

  try {
    const appJsPath = path.join(__dirname, '../js/app.js');
    const appJsCode = fs.readFileSync(appJsPath, 'utf8') + `
      global.initMainSlider = initMainSlider;
      global.renderAdminSlider = renderAdminSlider;
      global.deleteSliderImage = deleteSliderImage;
    `;
    eval(appJsCode);

    // Test 1: initMainSlider fallback when empty
    global.initMainSlider();
    assert.strictEqual(appendedChildren.length, 1, 'Should append one slider background');
    const sliderBg = appendedChildren[0];
    assert.strictEqual(sliderBg.tagName, 'DIV');
    assert.strictEqual(sliderBg.className, 'hero-slider-bg');
    assert.strictEqual(sliderBg.children.length, 1, 'Should have 1 slide by default');
    assert.strictEqual(sliderBg.children[0].style.backgroundImage, "url('assets/stadium_bg.png')", 'Fallback image should be assets/stadium_bg.png');

    // Test 2: initMainSlider with custom data
    appendedChildren.length = 0;
    const testData = [
      { id: 101, image: 'image1.png' },
      { id: 102, image: 'image2.png' }
    ];
    localStorage.setItem('mainSliderData', JSON.stringify(testData));
    global.initMainSlider();
    assert.strictEqual(appendedChildren.length, 1);
    const customSliderBg = appendedChildren[0];
    assert.strictEqual(customSliderBg.children.length, 2);
    assert.strictEqual(customSliderBg.children[0].style.backgroundImage, "url('image1.png')");
    assert.strictEqual(customSliderBg.children[1].style.backgroundImage, "url('image2.png')");

    // Test 3: deleteSliderImage
    confirmCalled = false;
    global.deleteSliderImage(101);
    assert.ok(confirmCalled, 'Should ask for confirmation');
    const updatedData = JSON.parse(localStorage.getItem('mainSliderData'));
    assert.strictEqual(updatedData.length, 1, 'Should delete one item');
    assert.strictEqual(updatedData[0].id, 102, 'Remaining item should have ID 102');

    // Test 4: 3장 초과 등록 시 업로드 차단 동작 검증
    localStorage.setItem('mainSliderData', JSON.stringify([
      { id: 201, image: 'image1.png' },
      { id: 202, image: 'image2.png' },
      { id: 203, image: 'image3.png' }
    ]));
    
    alertMessage = '';
    global.renderAdminSlider();

    // 1) 3장 찼을 때 innerHTML 템플릿에 추가 불가능 안내 문구 및 disabled 렌더링 확인
    assert.ok(adminSliderContentHTML.includes('이미 최대 3장의 이미지가 모두 등록되어 추가할 수 없습니다.'), 'Should show limit message');
    assert.ok(adminSliderContentHTML.includes('disabled'), 'Should have disabled attributes');

    // 2) submit 핸들러 동작 시 차단 검증
    assert.ok(typeof uploadFormListeners['submit'] === 'function', 'Submit listener should be registered');
    let preventDefaultCalled = false;
    const mockSubmitEvent = {
      preventDefault: () => { preventDefaultCalled = true; }
    };
    uploadFormListeners['submit'](mockSubmitEvent);
    assert.ok(preventDefaultCalled, 'preventDefault should be called on submit when limit is reached');
    assert.strictEqual(alertMessage, '슬라이더 이미지는 최대 3장까지만 등록 가능합니다.', 'Should alert on exceeding limit');

  } finally {
    activeIntervals.forEach(id => originalClearInterval(id));
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;

    global.document = originalDocument;
    global.window = originalWindow;
    global.alert = originalAlert;
    global.confirm = originalConfirm;
    delete global.initMainSlider;
    delete global.renderAdminSlider;
    delete global.deleteSliderImage;
    delete global.sliderTimer;
    delete global.isValidUrl;
    delete global.initPopupEvents;
    localStorage.removeItem('mainSliderData');
  }
}

function runMainSliderAndPopupTests() {
  const fs = require('fs');
  const path = require('path');

  localStorage.clear();

  const originalDocument = global.document;
  const originalWindow = global.window;
  const originalAlert = global.alert;

  let alertMessage = '';
  global.alert = (msg) => {
    alertMessage = msg;
  };

  // Mock Document & Window
  let mockNoticePopup = {
    classList: {
      add: (cls) => { mockNoticePopup.isVisible = true; },
      remove: (cls) => { mockNoticePopup.isVisible = false; }
    },
    isVisible: false
  };
  let mockPopupTitle = { textContent: '' };
  let mockPopupBody = {
    innerHTML: '',
    appendChild: (el) => {
      mockPopupBody.childElement = el;
    },
    childElement: null
  };

  global.document = {
    getElementById: (id) => {
      if (id === 'mainNoticePopup') return mockNoticePopup;
      if (id === 'popupTitle') return mockPopupTitle;
      if (id === 'popupBodyContent') return mockPopupBody;
      return {
        value: '',
        addEventListener: () => {},
        style: {}
      };
    },
    createElement: (tag) => {
      return {
        tagName: tag.toUpperCase(),
        style: {},
        setAttribute: () => {},
        appendChild: () => {}
      };
    },
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => null
  };

  global.window = {
    addEventListener: () => {}
  };

  try {
    const appJsPath = path.join(__dirname, '../js/app.js');
    const appJsCode = fs.readFileSync(appJsPath, 'utf8') + `
      global.parseYoutubeEmbedUrl = parseYoutubeEmbedUrl;
      global.checkAndShowPopup = checkAndShowPopup;
    `;
    eval(appJsCode);

    // Test 1: 유튜브 URL 정규식 치환 기능 검증
    const rawUrl1 = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const parsedUrl1 = global.parseYoutubeEmbedUrl(rawUrl1);
    assert.strictEqual(parsedUrl1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Standard Youtube URL should convert to embed URL');

    const rawUrl2 = 'https://youtu.be/dQw4w9WgXcQ';
    const parsedUrl2 = global.parseYoutubeEmbedUrl(rawUrl2);
    assert.strictEqual(parsedUrl2, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Short Youtube URL should convert to embed URL');

    // Test 2: 팝업 미노출 (active: false인 경우)
    localStorage.setItem('mainPopupData', JSON.stringify({ active: false }));
    mockNoticePopup.isVisible = false;
    global.checkAndShowPopup();
    assert.strictEqual(mockNoticePopup.isVisible, false, 'Popup should not be visible when active is false');

    // Test 3: 팝업 노출 (active: true이고 오늘하루닫기 만료 상태)
    localStorage.setItem('mainPopupData', JSON.stringify({
      active: true,
      type: 'image',
      title: '신규 이벤트',
      mediaUrl: 'data:image/png;base64,abcdef',
      link: 'https://sungman.com'
    }));
    mockNoticePopup.isVisible = false;
    global.checkAndShowPopup();
    assert.strictEqual(mockNoticePopup.isVisible, true, 'Popup should show when active is true');
    assert.strictEqual(mockPopupTitle.textContent, '신규 이벤트', 'Title should match configuration');
    
    // Test 4: 팝업 노출 차단 (오늘 하루 보지 않기 타임스탬프가 미래 시점인 경우)
    const futureTime = Date.now() + 10000;
    localStorage.setItem('popup_hide_until', String(futureTime));
    mockNoticePopup.isVisible = false;
    global.checkAndShowPopup();
    assert.strictEqual(mockNoticePopup.isVisible, false, 'Popup should not show if popup_hide_until is in the future');

  } finally {
    // Clean up
    global.document = originalDocument;
    global.window = originalWindow;
    global.alert = originalAlert;
    delete global.parseYoutubeEmbedUrl;
    delete global.checkAndShowPopup;
    delete global.isValidUrl;
    delete global.initPopupEvents;
    localStorage.removeItem('mainPopupData');
    localStorage.removeItem('popup_hide_until');
  }
}

function runNewsSortingTests() {
  const fs = require('fs');
  const path = require('path');
  const originalDocument = global.document;
  

  
  const renderedTitles = [];
  const mockContainer = {
    innerHTML: '',
    appendChild: (child) => {
      const titleEl = child.querySelector('.news-title') || child.querySelector('.news-item-title');
      if (titleEl) renderedTitles.push(titleEl.textContent);
    },
    querySelectorAll: () => []
  };
  
  global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
      if (id === 'newsListContainer' || id === 'newsTabList') return mockContainer;
      return { innerHTML: '', appendChild: () => {}, querySelectorAll: () => [] };
    },
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        _innerHTML: '',
        set innerHTML(val) { el._innerHTML = val; },
        get innerHTML() { return el._innerHTML; },
        querySelector: (sel) => {
          const cls = sel.replace('.', '');
          const regex = new RegExp(`class=["']${cls}["'][^>]*>([^<]*)<\/`, 'i');
          const match = el._innerHTML.match(regex);
          if (!match) return null;
          return {
            textContent: match[1],
            addEventListener: () => {}
          };
        },
        setAttribute: () => {},
        addEventListener: () => {}
      };
      return el;
    }
  };
  
  try {
    const appJsPath = path.join(__dirname, '../js/app.js');
    const appJsCode = fs.readFileSync(appJsPath, 'utf8') + `
      global.bindNewsWidget = bindNewsWidget;
      global.renderNewsPage = renderNewsPage;
      Object.defineProperty(global, "newsList", {
        get: () => newsList,
        set: (val) => { newsList = val; },
        configurable: true
      });
      Object.defineProperty(global, "activeNewsId", {
        get: () => activeNewsId,
        set: (val) => { activeNewsId = val; },
        configurable: true
      });
    `;
    eval(appJsCode);

    // Set the mock newsList values
    global.newsList = [
      { id: 1, date: '2026-06-01', title: '옛날 뉴스', content: '옛날 뉴스 본문' },
      { id: 2, date: '2026-06-02', title: '최신 뉴스', content: '최신 뉴스 본문' }
    ];

    global.bindNewsWidget();
    assert.strictEqual(renderedTitles[0], '최신 뉴스', 'Main widget should render newest news first');
    
    renderedTitles.length = 0;
    global.renderNewsPage();
    assert.strictEqual(renderedTitles[0], '최신 뉴스', 'News tab list should render newest news first');
    assert.strictEqual(global.activeNewsId, 2, 'Default active news should be the newest news');
  } finally {
    global.document = originalDocument;
    delete global.newsList;
    delete global.activeNewsId;
    delete global.bindNewsWidget;
    delete global.renderNewsPage;
  }
}

function runAdminNewsQuillTests() {
  const fs = require('fs');
  const path = require('path');
  const originalDocument = global.document;
  const originalWindow = global.window;
  
  let isQuillInitialized = false;
  let appendedHTML = '';
  
  const mockContainer = {
    set innerHTML(val) { appendedHTML = val; },
    get innerHTML() { return appendedHTML; },
    querySelectorAll: () => []
  };
  
  global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
      if (id === 'adminWorkContent') return mockContainer;
      return { value: '', addEventListener: () => {}, style: {} };
    },
    createElement: () => ({ setAttribute: () => {}, style: {} }),
    querySelectorAll: () => []
  };
  
  try {
    const appJsPath = path.join(__dirname, '../js/app.js');
    const appJsCode = fs.readFileSync(appJsPath, 'utf8') + `
      global.renderAdminNews = renderAdminNews;
      global.showNewsForm = showNewsForm;
    `;
    eval(appJsCode);

    // Case A: Quill이 없을 때 textarea 정상 폴백 렌더링 확인
    global.window = { Quill: undefined };
    global.showNewsForm();
    assert.ok(appendedHTML.includes('<textarea'), 'Fallback to textarea when Quill is absent');
    
    // Case B: Quill이 존재할 때 editor-container 생성 확인
    global.window = {
      Quill: class {
        constructor(selector, options) {
          isQuillInitialized = true;
          this.root = { innerHTML: '초기 본문' };
        }
        getText() { return '초기 본문'; }
      }
    };
    global.showNewsForm();
    assert.ok(appendedHTML.includes('id="newsEditorContainer"'), 'Render editor container div when Quill is present');
  } finally {
    global.document = originalDocument;
    global.window = originalWindow;
    delete global.renderAdminNews;
    delete global.showNewsForm;
  }
}

function runCommunityQuillTests() {
  const fs = require('fs');
  const path = require('path');
  const originalDocument = global.document;
  const originalWindow = global.window;
  
  let appendedHTML = '';
  const mockContainer = {
    set innerHTML(val) { appendedHTML = val; },
    get innerHTML() { return appendedHTML; },
    querySelector: (sel) => {
      return { value: '', addEventListener: () => {}, style: {} };
    }
  };
  
  global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
      if (id === 'boardDetailColumn') return mockContainer;
      return { value: '', addEventListener: () => {}, style: {} };
    },
    createElement: () => ({ setAttribute: () => {}, style: {} }),
    querySelectorAll: () => [],
    querySelector: (sel) => {
      return { value: '', addEventListener: () => {}, style: {} };
    }
  };
  
  try {
    const communityJsPath = path.join(__dirname, '../js/community.js');
    const communityJsCode = fs.readFileSync(communityJsPath, 'utf8') + `
      global.renderWriteForm = renderWriteForm;
    `;
    eval(communityJsCode);

    // Case A: Quill 존재 시 자유게시판 에디터 컨테이너 렌더링 검증
    global.window = {
      Quill: class {
        constructor(selector, options) {
          this.root = { innerHTML: '' };
          // 라이트 툴바에 'image'가 없는지 검사
          const toolbar = options.modules.toolbar;
          const hasImage = toolbar.flat().includes('image');
          assert.strictEqual(hasImage, false, 'User board editor toolbar must not contain image upload');
        }
        getText() { return ''; }
      }
    };
    
    global.renderWriteForm();
    assert.ok(appendedHTML.includes('id="boardEditorContainer"'), 'Render user board editor container');
  } finally {
    global.document = originalDocument;
    global.window = originalWindow;
    delete global.renderWriteForm;
  }
}

// Run the test blocks
runTestBlock('Squad Data Schema Tests (runSquadTests)', runSquadTests);
runTestBlock('Match Data Schema Tests (runMatchTests)', runMatchTests);
runTestBlock('Standing Data Schema Tests (runStandingTests)', runStandingTests);
runTestBlock('Specific Integrity Tests (runSpecificIntegrityTests)', runSpecificIntegrityTests);
runTestBlock('Router Syntax Verification (runRouterTests)', runRouterTests);
runTestBlock('Community CRUD Tests (runCommunityTests)', runCommunityTests);
runTestBlock('News Data Schema Tests (runNewsTests)', runNewsTests);
runTestBlock('HTML Escaping Safety Tests (runEscapeHTMLTests)', runEscapeHTMLTests);
runTestBlock('User Data Initialization Tests (runUserDataInitializationTests)', runUserDataInitializationTests);
runTestBlock('Signup Nickname Validation Tests (runSignupNicknameValidationTests)', runSignupNicknameValidationTests);
runTestBlock('Admin Member Management Dashboard Tests (runAdminMembersDashboardTests)', runAdminMembersDashboardTests);
runTestBlock('Squad Form Image Preview and Validation Tests (runSquadFormImageTests)', runSquadFormImageTests);
runTestBlock('Player Image Integration Tests (runPlayerImageIntegrationTests)', runPlayerImageIntegrationTests);
runTestBlock('Main Slider Unit & Integration Tests (runMainSliderTests)', runMainSliderTests);
runTestBlock('Main Slider & Popup Integration Tests (runMainSliderAndPopupTests)', runMainSliderAndPopupTests);
runTestBlock('Sanitize HTML Safety Tests (runSanitizeHTMLTests)', runSanitizeHTMLTests);
runTestBlock('News Sorting Tests (runNewsSortingTests)', runNewsSortingTests);
runTestBlock('Admin News Quill Tests (runAdminNewsQuillTests)', runAdminNewsQuillTests);
runTestBlock('Community Quill Tests (runCommunityQuillTests)', runCommunityQuillTests);


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
