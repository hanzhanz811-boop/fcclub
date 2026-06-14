# 팬존(Fan Zone) 커뮤니티 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로컬 스토리지를 이용해 팬존 2단 분할 레이아웃 기반 게시판 CRUD, 추천 및 댓글 기능을 완벽히 구현하고 무결성 테스트를 완료한다.

**Architecture:** `CommunityManager` 객체를 생성하여 비즈니스 로직과 데이터 입출력(localStorage)을 위임하고, 브라우저 환경에서는 DOM 생성 및 이벤트 관리를 위한 UI 스크립트를 독립적으로 구성한다.

**Tech Stack:** Vanilla JS, Vanilla CSS, Vanilla HTML, Node.js (테스트용)

---

### Task 1: Fan Zone HTML 레이아웃 구축 및 CSS 스타일링

**Files:**
- Modify: `index.html`
- Modify: `css/components.css`

- [ ] **Step 1: HTML에 팬존 마크업 반영 및 community.js 스크립트 로드**
  `index.html` 파일의 `#fanzone` 섹션을 2단 분할 레이아웃으로 변경하고, 주석 처리된 `js/community.js` 스크립트를 활성화합니다.
  ```html
  <!-- index.html 수정 사항 -->
  <!-- <section id="fanzone" class="tab-section"> 수정 -->
  <section id="fanzone" class="tab-section">
    <div class="container fanzone-container">
      <div class="section-header">
        <h2>FAN ZONE</h2>
      </div>
      <div class="fanzone-layout">
        <!-- 왼쪽 영역: 게시글 리스트 -->
        <div class="board-list-column">
          <div class="board-list-header">
            <span class="board-count">전체 글 <strong id="postCount">0</strong>개</span>
            <button id="btnOpenWrite" class="btn btn-gold">글쓰기</button>
          </div>
          <div id="boardList" class="board-list-items">
            <!-- JS 동적 렌더링 -->
          </div>
        </div>
        <!-- 오른쪽 영역: 동적 상세 및 글쓰기 폼 -->
        <div id="boardDetailColumn" class="board-detail-column">
          <div class="board-placeholder">
            <div class="placeholder-icon">💬</div>
            <p>게시글을 선택하거나 새 글을 작성해 보세요.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- 스크립트 주석 해제 -->
  <script src="js/community.js"></script>
  ```

- [ ] **Step 2: CSS 스타일 정의**
  `css/components.css` 파일 하단에 fanzone 2단 분할 레이아웃과 게시판 전용 스타일(글쓰기 폼, 댓글 목록, 추천 버튼 등)을 추가합니다.
  ```css
  /* css/components.css 추가 내용 */
  .fanzone-container {
    padding-bottom: 60px;
  }
  .fanzone-layout {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 30px;
    align-items: start;
  }
  @media (max-width: 768px) {
    .fanzone-layout {
      grid-template-columns: 1fr;
    }
  }
  .board-list-column {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-glass-border);
    border-radius: 12px;
    padding: 20px;
  }
  .board-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .board-count {
    font-size: 14px;
    color: var(--color-text-muted);
  }
  .board-count strong {
    color: var(--color-gold-solid);
  }
  .board-list-items {
    max-height: 600px;
    overflow-y: auto;
  }
  .board-item-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .board-item-card:hover, .board-item-card.active {
    border-color: var(--color-gold-solid);
    background: rgba(212, 175, 55, 0.05);
    transform: translateY(-2px);
  }
  .board-item-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .board-item-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--color-text-muted);
  }
  .board-detail-column {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-glass-border);
    border-radius: 12px;
    padding: 25px;
    min-height: 400px;
  }
  .board-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 350px;
    color: var(--color-text-muted);
    text-align: center;
  }
  .placeholder-icon {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
  }
  /* Form & Detail Styles */
  .fanzone-form-group {
    margin-bottom: 15px;
  }
  .fanzone-form-group label {
    display: block;
    font-size: 13px;
    color: var(--color-gold-solid);
    margin-bottom: 5px;
  }
  .fanzone-input, .fanzone-textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-glass-border);
    color: #fff;
    padding: 10px;
    border-radius: 6px;
    font-family: inherit;
    box-sizing: border-box;
  }
  .fanzone-input:focus, .fanzone-textarea:focus {
    outline: none;
    border-color: var(--color-gold-solid);
  }
  .fanzone-textarea {
    resize: none;
    height: 180px;
  }
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .post-detail-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  .post-detail-title {
    font-family: var(--font-header);
    font-size: 22px;
    color: var(--color-gold-solid);
    margin-bottom: 10px;
  }
  .post-detail-meta {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--color-text-muted);
  }
  .post-detail-content {
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 30px;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .post-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  .comments-section {
    margin-top: 25px;
  }
  .comments-section h4 {
    color: var(--color-gold-solid);
    margin-bottom: 15px;
    font-size: 16px;
  }
  .comment-item {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 10px;
  }
  .comment-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--color-text-muted);
    margin-bottom: 5px;
  }
  .comment-text {
    font-size: 13px;
    color: #ddd;
    word-break: break-all;
  }
  .comment-delete-btn {
    background: none;
    border: none;
    color: #ff4d4d;
    cursor: pointer;
    font-size: 11px;
  }
  .comment-form {
    margin-top: 15px;
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 10px;
    align-items: start;
  }
  .comment-form textarea {
    grid-column: span 2;
    height: 60px;
  }
  ```

