# Mini Knowledge Base ROADMAP

> **버전** v1.0 · **작성일** 2026-06-04 · **기준 PRD** docs/PRD.md v1.0

---

## 가정 사항

PRD에 명시되지 않은 항목은 아래와 같이 가정하며, 이해관계자가 반드시 검토해야 합니다.

| 항목 | 가정값 | 근거 |
|------|--------|------|
| 팀 구성 | 풀스택 개발자 1명 (솔로) | 개인 프로젝트 성격 |
| 총 개발 기간 | 약 3주 (버퍼 포함) | 기능 복잡도 기반 추정 |
| Notion 워크스페이스 | 기개설 완료 | 개인 계정 전제 |
| Vercel 계정 | 기개설 완료 | 배포 목표 전제 |
| 목차(ToC) 앵커 | 클라이언트 사이드 스크롤 | SSR 제약 고려 |

---

## 프로젝트 개요

### 제품 비전

Notion을 CMS로 활용해 코드 작성 없이 콘텐츠를 관리하면서, 웹에서는 빠른 탐색과 검색이 가능한 개인 기술 위키 및 FAQ 가이드북을 제공한다.

### 핵심 이해관계자

| 역할 | 설명 |
|------|------|
| 콘텐츠 작성자 | Notion에서 직접 문서를 작성하고 발행 상태를 관리하는 개발자 본인 |
| 방문자 | 토픽별 탐색·검색으로 기술 지식을 빠르게 찾는 개인 개발자 또는 스터디 멤버 |

### 주요 성공 지표 (KPI)

| 지표 | 목표 |
|------|------|
| LCP (Largest Contentful Paint) | 2.5초 이하 |
| 모바일 호환 | 320px 이상 전 화면 정상 동작 |
| 아코디언 접근성 | Tab / Enter / Space 키보드 탐색 지원 |
| SEO | 상세 페이지 `<title>` · `<meta description>` 동적 생성 |
| 보안 | `NOTION_TOKEN` 클라이언트 노출 0건 |

### 기술 스택 요약

| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend Framework | Next.js 16 (App Router) | `params`/`searchParams` Promise 타입 |
| Language | TypeScript 5 | strict 모드 |
| Styling | Tailwind CSS v4 + shadcn/ui | radix-nova 스타일 |
| CMS | Notion API (`@notionhq/client` v5) | 서버 전용 사용 |
| Icons | Lucide React v1 | named import |
| 배포 | Vercel | 환경변수 관리 포함 |

---

## MVP 정의

### MVP 핵심 기능

| ID | 기능 | 분류 |
|----|------|------|
| F-01 | FAQ 아코디언 (토픽별 그룹화 + Badge) | Must Have |
| F-02 | 주제별 필터링 (탭/사이드바) | Must Have |
| F-03 | 실시간 키워드 검색 (debounce 300ms) | Must Have |
| F-04 | 메인 홈 (검색바 + 토픽 카드 그리드) | Must Have |
| F-05 | 문서 상세 (Notion 블록 렌더러 + 목차) | Must Have |
| F-06 | 모바일 반응형 레이아웃 | Must Have |
| F-07 | Vercel 배포 + 환경변수 구성 | Must Have |

### MVP 완료 기준 (Definition of Done)

- [ ] `npx tsc --noEmit` 오류 0건
- [ ] `npm run lint` 경고 0건
- [ ] `npm run build` 성공
- [ ] Vercel 프로덕션 URL에서 3개 라우트(`/`, `/wiki`, `/wiki/[id]`) 정상 동작
- [ ] Notion `Status === "발행됨"` 문서만 노출 확인
- [ ] 모바일(320px) 레이아웃 깨짐 없음
- [ ] Lighthouse 성능 점수 LCP 2.5초 이하

---

