# PRD: Mini Knowledge Base (나만의 미니 위키)

> **문서 버전** v1.0 · **작성일** 2026-06-04 · **상태** 초안

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | Mini Knowledge Base |
| 부제 | 나만의 미니 위키 |
| 목적 | Notion을 CMS로 활용한 개인 기술 위키 및 FAQ 가이드북 웹사이트 |
| 대상 사용자 | 개인 개발자, 스터디 그룹, 지식 아카이빙이 필요한 소규모 팀 |

### 1.1 CMS 선택 이유

Notion은 문서 구조화와 작성이 편리한 장점이 있어 콘텐츠를 빠르게 축적할 수 있다.
사용자는 트리 구조나 아코디언 UI를 통해 필요한 지식을 빠르게 탐색할 수 있으며,
개발자는 별도의 어드민 패널 없이 Notion 워크스페이스만으로 콘텐츠를 관리할 수 있다.

---

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15, TypeScript |
| CMS | Notion API (`@notionhq/client`) |
| Styling | Tailwind CSS, shadcn/ui |
| Icons | Lucide React |
| 배포 | Vercel |

---

## 3. Notion 데이터베이스 스키마

| 필드명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| `Title` | `title` | 문서 및 질문 제목 | 필수 |
| `Topic` | `select` | 대분류 주제 | Frontend · Backend · CS · Life 등 |
| `Difficulty` | `select` | 난이도 | 상 · 중 · 하 |
| `LastUpdated` | `date` | 최종 수정 및 업데이트일 | |
| `Status` | `select` | 콘텐츠 상태 | **발행됨** 상태만 웹에 노출 |

> **노출 조건:** `Status === "발행됨"` 인 항목만 API 응답에 포함한다.

---

## 4. 주요 기능 요구사항

### 4.1 FAQ 아코디언 (F-01)

- shadcn/ui `Accordion` 컴포넌트를 사용하여 질문 목록을 접고 펼 수 있는 UI 제공
- 기본 상태: 모든 항목 닫힘 (single 또는 multiple expand 모드 선택 가능)
- 아코디언 헤더: 제목 + `Topic` Badge + `Difficulty` Badge 표시
- 아코디언 본문: Notion 마크다운 본문을 렌더링

### 4.2 주제별 필터링 (F-02)

- `Topic` 필드 값 기준으로 문서를 카테고리별로 그룹화하여 표시
- 상단 필터 탭 또는 사이드바 링크로 특정 토픽만 필터링 가능
- "전체" 선택 시 모든 발행 문서 노출

### 4.3 실시간 키워드 검색 (F-03)

- 제목(`Title`) 및 본문 키워드 기반 클라이언트 사이드 필터링
- 검색어 입력 즉시 결과가 갱신되는 실시간(debounce 300ms) 동작
- 검색 결과 없을 경우 빈 상태(Empty State) UI 표시

---

## 5. 화면 구성 및 라우팅

### 5.1 메인 홈 (`/`)

```
┌──────────────────────────────────────┐
│  Mini Knowledge Base                 │
│  나만의 미니 위키                       │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ 🔍  검색어를 입력하세요...      │    │
│  └──────────────────────────────┘    │
│                                      │
│  주요 토픽                             │
│  ┌──────┐ ┌──────┐ ┌──────┐          │
│  │Front │ │Back  │ │  CS  │  ...     │
│  │end   │ │end   │ │      │          │
│  └──────┘ └──────┘ └──────┘          │
└──────────────────────────────────────┘
```

**구성 요소:**
- 대형 검색바 (메인 CTA)
- 주요 토픽 바로가기 그리드 카드 (shadcn/ui `Card`)
- 각 카드: 토픽명, 아이콘(Lucide), 문서 개수 표시

### 5.2 위키 리스트 (`/wiki`)

```
┌───────────────────────────────────────────┐
│  [전체] [Frontend] [Backend] [CS] [Life]  │  ← 필터 탭
│                                           │
│  🔍 필터링...                              │
│                                           │
│  ▼ Frontend (3)                           │
│  │  Q. React 훅 규칙이란?     [중] [Frontend]│
│  │  Q. Hydration 에러 해결법  [상] [Frontend]│
│  │  Q. CSR vs SSR 차이        [하] [Frontend]│
│                                           │
│  ▼ Backend (2)                            │
│  │  Q. REST vs GraphQL        [중] [Backend]│
│  │  ...                                   │
└───────────────────────────────────────────┘
```

**구성 요소:**
- 토픽 필터 탭 (shadcn/ui `Tabs` 또는 `Badge` 버튼 그룹)
- 검색/필터 Input (shadcn/ui `Input`)
- 토픽별 그룹화된 `Accordion` 리스트
- 각 항목: 제목, `Difficulty` Badge, `Topic` Badge

### 5.3 문서 상세 (`/wiki/[id]`)