- [ ] **Step 3: 변경사항 확인 및 커밋**
  ```bash
  git add index.html css/components.css
  git commit -m "feat: add HTML layout and CSS styling for Fan Zone board"
  ```

---

### Task 2: 커뮤니티 데이터 테스트 코드 및 가상 로컬 스토리지 구현 (TDD 준비)

**Files:**
- Create: `js/community.js`
- Modify: `tests/run_tests.js`

- [ ] **Step 1: js/community.js 파일 껍데기 생성**
  Node.js 모듈 바인딩 테스트를 위해 비어있는 클래스를 먼저 정의합니다.
  ```javascript
  // js/community.js
  class CommunityManager {
    constructor() {}
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CommunityManager };
  }
  ```

- [ ] **Step 2: tests/run_tests.js에 로컬 스토리지 모킹 및 유닛 테스트 추가**
  가상 `localStorage`를 만들고, `CommunityManager` 기능을 점검하는 유닛 테스트들을 정의합니다.
  ```javascript
  // tests/run_tests.js 수정사항
  // 맨 상단 혹은 적절한 위치에 추가
  if (typeof global.localStorage === 'undefined') {
    global.localStorage = {
      store: {},
      getItem(key) { return this.store[key] || null; },
      setItem(key, value) { this.store[key] = String(value); },
      removeItem(key) { delete this.store[key]; },
      clear() { this.store = {}; }
    };
  }

  const { CommunityManager } = require('../js/community.js');

  function runCommunityTests() {
    localStorage.clear();
    const manager = new CommunityManager();
    
    // 1. 초기 로드 및 기본글 탑재 테스트
    const initialPosts = manager.loadPosts();
    assert.ok(Array.isArray(initialPosts), 'loadPosts should return an array');
    assert.ok(initialPosts.length > 0, 'Should load default posts if store is empty');
    
    // 2. 글 작성 테스트
    const newPost = manager.createPost('테스트 제목', '작성자A', '본문 내용', 'pw123');
    assert.strictEqual(newPost.title, '테스트 제목');
    assert.strictEqual(newPost.author, '작성자A');
    assert.strictEqual(newPost.likes, 0);
    assert.ok(Array.isArray(newPost.comments));
    
    const posts = manager.loadPosts();
    const found = posts.find(p => p.id === newPost.id);
    assert.ok(found, 'Created post must exist in loaded posts');
    
    // 3. 추천수 증가 테스트
    const likesBefore = found.likes;
    manager.likePost(newPost.id);
    const updatedPosts = manager.loadPosts();
    const updatedFound = updatedPosts.find(p => p.id === newPost.id);
    assert.strictEqual(updatedFound.likes, likesBefore + 1, 'Likes count should increase by 1');
    
    // 4. 댓글 작성 테스트
    const comment = manager.addComment(newPost.id, '댓글러', '댓글내용', 'cpw123');
    assert.strictEqual(comment.author, '댓글러');
    assert.strictEqual(comment.content, '댓글내용');
    
    const postsWithComment = manager.loadPosts();
    const postWithComment = postsWithComment.find(p => p.id === newPost.id);
    assert.strictEqual(postWithComment.comments.length, 1, 'Should have exactly 1 comment');
    assert.strictEqual(postWithComment.comments[0].id, comment.id);
    
    // 5. 잘못된 비밀번호로 댓글 삭제 거부 테스트
    const isDeletedCommentFail = manager.deleteComment(newPost.id, comment.id, 'wrong_pw');
    assert.strictEqual(isDeletedCommentFail, false, 'Should fail to delete comment with wrong password');
    
    // 6. 올바른 비밀번호로 댓글 삭제 테스트
    const isDeletedCommentSuccess = manager.deleteComment(newPost.id, comment.id, 'cpw123');
    assert.strictEqual(isDeletedCommentSuccess, true, 'Should succeed to delete comment with correct password');
    
    const postsAfterCommentDelete = manager.loadPosts();
    const postAfterCommentDelete = postsAfterCommentDelete.find(p => p.id === newPost.id);
    assert.strictEqual(postAfterCommentDelete.comments.length, 0, 'Comment list should be empty after deletion');
    
    // 7. 잘못된 비밀번호로 게시글 삭제 거부 테스트
    const isDeletedFail = manager.deletePost(newPost.id, 'wrong_password');
    assert.strictEqual(isDeletedFail, false, 'Should fail to delete post with wrong password');
    
    // 8. 올바른 비밀번호로 게시글 삭제 테스트
    const isDeletedSuccess = manager.deletePost(newPost.id, 'pw123');
    assert.strictEqual(isDeletedSuccess, true, 'Should succeed to delete post with correct password');
    
    const finalPosts = manager.loadPosts();
    const finalFound = finalPosts.find(p => p.id === newPost.id);
    assert.strictEqual(finalFound, undefined, 'Post must be removed after deletion');
  }

  // 테스트 러너 하단 실행 부에 등록
  // runTestBlock('Community CRUD Tests (runCommunityTests)', runCommunityTests);
  ```
  *참고: `run_tests.js`의 테스트 블록 실행 지점에 `runTestBlock('Community CRUD Tests (runCommunityTests)', runCommunityTests);`를 추가해 줍니다.*