## 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                          Vercel                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Next.js 16 App                    │   │
│  │                                                     │   │
│  │  Server Components          Client Components       │   │
│  │  ─────────────────          ──────────────────      │   │
│  │  app/page.tsx               SearchBar.tsx           │   │
│  │  app/wiki/page.tsx          WikiListClient.tsx      │   │
│  │  app/wiki/[id]/page.tsx     (debounce filter)       │   │
│  │                                                     │   │
│  │  lib/notion.ts              components/wiki/        │   │
│  │  (서버 전용 API 유틸)         TopicGrid.tsx           │   │
│  │                             WikiSidebar.tsx         │   │
│  │                             WikiAccordion.tsx       │   │
│  │                             NotionRenderer.tsx      │   │
│  └───────────────────┬─────────────────────────────────┘   │
│                      │ HTTPS (서버 사이드만)                  │
└──────────────────────┼──────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   Notion API    │
              │ databases.query │
              │ pages.retrieve  │
              │blocks.children  │
              └─────────────────┘
```

### 주요 기술 결정사항

| 결정 | 선택 | 근거 |
|------|------|------|
| 데이터 페칭 위치 | Server Component | `NOTION_TOKEN` 클라이언트 노출 방지 |
| 검색/필터 위치 | Client Component | 즉각적인 UX, 서버 왕복 없음 |
| 라우팅 방식 | App Router | Next.js 16 권장, `searchParams` Promise 타입 지원 |
| 블록 렌더러 | 자체 구현 (`NotionRenderer.tsx`) | 외부 라이브러리 의존성 최소화 |

### 외부 의존성

| 의존성 | 용도 | 리스크 |
|--------|------|--------|
| `@notionhq/client` | Notion API 통신 | API rate limit (초당 3회), 스키마 변경 가능성 |
| Notion API | 데이터 원천 | 서비스 장애 시 전체 콘텐츠 미노출 |
| Vercel | 배포 플랫폼 | 무료 플랜 함수 실행 제한(10초) |

---

## 개발 로드맵

---

### Phase 1: 프로젝트 초기 설정 (골격 구축)

**왜 이 단계가 먼저인가?**
이후 모든 개발은 환경 설정, 의존성, 타입 시스템이 올바르게 갖춰진 상태에서 진행되어야 합니다.
기반 없이 기능을 개발하면 나중에 설정 문제로 전체 코드를 수정해야 하는 리스크가 생깁니다.

**예상 소요 시간:** 0.5일

#### 스프린트 1 (Day 1 오전)

- [x] `@notionhq/client` 패키지 설치 확인 (`package.json` 포함 여부)
- [x] shadcn/ui 컴포넌트 추가: `accordion`, `input`, `card`, `badge`
- [x] `.env.local` 파일 생성 및 환경변수 키 정의
  - `NOTION_TOKEN=<내부_인테그레이션_토큰>`
  - `NOTION_DATABASE_ID=<데이터베이스_ID>`
- [ ] `.env.local`을 `.gitignore`에 포함 여부 확인 (보안)
- [x] `tsconfig.json` strict 모드 활성화 확인
- [x] `npx tsc --noEmit` · `npm run lint` 통과 확인

#### Phase 1 완료 기준

- [ ] `npm run dev` 실행 시 Next.js 개발 서버 정상 기동
- [ ] `npx tsc --noEmit` 오류 0건
- [ ] `npm run lint` 오류 0건
- [ ] `accordion`, `badge`, `card`, `input` 컴포넌트가 `components/ui/`에 존재

> **현황 (2026-06-04 기준):** 패키지 설치 및 shadcn 컴포넌트 추가는 완료된 상태. `.env.local` 실제 토큰 값 입력이 남아있음.

---

### Phase 2: 공통 모듈 / 컴포넌트 개발

**왜 이 단계가 두 번째인가?**
UI 렌더링은 데이터가 있어야 검증할 수 있습니다. Notion API 유틸과 공통 타입을 먼저 확정해야
이후 모든 페이지에서 일관된 데이터 구조를 사용할 수 있습니다.
공통 컴포넌트(사이드바, 검색바)는 여러 페이지에서 재사용되므로 핵심 기능보다 앞서 완성해야 합니다.

**예상 소요 시간:** 1일

#### 스프린트 2 (Day 1 오후 ~ Day 2)

**Notion API 유틸 (`lib/notion.ts`)**

- [x] `WikiPage` · `WikiBlock` 타입 정의
- [x] `getNotionClient()` - 환경변수 미설정 시 graceful fallback 처리
- [x] `getPublishedPages()` - `Status === "발행됨"` 필터 + `LastUpdated` 내림차순 정렬
- [x] `getPageById(id)` - 페이지 메타데이터 + 블록 목록 동시 조회
- [x] `groupByTopic(pages)` - `Map<string, WikiPage[]>` 반환
- [x] `parseBlock()` - paragraph, heading_1~3, list, code, quote, divider 지원
- [ ] 실제 Notion 데이터베이스 연결 후 콘솔 출력으로 데이터 형태 검증

**공통 컴포넌트**

- [x] `components/wiki/SearchBar.tsx` - 검색어 입력 (클라이언트, `"use client"`)
  - `router.push` 또는 URL searchParams 업데이트 방식
- [x] `components/wiki/WikiSidebar.tsx` - 토픽 네비게이션 링크 목록
  - 현재 토픽 활성화 표시
- [x] `components/wiki/TopicGrid.tsx` - 토픽 카드 그리드 (`Card` 컴포넌트 활용)
  - 토픽명, Lucide 아이콘, 문서 개수 표시
- [x] `components/wiki/WikiAccordion.tsx` - 아코디언 기본 골격
  - `shadcn/ui Accordion` 래핑, 제목 + `Topic` Badge + `Difficulty` Badge
- [x] `components/wiki/NotionRenderer.tsx` - `WikiBlock[]`을 HTML로 렌더링
  - 코드블록, 인용구, 구분선, 리스트 지원

#### Phase 2 완료 기준

- [ ] `lib/notion.ts` 함수 3개 모두 타입 오류 0건
- [ ] 환경변수 설정 후 `getPublishedPages()` 실행 시 Notion 데이터 반환 확인
- [ ] 공통 컴포넌트 5개 모두 TypeScript 컴파일 통과
- [ ] `SearchBar`, `WikiSidebar`가 독립적으로 브라우저에서 렌더링 가능

> **현황 (2026-06-04 기준):** `lib/notion.ts` 및 공통 컴포넌트 5개 구현 완료. 실제 Notion 연결 검증 필요.

---

### Phase 3: 핵심 기능 개발

**왜 이 단계가 세 번째인가?**
기반 모듈과 공통 컴포넌트가 완성된 상태에서 라우트별 페이지를 조립합니다.
이 순서를 지켜야 각 페이지에서 컴포넌트를 수정 없이 가져다 쓸 수 있으며,
데이터 흐름(서버 컴포넌트 → 클라이언트 컴포넌트 prop 전달)을 단계적으로 검증할 수 있습니다.

**예상 소요 시간:** 2일

#### 스프린트 3 (Day 3: 메인 홈 + 위키 리스트)

**메인 홈 (`app/page.tsx`)**

- [x] Server Component로 `getPublishedPages()` + `groupByTopic()` 호출
- [x] 헤더: 로고 + 앱 이름 + `ThemeToggle`
- [x] 대형 검색바 (`SearchBar`) - `/wiki?q=` 라우팅 연결
- [x] 토픽 카드 그리드 (`TopicGrid`) - 각 카드 클릭 시 `/wiki?topic=` 이동
- [x] 발행 문서 0건 시 Empty State 메시지 표시
- [x] 푸터: "Powered by Notion API · Built with Next.js"

**위키 리스트 (`app/wiki/page.tsx`)**

- [x] `searchParams: Promise<{ topic?: string; q?: string }>` 처리 (`await` 또는 `React.use()`)
- [x] 서버에서 `getPublishedPages()` 후 `WikiListClient`에 prop으로 전달
- [x] 좌측 `WikiSidebar` - 데스크탑 sticky 레이아웃
- [x] 모바일 Badge 필터 탭 (사이드바 대체)
- [x] `WikiListClient` - 검색 Input + `WikiAccordion` 통합 클라이언트 컴포넌트
- [ ] debounce 300ms 키워드 필터링 (제목 기준 `includes` 또는 정규식)
- [ ] 검색 결과 0건 시 "검색 결과가 없습니다" Empty State
- [ ] `metadata` export (`title`, `description`)

**클라이언트 사이드 검색 필터 (`WikiListClient.tsx`)**

- [x] `useState` + `useCallback`으로 검색어 상태 관리
- [ ] debounce 유틸 (300ms) 직접 구현 또는 `use-debounce` 라이브러리 활용
- [ ] `selectedTopic` prop 기반 필터링과 키워드 필터링 AND 조건 결합
- [ ] URL searchParams 동기화 (`useRouter` / `useSearchParams`)

#### 스프린트 4 (Day 4: 문서 상세 + 반응형)

**문서 상세 (`app/wiki/[id]/page.tsx`)**

- [x] `params: Promise<{ id: string }>` 처리
- [x] `generateMetadata` - `page.title` · `page.topic` · `page.difficulty` 기반 동적 메타 생성
- [x] `getPageById(id)` + `getPublishedPages()` 병렬 호출 (`Promise.all`)
- [x] 존재하지 않는 ID 접근 시 `notFound()` 처리
- [x] 3단 레이아웃: 좌측 토픽 사이드바 + 중앙 본문 + 우측 목차(ToC)
- [x] `NotionRenderer` 로 Notion 블록 렌더링
- [x] 난이도별 색상 Badge (상=빨강, 중=노랑, 하=초록)
- [x] `LastUpdated` 날짜 포맷 (`ko-KR` locale)
- [ ] 목차 앵커 링크 스크롤 동작 검증 (`#h-{block.id}`)
- [ ] `NotionRenderer` heading 블록에 `id="h-{block.id}"` 속성 추가 (ToC 앵커 연결)

