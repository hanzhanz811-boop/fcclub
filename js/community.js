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

  createPost(title, author, content, password) {
    const posts = this.loadPosts();
    const now = new Date();
    
    // Ensure password is not empty to prevent delete bypassing
    const postPassword = password ? String(password) : '';
    
    const newPost = {
      id: this._generateId(),
      title: title || '제목 없음',
      author: author || '익명',
      content: content || '',
      password: postPassword,
      likes: 0,
      createdAt: this._formatDate(now),
      comments: []
    };
    posts.unshift(newPost); // 최신글이 위로 오도록 함
    this.savePosts(posts);
    return newPost;
  }

  deletePost(postId, inputPassword) {
    if (!inputPassword) return false; // Reject empty/falsy passwords
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
    const commentPassword = password ? String(password) : '';
    
    const newComment = {
      id: this._generateId(),
      author: author || '익명댓글러',
      content: content || '',
      password: commentPassword,
      createdAt: this._formatDate(now)
    };
    
    posts[index].comments = posts[index].comments || [];
    posts[index].comments.push(newComment);
    this.savePosts(posts);
    return newComment;
  }

  deleteComment(postId, commentId, inputPassword) {
    if (!inputPassword) return false; // Reject empty/falsy passwords
    const posts = this.loadPosts();
    const postIndex = posts.findIndex(p => p.id === Number(postId));
    if (postIndex === -1) return false;
    
    const comments = posts[postIndex].comments || [];
    const commentIndex = comments.findIndex(c => c.id === Number(commentId));
    if (commentIndex === -1) return false;
    
    if (comments[commentIndex].password !== inputPassword) return false;
    
    comments.splice(commentIndex, 1);
    this.savePosts(posts);
    return true;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CommunityManager };
}