- [ ] **Step 3: 테스트를 실행하여 실패하는지 확인**
  Run: `node tests/run_tests.js`
  Expected: FAIL (CommunityManager does not have loadPosts or createPost method)

- [ ] **Step 4: 변경사항 커밋**
  ```bash
  git add js/community.js tests/run_tests.js
  git commit -m "test: add failing community manager unit tests"
  ```

---

### Task 3: 커뮤니티 데이터 매니저 비즈니스 로직 완성 (TDD 구현)

**Files:**
- Modify: `js/community.js`

- [ ] **Step 1: CommunityManager 비즈니스 로직 작성**
  `js/community.js` 내에 데이터 스토리지 입출력 및 CRUD 메소드를 완벽히 정의합니다.
  ```javascript
  // js/community.js 수정사항
  class CommunityManager {
    constructor() {
      this.storageKey = 'sungman_fc_posts';
    }

    loadPosts() {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        // 기본 웰컴 게시글 적재
        const defaultPosts = [
          {
            id: 1718246400000,
            title: "성만 FC 홈페이지 오픈을 축하합니다! 🎉",
            author: "운영자",
            content: "성만 FC의 가상 공식 홈페이지에 오신 서포터즈 여러분 환영합니다.\n선수단 리스트 필터링 기능과 매치 센터 순위표를 확인해 보세요!\n게시글과 댓글은 로컬스토리지에 안전하게 보관됩니다.",
            password: "admin",
            likes: 12,
            createdAt: "2026-06-13 12:00",
            comments: [
              {
                id: 1718246450000,
                author: "김성민팬",
                content: "오픈 정말 축하드립니다!! 성만 FC 화이팅!",
                password: "123",
                createdAt: "2026-06-13 12:05"
              }
            ]
          }
        ];
        localStorage.setItem(this.storageKey, JSON.stringify(defaultPosts));
        return defaultPosts;
      }
      return JSON.parse(data);
    }

    savePosts(posts) {
      localStorage.setItem(this.storageKey, JSON.stringify(posts));
    }

    createPost(title, author, content, password) {
      const posts = this.loadPosts();
      const now = new Date();
      const newPost = {
        id: Date.now(),
        title: title || '제목 없음',
        author: author || '익명',
        content: content || '',
        password: password,
        likes: 0,
        createdAt: now.toISOString().slice(0, 16).replace('T', ' '),
        comments: []
      };
      posts.unshift(newPost); // 최신글이 위로 오도록 함
      this.savePosts(posts);
      return newPost;
    }

    deletePost(postId, inputPassword) {
      const posts = this.loadPosts();
      const index = posts.findIndex(p => p.id === Number(postId));
      if (index === -1) return false;
      if (posts[index].password !== inputPassword) return false;
      posts.splice(index, 1);
      this.savePosts(posts);
      return true;
    }

    likePost(postId) {
      const posts = this.loadPosts();
      const index = posts.findIndex(p => p.id === Number(postId));
      if (index === -1) return false;
      posts[index].likes += 1;
      this.savePosts(posts);
      return true;
    }

    addComment(postId, author, content, password) {
      const posts = this.loadPosts();
      const index = posts.findIndex(p => p.id === Number(postId));
      if (index === -1) return null;
      
      const now = new Date();
      const newComment = {
        id: Date.now(),
        author: author || '익명댓글러',
        content: content || '',
        password: password,
        createdAt: now.toISOString().slice(0, 16).replace('T', ' ')
      };
      
      posts[index].comments.push(newComment);
      this.savePosts(posts);
      return newComment;
    }

    deleteComment(postId, commentId, inputPassword) {
      const posts = this.loadPosts();
      const postIndex = posts.findIndex(p => p.id === Number(postId));
      if (postIndex === -1) return false;
      
      const commentIndex = posts[postIndex].comments.findIndex(c => c.id === Number(commentId));
      if (commentIndex === -1) return false;
      
      if (posts[postIndex].comments[commentIndex].password !== inputPassword) return false;
      
      posts[postIndex].comments.splice(commentIndex, 1);
      this.savePosts(posts);
      return true;
    }
  }
  ```