**모바일 반응형**

- [x] 위키 리스트: 데스크탑 사이드바 숨김(`hidden md:block`), 모바일 Badge 탭 표시
- [x] 문서 상세: 좌측 사이드바 `hidden md:block`, 우측 목차 `hidden lg:block`
- [ ] 모바일에서 햄버거 드로어(Sheet) 구현 검토 (PRD 요구사항 - 선택 구현)
- [ ] 320px 화면에서 레이아웃 깨짐 없음 수동 검증

#### Phase 3 완료 기준

- [ ] 3개 라우트 모두 `npm run build` 통과
- [ ] 실제 Notion 데이터로 아코디언 목록 렌더링 확인
- [ ] 검색어 입력 후 300ms 내 필터링 동작 확인
- [ ] `/wiki/[id]` 상세 페이지 ToC 앵커 스크롤 동작 확인
- [ ] `<meta description>` 동적 생성 확인 (브라우저 DevTools)
- [ ] 320px 모바일 레이아웃 검증

---

### Phase 4: 추가 기능 개발

**왜 이 단계가 네 번째인가?**
MVP 핵심 기능이 완성된 후, 사용성을 높이는 세부 기능을 추가합니다.
이 단계의 기능들은 MVP 동작에 영향을 주지 않으므로 핵심 기능 완성 이후로 미루는 것이 올바른 우선순위입니다.

