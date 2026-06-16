class CommunityManager {
  constructor() {
    this.storageKey = 'sungman_fc_posts';
  }

  // DRY helper for formatting local dates to YYYY-MM-DD HH:MM
  _formatDate(date) {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  // Generates unique IDs with a random suffix to prevent Date.now() collisions
  _generateId() {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
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
      this.savePosts(defaultPosts);
      return defaultPosts;
    }
    
    try {
      return JSON.parse(data) || [];
    } catch (e) {
      console.error('Failed to parse community posts from localStorage. Fallback to empty array.', e);
      return [];
    }
  }

  savePosts(posts) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to save posts to localStorage:', e);
    }
  }

  createPost(title, content, user) {
    const posts = this.loadPosts();
    const now = new Date();
    
    const newPost = {
      id: this._generateId(),
      title: title || '제목 없음',
      content: content || '',
      author: user ? (user.nickname || '익명') : '익명',
      authorEmail: user ? (user.email || '') : '',
      likes: 0,
      createdAt: this._formatDate(now),
      comments: []
    };
    posts.unshift(newPost); // 최신글이 위로 오도록 함
    this.savePosts(posts);
    return newPost;
  }

  deletePost(postId, user) {
    if (!user) return false;
    const posts = this.loadPosts();
    const index = posts.findIndex(p => p.id === Number(postId));
    if (index === -1) return false;
    
    const post = posts[index];
    if (!post.authorEmail) {
      if (user.role === 'admin' || user.password === '1234') {
        posts.splice(index, 1);
        this.savePosts(posts);
        return true;
      }
      return false;
    }
    
    if (user.role === 'admin' || user.email === post.authorEmail) {
      posts.splice(index, 1);
      this.savePosts(posts);
      return true;
    }
    return false;
  }

  likePost(postId) {
    const posts = this.loadPosts();
    const index = posts.findIndex(p => p.id === Number(postId));
    if (index === -1) return false;
    posts[index].likes += 1;
    this.savePosts(posts);
    return true;
  }

  addComment(postId, content, user) {
    const posts = this.loadPosts();
    const index = posts.findIndex(p => p.id === Number(postId));
    if (index === -1) return null;
    
    const now = new Date();
    
    const newComment = {
      id: this._generateId(),
      author: user ? (user.nickname || '익명댓글러') : '익명댓글러',
      authorEmail: user ? (user.email || '') : '',
      content: content || '',
      createdAt: this._formatDate(now)
    };
    
    posts[index].comments = posts[index].comments || [];
    posts[index].comments.push(newComment);
    this.savePosts(posts);
    return newComment;
  }

  deleteComment(postId, commentId, user) {
    if (!user) return false;
    const posts = this.loadPosts();
    const postIndex = posts.findIndex(p => p.id === Number(postId));
    if (postIndex === -1) return false;
    
    const comments = posts[postIndex].comments || [];
    const commentIndex = comments.findIndex(c => c.id === Number(commentId));
    if (commentIndex === -1) return false;
    
    const comment = comments[commentIndex];
    if (!comment.authorEmail) {
      if (user.role === 'admin' || user.password === '1234') {
        comments.splice(commentIndex, 1);
        this.savePosts(posts);
        return true;
      }
      return false;
    }
    
    if (user.role === 'admin' || user.email === comment.authorEmail) {
      comments.splice(commentIndex, 1);
      this.savePosts(posts);
      return true;
    }
    return false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CommunityManager, escapeHTML, sanitizeHTML };
}

const globalScope = typeof window !== 'undefined' ? window : global;
globalScope.sanitizeHTML = sanitizeHTML;

// HTML Escaping Utility for XSS Prevention
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function sanitizeHTML(html) {
  if (!html) return '';
  
  let doc;
  try {
    if (typeof window === 'undefined' || !window.DOMParser) {
      if (typeof global.DOMParser !== 'undefined') {
        const parser = new global.DOMParser();
        doc = parser.parseFromString(html, 'text/html');
      }
    } else {
      const parser = new window.DOMParser();
      doc = parser.parseFromString(html, 'text/html');
    }
  } catch (e) {
    console.error('DOMParser failed, falling back to regex sanitization:', e);
  }
  
  if (!doc || !doc.body) {
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  const body = doc.body;

  // 1. Remove bad tags
  const badTags = body.querySelectorAll('script, object, embed, link, meta, style');
  badTags.forEach(t => t.remove());

  // 2. Allow only youtube embed iframe
  const iframes = body.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    const src = iframe.getAttribute('src') || '';
    if (!src.startsWith('https://www.youtube.com/embed/') && !src.startsWith('https://www.youtube-nocookie.com/embed/')) {
      iframe.remove();
    }
  });

  // 3. Attribute inspection (on-* events and javascript: protocol)
  const allElements = body.querySelectorAll('*');
  allElements.forEach(el => {
    for (let i = el.attributes.length - 1; i >= 0; i--) {
      const attr = el.attributes[i];
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name);
      }
      if (attr.name.toLowerCase() === 'href' || attr.name.toLowerCase() === 'src') {
        const val = attr.value.trim().toLowerCase();
        if (val.startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }
      }
    }
  });

  return body.innerHTML;
}