```
┌────────┬────────────────────────────┬────────┐
│ 토픽   │  제목                       │ 목차   │
│ 탐색바  │  ─────────────────────────  │       │
│        │  Difficulty · LastUpdated   │ #H1   │
│Frontend│                             │ #H2   │
│Backend │  본문 (Notion 마크다운)       │  #H3  │
│CS      │                             │       │
│Life    │                             │       │
└────────┴────────────────────────────┴────────┘
```

**구성 요소:**
- 좌측 사이드바: 토픽 탐색 네비게이션
- 중앙 본문: Notion 마크다운 렌더링 (코드블록, 이미지, 링크 지원)
- 우측 사이드바: 현재 문서 목차(H2/H3 기반 ToC)
- 상단 메타: `Difficulty` Badge · `LastUpdated` 날짜
- 모바일: 사이드바 숨김, 햄버거 드로어로 대체

---

## 6. MVP 범위

### In Scope ✅

- Notion API 연동: `Status === "발행됨"` 문서를 토픽별로 그룹화하여 가져오는 서버 사이드 데이터 페칭
- shadcn/ui `Accordion`, `Card`, `Badge`, `Input` 컴포넌트를 활용한 미니멀 UI
- 클라이언트 사이드 키워드 필터링(제목 기준)
- 모바일 반응형 디자인 (Tailwind CSS breakpoints)
- Vercel 배포 및 환경변수(`NOTION_TOKEN`, `NOTION_DATABASE_ID`) 설정

### Out of Scope ❌ (v1.0 이후 고려)

- 서버 사이드 전체 본문 검색 (Notion API 제약)
- 댓글 / 피드백 기능
- 사용자 인증 및 개인화
- ISR(Incremental Static Regeneration) / On-demand Revalidation 최적화
- 다국어(i18n) 지원

---

## 7. 구현 단계 (마일스톤)

### Phase 1 — 환경 세팅

- [ ] `@notionhq/client` 설치
- [ ] shadcn/ui 컴포넌트 추가: `accordion`, `input`, `card`, `badge`
- [ ] `.env.local` 환경변수 설정 (`NOTION_TOKEN`, `NOTION_DATABASE_ID`)
- [ ] ESLint / TypeScript 검증 통과 확인

### Phase 2 — Notion API 연동

- [ ] `lib/notion.ts` — Notion 클라이언트 초기화 및 쿼리 유틸 함수 작성
  - `getPublishedPages()`: `Status === "발행됨"` 필터 적용
  - `getPageById(id)`: 단일 문서 블록 조회
  - `groupByTopic(pages)`: 토픽별 Map 반환
- [ ] 서버 컴포넌트에서 데이터 페칭 검증 (콘솔 로그)

### Phase 3 — UI 구현 및 라우팅

- [ ] `/` — 검색바 + 토픽 카드 그리드 구성
- [ ] `/wiki` — 토픽 필터 탭 + 아코디언 목록 구현
- [ ] `/wiki/[id]` — 본문 렌더러 + 사이드바 레이아웃 구현
- [ ] 클라이언트 사이드 검색 필터 연결
- [ ] 모바일 반응형 검증

### Phase 4 — 배포

- [ ] Vercel 프로젝트 연결 및 환경변수 등록
- [ ] 배포 후 전체 라우트 동작 확인
- [ ] Lighthouse 기본 성능 점수 확인

---

## 8. 비기능 요구사항

| 항목 | 목표 |
|------|------|
| 초기 로드 (LCP) | 2.5초 이하 |
| 모바일 지원 | 320px 이상 모든 화면에서 정상 동작 |
| 접근성 | 아코디언 키보드 탐색(Tab/Enter/Space) 지원 |
| SEO | 문서 상세 페이지 `<title>`, `<meta description>` 동적 생성 |
| 보안 | `NOTION_TOKEN`은 서버 전용 환경변수로만 사용 (클라이언트 노출 금지) |

---

## 9. 파일 구조 (예정)

```
app/
├── page.tsx                  # 메인 홈 (/)
├── wiki/
│   ├── page.tsx              # 위키 리스트 (/wiki)
│   └── [id]/
│       └── page.tsx          # 문서 상세 (/wiki/[id])
components/
├── ui/                       # shadcn/ui 컴포넌트
├── wiki/
│   ├── SearchBar.tsx         # 검색바 (클라이언트)
│   ├── TopicGrid.tsx         # 토픽 카드 그리드
│   ├── WikiAccordion.tsx     # 아코디언 목록 (클라이언트)
│   ├── WikiSidebar.tsx       # 토픽 사이드바
│   └── NotionRenderer.tsx    # Notion 블록 렌더러
lib/
├── notion.ts                 # Notion API 유틸
└── utils.ts                  # cn() 헬퍼
```

---

## 10. 참고 링크

- [Notion API 공식 문서](https://developers.notion.com/)
- [shadcn/ui Accordion](https://ui.shadcn.com/docs/components/accordion)
- [Next.js 15 App Router 가이드](https://nextjs.org/docs/app)
- [`@notionhq/client` npm 패키지](https://www.npmjs.com/package/@notionhq/client)