**예상 소요 시간:** 1일

#### 스프린트 5 (Day 5)

**UX 개선**

- [ ] `SearchBar`에서 엔터 키 입력 시 `/wiki?q=` 라우팅 (홈 페이지 검색바)
- [ ] `WikiListClient` URL searchParams 동기화 (브라우저 뒤로가기 시 필터 유지)
- [ ] 토픽 카드 그리드 아이콘 매핑 확장
  - Frontend: `Monitor`, Backend: `Server`, CS: `Cpu`, Life: `Heart`, 기타: `FileText`
- [ ] 아코디언 본문 내 Notion 블록 렌더링 품질 개선
  - `bulleted_list_item` / `numbered_list_item` 연속 그룹화
  - `code` 블록 언어 레이블 표시
  - `quote` 블록 좌측 border 스타일 적용
- [ ] 모바일 드로어 네비게이션 (`Sheet` 컴포넌트 활용, 선택 구현)

**접근성**

- [ ] 아코디언 `aria-expanded` · `aria-controls` 속성 확인 (shadcn/ui 기본 제공 여부 검토)
- [ ] 검색 Input `aria-label` · `role="search"` 적용
- [ ] 키보드 탐색 (Tab / Enter / Space) E2E 수동 검증

**SEO**

- [ ] 메인 홈 `layout.tsx` 기본 `metadata` (title template, description, og:image) 설정
- [ ] 위키 리스트 페이지 `metadata` 보완
- [ ] `robots.txt` · `sitemap.xml` 생성 검토 (Next.js `app/robots.ts` 방식)

