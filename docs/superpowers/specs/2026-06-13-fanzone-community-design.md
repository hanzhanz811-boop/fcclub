# 2026-06-13 팬존(Fan Zone) 커뮤니티 구현 디자인 스펙

## 1. 개요
성만 FC Single Page Application(SPA) 웹사이트의 핵심 사용자 참여 공간인 **팬존(Fan Zone)** 커뮤니티 게시판을 구현합니다. 본 기능은 서버사이드 데이터베이스 없이 브라우저의 `localStorage`를 사용하여 게시글의 생성(Create), 조회(Read), 삭제(Delete) 및 추천(Like), 댓글(Comment) CRUD 작업을 완벽하게 지원합니다.

## 2. 레이아웃 및 UI/UX 디자인
*   **2단 분할 레이아웃 (Desktop)**:
    *   **왼쪽 영역 (45% 너비)**: 전체 게시글 목록 및 '글쓰기' 버튼이 위치합니다.
    *   **오른쪽 영역 (55% 너비)**: 초기에는 안내 문구가 위치하며, 특정 게시글 선택 시 상세 본문/댓글 영역이 되거나, '글쓰기' 버튼 클릭 시 작성 폼으로 동적 전환됩니다.
*   **모바일 반응형 (768px 미만)**:
    *   1단 세로 스택 구조로 변경되며, 목록과 상세/작성 폼 영역이 자연스럽게 위아래 또는 상태에 맞춰 적절하게 표시됩니다.
*   **스타일 톤앤매너**:
    *   전체적인 테마인 **Dark & Gold**와 글래스모피즘(Glassmorphism) 효과를 이어받아 일체감 있는 보드 카드를 렌더링합니다.

## 3. 데이터 구조 (LocalStorage Schema)
*   **Key**: `sungman_fc_posts`
*   **Schema**:
```json
[
  {
    "id": 1718246400000,
    "title": "성만 FC 우승 갑시다!",
    "author": "성만팬",
    "content": "올해 공격진 보강이 아주 잘 된 것 같습니다. 김성민 선수 활약이 기대되네요.",
    "password": "plain_password_or_hash",
    "likes": 5,
    "createdAt": "2026-06-13 12:40",
    "comments": [
      {
        "id": 1718246420000,
        "author": "서포터즈",
        "content": "동감합니다! 홈경기 무조건 응원갑니다.",
        "password": "comment_password",
        "createdAt": "2026-06-13 12:42"
      }
    ]
  }
]
```

## 4. 핵심 로직 & 기능 설계 (`js/community.js`)
*   **`CommunityManager` 클래스 또는 객체**:
    *   `loadPosts()`: `localStorage`에서 데이터를 로드. 없을 시 기본 웰컴 게시글 적재.
    *   `savePosts()`: 데이터를 로컬스토리지에 동기화.
    *   `createPost(title, author, content, password)`: 신규 게시글 추가.
    *   `deletePost(postId, inputPassword)`: 비밀번호 검증 후 게시글 제거.
    *   `likePost(postId)`: 추천 수 1 증가.
    *   `addComment(postId, author, content, password)`: 특정 게시글에 댓글 등록.
    *   `deleteComment(postId, commentId, inputPassword)`: 댓글 삭제.
*   **UI 렌더러**:
    *   `renderPostList()`: 게시판 리스트 생성.
    *   `renderWriteForm()`: 글쓰기 폼 생성.
    *   `renderPostDetail(postId)`: 상세 내용 및 댓글 창 렌더링.

## 5. 테스트 및 무결성 검증
*   `tests/run_tests.js` 내에 가상의 `localStorage` Mocking을 구현하여 Node.js 환경에서 CommunityManager 로직(글 작성, 비밀번호 기반 글/댓글 삭제, 추천 수 증가)의 무결성 검증 유닛 테스트 코드를 동작시킵니다.