// UI 바인딩 및 이벤트 연결 (Fan Zone UI 기능 완성)
let activePostId = null;
const manager = new CommunityManager();

function initCommunity() {
  const btnOpenWrite = document.getElementById('btnOpenWrite');
  if (btnOpenWrite) {
    btnOpenWrite.addEventListener('click', () => {
      const loggedInUser = (typeof currentUser !== 'undefined') ? currentUser : null;
      if (loggedInUser === null) {
        alert('로그인이 필요한 서비스입니다.');
        if (typeof window !== 'undefined') {
          window.location.hash = 'login';
        }
        return;
      }
      renderWriteForm();
    });
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
    listContainer.innerHTML = '<div class="board-empty">등록된 게시글이 없습니다.</div>';
    return;
  }

  posts.forEach(post => {
    const card = document.createElement('div');
    card.className = `board-item-card ${activePostId === post.id ? 'active' : ''}`;
    card.innerHTML = `
      <div class="board-item-title">${escapeHTML(post.title)}</div>
      <div class="board-item-meta">
        <span>✍ ${escapeHTML(post.author)}</span>
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

function scrollDetailIntoViewOnMobile() {
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    const detailColumn = document.getElementById('boardDetailColumn');
    if (detailColumn && typeof detailColumn.scrollIntoView === 'function') {
      detailColumn.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function renderWriteForm() {
  const detailColumn = document.getElementById('boardDetailColumn');
  if (!detailColumn) return;

  const loggedInUser = (typeof currentUser !== 'undefined') ? currentUser : null;
  const hasQuill = typeof window !== 'undefined' && typeof window.Quill !== 'undefined';

  detailColumn.innerHTML = `
    <h3 class="post-detail-title-h3">새 글 작성</h3>
    <form id="writePostForm">
      <div class="fanzone-form-group">
        <label>작성자</label>
        <input type="text" class="fanzone-input" value="${escapeHTML(loggedInUser ? loggedInUser.nickname : '')} (${escapeHTML(loggedInUser ? loggedInUser.email : '')})" disabled style="background: rgba(255,255,255,0.05); color: var(--color-text-muted);">
      </div>
      <div class="fanzone-form-group">
        <label for="postTitle">제목</label>
        <input type="text" id="postTitle" class="fanzone-input" placeholder="제목을 입력하세요 (최대 30자)" required maxLength="30">
      </div>
      <div class="fanzone-form-group">
        <label for="postContent">내용</label>
        ${hasQuill ? `
          <div id="boardEditorContainer" style="height: 250px; background: rgba(0,0,0,0.2); border: 1px solid var(--color-glass-border); border-radius: 6px; color: #fff;"></div>
          <input type="hidden" id="postContent" value="">
        ` : `
          <textarea id="postContent" class="fanzone-textarea" placeholder="내용을 입력하세요" required style="height: 200px;"></textarea>
        `}
      </div>
      <div class="form-actions">
        <button type="button" id="btnCancelWrite" class="btn btn-secondary">취소</button>
        <button type="submit" class="btn btn-gold">등록</button>
      </div>
    </form>
  `;

  let boardQuill = null;
  if (hasQuill) {
    const editorDiv = detailColumn.querySelector('#boardEditorContainer');
    if (editorDiv) {
      boardQuill = new window.Quill('#boardEditorContainer', {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote'],
            ['link'],
            ['clean']
          ]
        }
      });
    }
  }

  const cancelBtn = detailColumn.querySelector('#btnCancelWrite');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', resetDetailPlaceholder);
  }
  
  const form = detailColumn.querySelector('#writePostForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = detailColumn.querySelector('#postTitle').value.trim();
      
      let content = '';
      if (boardQuill) {
        const textVal = boardQuill.getText().trim();
        const htmlVal = boardQuill.root.innerHTML;
        if (textVal.length === 0 && !htmlVal.includes('<a')) {
          alert('내용을 입력해 주세요.');
          return;
        }
        content = sanitizeHTML(htmlVal);
      } else {
        const textEl = detailColumn.querySelector('#postContent');
        content = textEl ? textEl.value.trim() : '';
        if (!content) {
          alert('내용을 입력해 주세요.');
          return;
        }
        content = sanitizeHTML(content);
      }

      if (!title || !content) {
        alert('모든 필드를 입력해 주세요.');
        return;
      }

      const currentUserObj = (typeof currentUser !== 'undefined') ? currentUser : null;

      const newPost = manager.createPost(title, content, currentUserObj);
      activePostId = newPost.id;
      renderPostList();
      renderPostDetail(newPost.id);
    });
  }

  // 양식 렌더링 후 호출
  scrollDetailIntoViewOnMobile();
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

  const loggedInUser = (typeof currentUser !== 'undefined') ? currentUser : null;
  const showDeleteBtn = loggedInUser !== null && (loggedInUser.email === post.authorEmail || loggedInUser.role === 'admin');

  detailColumn.innerHTML = `
    <div class="post-detail-header">
      <h3 class="post-detail-title">${escapeHTML(post.title)}</h3>
      <div class="post-detail-meta">
        <span>작성자: <strong>${escapeHTML(post.author)}</strong></span>
        <span>📅 ${post.createdAt}</span>
      </div>
    </div>
    <div class="post-detail-content">${sanitizeHTML(post.content)}</div>
    
    <div class="post-actions">
      <button id="btnLikePost" class="btn btn-gold">👍 추천 <span id="likeCount">${post.likes}</span></button>
      ${showDeleteBtn ? '<button id="btnDeletePost" class="btn btn-danger">삭제</button>' : ''}
    </div>

    <div class="comments-section">
      <h4>댓글 (<span id="commentCount">${post.comments.length}</span>)</h4>
      <div id="commentList">
        <!-- 댓글 목록 동적 주입 -->
      </div>
      
      ${loggedInUser !== null ? `
      <form id="commentForm" class="comment-form">
        <textarea id="commentText" class="fanzone-textarea" placeholder="댓글을 남겨보세요" aria-label="댓글 내용" required></textarea>
        <button type="submit" class="btn btn-gold btn-submit">댓글 등록</button>
      </form>
      ` : `
      <div class="comment-login-msg" style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 6px; color: var(--color-text-muted);">
        댓글은 로그인한 회원만 작성할 수 있습니다.
      </div>
      `}
    </div>
  `;

  // 추천 버튼 리스너
  const likeBtn = detailColumn.querySelector('#btnLikePost');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => {
      manager.likePost(postId);
      const updatedPost = manager.loadPosts().find(p => p.id === Number(postId));
      const likeCountSpan = detailColumn.querySelector('#likeCount');
      if (likeCountSpan) likeCountSpan.textContent = updatedPost.likes;
      renderPostList();
    });
  }

  // 삭제 버튼 리스너
  const deleteBtn = detailColumn.querySelector('#btnDeletePost');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
        const success = manager.deletePost(postId, loggedInUser);
        if (success) {
          activePostId = null;
          alert('게시글이 삭제되었습니다.');
          renderPostList();
          resetDetailPlaceholder();
        } else {
          alert('삭제 권한이 없습니다.');
        }
      }
    });
  }

  // 댓글 목록 렌더링
  renderComments(post.comments, postId);

  // 댓글 등록 리스너
  const commentForm = detailColumn.querySelector('#commentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = detailColumn.querySelector('#commentText').value;

      manager.addComment(postId, text, loggedInUser);
      renderPostDetail(postId);
      renderPostList();
    });
  }

  // 상세 페이지 및 댓글창 렌더링 후 호출
  scrollDetailIntoViewOnMobile();
}

function renderComments(comments, postId) {
  const list = document.getElementById('commentList');
  if (!list) return;

  list.innerHTML = '';
  if (comments.length === 0) {
    list.innerHTML = '<div class="comment-empty">등록된 댓글이 없습니다.</div>';
    return;
  }

  const loggedInUser = (typeof currentUser !== 'undefined') ? currentUser : null;

  comments.forEach(comment => {
    const showCommentDelete = loggedInUser !== null && (loggedInUser.email === comment.authorEmail || loggedInUser.role === 'admin');
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `
      <div class="comment-meta">
        <span>💬 <strong>${escapeHTML(comment.author)}</strong> (${comment.createdAt})</span>
        ${showCommentDelete ? `<button class="comment-delete-btn" data-id="${comment.id}">삭제</button>` : ''}
      </div>
      <div class="comment-text">${escapeHTML(comment.content)}</div>
    `;
    
    const deleteCommentBtn = item.querySelector('.comment-delete-btn');
    if (deleteCommentBtn) {
      deleteCommentBtn.addEventListener('click', () => {
        if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
          const success = manager.deleteComment(postId, comment.id, loggedInUser);
          if (success) {
            alert('댓글이 삭제되었습니다.');
            renderPostDetail(postId);
            renderPostList();
          } else {
            alert('삭제 권한이 없습니다.');
          }
        }
      });
    }
    list.appendChild(item);
  });
}

function resetDetailPlaceholder() {
  const detailColumn = document.getElementById('boardDetailColumn');
  if (!detailColumn) return;

  detailColumn.innerHTML = `
    <div class="board-placeholder">
      <div class="placeholder-icon" aria-hidden="true">💬</div>
      <p>게시글을 선택하거나 새 글을 작성해 보세요.</p>
    </div>
  `;
}

// 브라우저 로딩 시 전역 바인딩을 위한 내보내기
if (typeof window !== 'undefined') {
  window.initCommunity = initCommunity;
  window.renderCommunity = renderPostList; // 라우팅 시 갱신 연동
}