#### Phase 4 완료 기준

- [ ] 홈 검색바에서 엔터 입력 시 `/wiki?q=` 이동 확인
- [ ] 브라우저 뒤로가기 후 이전 필터 상태 복원 확인
- [ ] Lighthouse 접근성 점수 90점 이상
- [ ] 주요 페이지 OG 태그 존재 확인

---

### Phase 5: 최적화 및 배포

**왜 이 단계가 마지막인가?**
기능이 완전히 동작하는 상태에서 성능 수치를 측정하고 최적화해야
정확한 기준선(baseline)과 개선 효과를 확인할 수 있습니다.
배포는 기능 안정성이 검증된 후에 진행해야 프로덕션 장애 리스크를 최소화합니다.

**예상 소요 시간:** 1일

#### 스프린트 6 (Day 6)

**성능 최적화**

- [ ] `npm run build` 빌드 결과 번들 사이즈 분석 (`.next/analyze` 또는 빌드 출력 확인)
- [ ] Server Component와 Client Component 경계 재검토
  - `"use client"` 범위를 최소화하여 서버 렌더링 비율 유지
- [ ] Notion API 응답 캐싱 전략 검토
  - Next.js `fetch` cache 옵션 또는 `revalidate` 설정 (v1.0 Out of Scope이나 기본값 검토)
- [ ] `next/image` 적용 가능 영역 확인 (Notion 이미지 블록 추후 지원 시 대비)

**배포**

- [ ] Vercel 프로젝트 생성 및 GitHub 레포지토리 연결
- [ ] Vercel 환경변수 등록
  - `NOTION_TOKEN` (Production + Preview)
  - `NOTION_DATABASE_ID` (Production + Preview)
- [ ] 프로덕션 배포 실행
- [ ] 배포 후 3개 라우트 전체 동작 확인
  - `/` 토픽 카드 그리드 표시
  - `/wiki` 아코디언 목록 + 검색 필터
  - `/wiki/[id]` 본문 렌더링 + ToC
- [ ] Lighthouse CI 실행 (성능 · 접근성 · SEO · Best Practices)
  - 성능: LCP 2.5초 이하
  - SEO: 90점 이상
  - 접근성: 90점 이상

#### Phase 5 완료 기준

- [ ] Vercel 프로덕션 URL 활성화 확인
- [ ] LCP 2.5초 이하 (Lighthouse 또는 WebPageTest)
- [ ] `NOTION_TOKEN`이 브라우저 Network 탭에서 미노출 확인
- [ ] 모바일(320px) + 데스크탑(1280px) 전체 라우트 스크린샷 검증
- [ ] 빌드 오류 · 런타임 콘솔 오류 0건

---

## 리스크 및 완화 전략

| 리스크 | 영향도 | 발생 가능성 | 완화 전략 |
|--------|--------|------------|-----------|
| Notion API rate limit (초당 3회) | 높음 | 낮음 | 서버 컴포넌트에서만 호출, 필요 시 응답 캐싱 추가 |
| `@notionhq/client` v5 API 변경 | 중간 | 낮음 | `lib/notion.ts`에 API 호출 집중화, 변경 시 단일 파일만 수정 |
| Notion 서비스 장애 | 높음 | 낮음 | 오류 시 빈 배열 반환 + 사용자 안내 메시지 표시 (현재 구현됨) |
| Next.js 16 Breaking Changes | 중간 | 중간 | `node_modules/next/dist/docs/` 우선 참조 (AGENTS.md 지침 준수) |
| `params`/`searchParams` Promise 타입 미처리 | 높음 | 중간 | 모든 페이지에서 `await params` / `await searchParams` 적용 확인 |
| `NOTION_TOKEN` 클라이언트 노출 | 높음 | 낮음 | `NEXT_PUBLIC_` 접두사 사용 금지, 서버 컴포넌트/`lib/notion.ts` 에서만 접근 |
| Notion 블록 타입 미지원 (이미지, 임베드 등) | 낮음 | 높음 | `parseBlock` default 케이스에서 빈 문자열 반환, v1.1에서 확장 |
| Vercel 무료 플랜 함수 실행 시간 초과 (10초) | 중간 | 낮음 | 페이지당 Notion API 호출 횟수 최소화, `Promise.all` 병렬 처리 |