- [ ] **Step 2: 테스트를 실행하여 통과하는지 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 3: 변경사항 커밋**
  ```bash
  git add js/community.js
  git commit -m "feat: implement CommunityManager business logic and pass tests"
  ```

---

### Task 4: UI 바인딩 및 이벤트 연결 (Fan Zone UI 기능 완성)

**Files:**
- Modify: `js/community.js`
- Modify: `js/app.js`

- [ ] **Step 1: UI 렌더러 로직 구현**
  `js/community.js`에 DOM 바인딩 및 클릭 이벤트 함수들을 연결하고, 초기화 모듈을 추가합니다.
  ```javascript
  // js/community.js 하단에 UI 바인딩 추가
  let activePostId = null;
  const manager = new CommunityManager();

  function initCommunity() {
    const btnOpenWrite = document.getElementById('btnOpenWrite');
    if (btnOpenWrite) {
      btnOpenWrite.addEventListener('click', renderWriteForm);
    }
    renderPostList();
  }

  function renderPostList() {
    const listContainer = document.getElementById('boardList');
    const postCountElement = document.getElementById('postCount');
    if (!listContainer) return;

    const posts = manager.loadPosts();
    if (postCountElement) postCountElement.textContent = posts.length;

    listContainer.innerHTML = '';
    if (posts.length === 0) {
      listContainer.innerHTML = '<div style="padding:20px; text-align:center; color:gray;">등록된 게시글이 없습니다.</div>';
      return;
    }

    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = `board-item-card ${activePostId === post.id ? 'active' : ''}`;
      card.innerHTML = `
        <div class="board-item-title">${post.title}</div>
        <div class="board-item-meta">
          <span>✍ ${post.author}</span>
          <span>📅 ${post.createdAt.slice(2, 10)} | 👍 ${post.likes} | 💬 ${post.comments.length}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        activePostId = post.id;
        renderPostList(); // 활성 상태 표시 업데이트
        renderPostDetail(post.id);
      });
      listContainer.appendChild(card);
    });
  }

  function renderWriteForm() {
    const detailColumn = document.getElementById('boardDetailColumn');
    if (!detailColumn) return;

    detailColumn.innerHTML = `
      <h3 style="color:var(--color-gold-solid); margin-bottom:20px; font-family:var(--font-header);">새 글 작성</h3>
      <form id="writePostForm">
        <div class="fanzone-form-group">
          <label for="postAuthor">작성자</label>
          <input type="text" id="postAuthor" class="fanzone-input" placeholder="이름을 입력하세요" required maxLength="10">
        </div>
        <div class="fanzone-form-group">
          <label for="postPassword">비밀번호 (삭제 시 필요)</label>
          <input type="password" id="postPassword" class="fanzone-input" placeholder="비밀번호를 입력하세요" required maxLength="15">
        </div>
        <div class="fanzone-form-group">
          <label for="postTitle">제목</label>
          <input type="text" id="postTitle" class="fanzone-input" placeholder="제목을 입력하세요 (최대 30자)" required maxLength="30">
        </div>
        <div class="fanzone-form-group">
          <label for="postContent">내용</label>
          <textarea id="postContent" class="fanzone-textarea" placeholder="내용을 입력하세요" required></textarea>
        </div>
        <div class="form-actions">
          <button type="button" id="btnCancelWrite" class="btn" style="background:#444; color:#fff;">취소</button>
          <button type="submit" class="btn btn-gold">등록</button>
        </div>
      </form>
    `;

    document.getElementById('btnCancelWrite').addEventListener('click', resetDetailPlaceholder);
    
    document.getElementById('writePostForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const author = document.getElementById('postAuthor').value;
      const pass = document.getElementById('postPassword').value;
      const title = document.getElementById('postTitle').value;
      const content = document.getElementById('postContent').value;

      const newPost = manager.createPost(title, author, content, pass);
      activePostId = newPost.id;
      renderPostList();
      renderPostDetail(newPost.id);
    });
  }

  function renderPostDetail(postId) {
    const detailColumn = document.getElementById('boardDetailColumn');
    if (!detailColumn) return;

    const posts = manager.loadPosts();
    const post = posts.find(p => p.id === Number(postId));
    if (!post) {
      resetDetailPlaceholder();
      return;
    }

    detailColumn.innerHTML = `
      <div class="post-detail-header">
        <h3 class="post-detail-title">${post.title}</h3>
        <div class="post-detail-meta">
          <span>작성자: <strong>${post.author}</strong></span>
          <span>📅 ${post.createdAt}</span>
        </div>
      </div>
      <div class="post-detail-content">${post.content}</div>
      
      <div class="post-actions">
        <button id="btnLikePost" class="btn btn-gold" style="padding: 6px 15px; font-size: 13px;">👍 추천 <span id="likeCount">${post.likes}</span></button>
        <button id="btnDeletePost" class="btn" style="background:#ff4d4d; color:#fff; padding: 6px 15px; font-size: 13px;">삭제</button>
      </div>

      <div class="comments-section">
        <h4>댓글 (<span id="commentCount">${post.comments.length}</span>)</h4>
        <div id="commentList">
          <!-- 댓글 목록 동적 주입 -->
        </div>
        
        <form id="commentForm" class="comment-form">
          <input type="text" id="commentAuthor" class="fanzone-input" placeholder="작성자" required maxLength="10">
          <input type="password" id="commentPassword" class="fanzone-input" placeholder="비밀번호" required maxLength="15">
          <textarea id="commentText" class="fanzone-textarea" placeholder="댓글을 남겨보세요" required></textarea>
          <button type="submit" class="btn btn-gold" style="grid-column: span 3; margin-top:5px; padding: 8px 0; width:100%;">댓글 등록</button>
        </form>
      </div>
    `;

    // 추천 버튼 리스너
    document.getElementById('btnLikePost').addEventListener('click', () => {
      manager.likePost(postId);
      const updatedPost = manager.loadPosts().find(p => p.id === Number(postId));
      document.getElementById('likeCount').textContent = updatedPost.likes;
      renderPostList();
    });

    // 삭제 버튼 리스너
    document.getElementById('btnDeletePost').addEventListener('click', () => {
      const pass = prompt('삭제용 비밀번호를 입력해 주세요:');
      if (pass === null) return;
      
      const success = manager.deletePost(postId, pass);
      if (success) {
        activePostId = null;
        alert('게시글이 삭제되었습니다.');
        renderPostList();
        resetDetailPlaceholder();
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    });

    // 댓글 목록 렌더링
    renderComments(post.comments, postId);

    // 댓글 등록 리스너
    document.getElementById('commentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const author = document.getElementById('commentAuthor').value;
      const pass = document.getElementById('commentPassword').value;
      const text = document.getElementById('commentText').value;

      manager.addComment(postId, author, text, pass);
      renderPostDetail(postId);
      renderPostList();
    });
  }

  function renderComments(comments, postId) {
    const list = document.getElementById('commentList');
    if (!list) return;

    list.innerHTML = '';
    if (comments.length === 0) {
      list.innerHTML = '<div style="padding:10px 0; color:gray; font-size:12px;">등록된 댓글이 없습니다.</div>';
      return;
    }

    comments.forEach(comment => {
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `
        <div class="comment-meta">
          <span>💬 <strong>${comment.author}</strong> (${comment.createdAt})</span>
          <button class="comment-delete-btn" data-id="${comment.id}">삭제</button>
        </div>
        <div class="comment-text">${comment.content}</div>
      `;
      
      item.querySelector('.comment-delete-btn').addEventListener('click', () => {
        const pass = prompt('댓글 삭제 비밀번호를 입력해 주세요:');
        if (pass === null) return;
        
        const success = manager.deleteComment(postId, comment.id, pass);
        if (success) {
          alert('댓글이 삭제되었습니다.');
          renderPostDetail(postId);
          renderPostList();
        } else {
          alert('비밀번호가 일치하지 않습니다.');
        }
      });
      list.appendChild(item);
    });
  }

  function resetDetailPlaceholder() {
    const detailColumn = document.getElementById('boardDetailColumn');
    if (!detailColumn) return;

    detailColumn.innerHTML = `
      <div class="board-placeholder">
        <div class="placeholder-icon">💬</div>
        <p>게시글을 선택하거나 새 글을 작성해 보세요.</p>
      </div>
    `;
  }

  // 브라우저 로딩 시 전역 바인딩을 위한 내보내기
  if (typeof window !== 'undefined') {
    window.initCommunity = initCommunity;
  }
  ```

- [ ] **Step 2: js/app.js에서 커뮤니티 초기화 호출**
  `js/app.js`의 DOMContentLoaded 시점에 `initCommunity()`를 호출하도록 설정합니다.
  ```javascript
  // js/app.js 수정
  document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    bindNextMatchWidget();
    initSquadFeatures();
    bindMatchCenter();
    if (typeof initCommunity === 'function') {
      initCommunity();
    }
  });
  ```

- [ ] **Step 3: 테스트를 돌려 Node.js 상의 코드가 무너지지 않았는지 확인**
  Run: `node tests/run_tests.js`
  Expected: PASS

- [ ] **Step 4: 변경사항 커밋**
  ```bash
  git add js/community.js js/app.js
  git commit -m "feat: complete community board dynamic UI binding and events"
  ```