---

## 기술 부채 및 향후 고려사항 (v1.1+)

| 항목 | 설명 | 우선순위 |
|------|------|---------|
| ISR / On-demand Revalidation | Notion 문서 발행 시 자동 캐시 갱신 (Notion Webhook 연동) | 높음 |
| 서버 사이드 전체 본문 검색 | Notion API 제약으로 v1.0 제외. Algolia 또는 별도 인덱싱 검토 | 높음 |
| Notion 이미지 블록 렌더링 | `image` 블록 타입 파싱 + `next/image` 최적화 | 중간 |
| 모바일 햄버거 드로어 | `Sheet` 컴포넌트를 활용한 토픽 네비게이션 | 중간 |
| 다국어(i18n) 지원 | `next-intl` 또는 Next.js 내장 i18n | 낮음 |
| 댓글 / 피드백 기능 | Giscus (GitHub Discussions) 연동 검토 | 낮음 |
| 사용자 인증 및 개인화 | NextAuth.js + 북마크 기능 | 낮음 |
| Notion 중첩 블록(토글, 콜아웃) 지원 | `blocks.children` 재귀 호출 필요 | 중간 |

---

## 리소스 계획

### 팀 구성

| 역할 | 담당 | 책임 |
|------|------|------|
| 풀스택 개발자 | 1명 | 전체 개발 · 배포 · 유지보수 |
| 콘텐츠 작성자 | 개발자 본인 | Notion 데이터베이스 관리 및 문서 발행 |

### 작업 일정 요약

| Phase | 일정 | 주요 산출물 |
|-------|------|-------------|
| Phase 1: 환경 설정 | Day 1 오전 (0.5일) | 패키지 설치, 환경변수, shadcn 컴포넌트 |
| Phase 2: 공통 모듈 | Day 1 오후 ~ Day 2 (1일) | `lib/notion.ts`, 5개 공통 컴포넌트 |
| Phase 3: 핵심 기능 | Day 3 ~ Day 4 (2일) | 3개 라우트 페이지, 검색 필터, 반응형 |
| Phase 4: 추가 기능 | Day 5 (1일) | UX 개선, 접근성, SEO |
| Phase 5: 최적화·배포 | Day 6 (1일) | Vercel 배포, Lighthouse 검증 |
| **합계** | **6일** (버퍼 포함 ~1주) | **프로덕션 배포 완료** |

---

## 전체 완료 기준 (Definition of Done)

### 코드 품질

- [ ] `npx tsc --noEmit` 오류 0건
- [ ] `npm run lint` 경고/오류 0건
- [ ] `npm run build` 성공, 런타임 콘솔 오류 0건

### 기능 검증

- [ ] `/` 메인 홈: 검색바 입력 → `/wiki?q=` 이동, 토픽 카드 클릭 → `/wiki?topic=` 이동
- [ ] `/wiki`: 토픽 필터 + 키워드 검색 동시 동작, Empty State 표시
- [ ] `/wiki/[id]`: 본문 렌더링, ToC 앵커 스크롤, 메타 태그 동적 생성
- [ ] `Status !== "발행됨"` 문서 미노출 확인
- [ ] 존재하지 않는 ID 접근 시 404 페이지 표시

### 성능 / 보안

- [ ] Lighthouse LCP 2.5초 이하 (모바일 · 데스크탑)
- [ ] `NOTION_TOKEN` 브라우저 Network 탭 미노출
- [ ] 모바일 320px 레이아웃 정상 동작

### 배포

- [ ] Vercel 프로덕션 URL 정상 접근
- [ ] 환경변수 Production · Preview 환경 모두 등록 확인
