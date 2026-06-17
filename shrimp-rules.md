# Development Guidelines (AI Agent 전용)

> 이 문서는 Mini Knowledge Base 프로젝트(Notion CMS 기반 위키)에서 작업하는 AI 코딩 에이전트를 위한 프로젝트 특화 규칙입니다.
> 일반적인 Next.js/React/TypeScript 지식은 포함하지 않습니다. 공통 컨벤션은 `CLAUDE.md`, `AGENTS.md`를 참조하세요.

## 데이터 계층 (`lib/notion.ts`)

### 단일 진입점 원칙
- Notion API 호출은 반드시 `lib/notion.ts`를 통해서만 수행한다.
- **금지**: `app/`, `components/` 어디에서도 `@notionhq/client`를 직접 import하지 않는다.
- 새로운 데이터 조회가 필요하면 `lib/notion.ts`에 함수를 추가하고, 페이지(Server Component)에서 호출한다.
- **예외 — `scripts/` 일회성 도구**: `scripts/notion-check.mjs`처럼 연결 검증·data source ID 탐색용 단독 스크립트는 `@notionhq/client`를 직접 사용하고 `NOTION_TOKEN`/`NOTION_DATABASE_ID`를 직접 읽어도 된다. 이유: `databases.retrieve`/`search` 등 `lib/notion.ts`가 노출하지 않는 진단용 API가 필요하고, 앱 번들(`app/`·`components/`)에 포함되지 않는 개발 전용 도구이기 때문이다. 단, 앱 런타임 코드에서는 이 예외를 적용하지 않는다.

### `WikiPage` / `WikiBlock` 타입 변경 시 동시 수정 대상
타입에 필드를 추가/변경하면 아래 파일을 모두 함께 점검·수정한다:
- `lib/notion.ts`의 `parsePageProperties()` 또는 `parseBlock()` — 새 Notion 속성 파싱 로직 추가
- `components/wiki/WikiAccordion.tsx` — 헤더/Badge에 새 필드 노출 여부 검토
- `app/wiki/[id]/page.tsx` — 상세 페이지 메타 영역(`Difficulty`/`LastUpdated` 표시부)
- `app/wiki/[id]/page.tsx`의 `generateMetadata` — SEO 메타에 영향 있는 필드인 경우

### 새 Notion 블록 타입 지원 추가 (필수 페어 작업)
새 블록 타입(예: `image`, `toggle`, `callout`)을 지원하려면 **반드시 두 곳을 동시에 수정**한다:
1. `lib/notion.ts`의 `parseBlock()` — switch문에 새 `case` 추가, `WikiBlock`에 필요한 필드(`url`, `level` 등) 확장
2. `components/wiki/NotionRenderer.tsx`의 `BlockRenderer()` — 동일 `case`에 대한 렌더링 분기 추가

한쪽만 수정하면 데이터는 파싱되지만 화면에 렌더링되지 않거나(또는 그 반대) 런타임에서 무시되므로 반드시 페어로 작업한다.

- 예시(O): `parseBlock`에 `case "image"` 추가 → `WikiBlock.url` 필드 추가 → `BlockRenderer`에 `case "image"`로 `next/image` 렌더링 추가
- 예시(X): `NotionRenderer.tsx`에만 `case "image"`를 추가하고 `parseBlock`은 그대로 두어 `default` 케이스(빈 문자열)로 떨어지게 방치

### Heading 블록의 ToC 앵커 규칙
- `parseBlock()`에서 `heading_1`/`heading_2`/`heading_3`은 `level` 필드를 반드시 포함해야 한다.
- `NotionRenderer.tsx`의 `BlockRenderer()`에서 heading 블록은 `id={`h-${block.id}`}`와 `scroll-mt-20` 클래스를 **항상 유지**한다. 이 `id`는 `/wiki/[id]` 상세 페이지 우측 ToC의 앵커 링크(`#h-{block.id}`)와 연결되므로 형식을 임의로 바꾸지 않는다.

### 인접 리스트 그룹화 규칙
- `bulleted_list_item` / `numbered_list_item`을 새로 다루는 코드는 `NotionRenderer.tsx`의 기존 그룹화 루프(연속된 동일 타입을 `<ul>`/`<ol>`로 묶는 while 루프) 패턴을 따른다. 개별 `<li>`를 그룹 없이 직접 렌더링하지 않는다.

### 환경변수 / 보안
- `NOTION_TOKEN`, `NOTION_DATABASE_ID`는 `lib/notion.ts`(서버 전용 모듈) 외부에서 직접 `process.env`로 읽지 않는다.
- `NEXT_PUBLIC_` 접두사를 Notion 관련 환경변수에 절대 사용하지 않는다.
- 환경변수가 없을 때 `getNotionClient()`/`getPublishedPages()`/`getPageById()`는 예외를 던지지 않고 `null` 또는 빈 배열/빈 객체를 반환하는 기존 fallback 패턴을 유지한다. 이 동작을 깨는 변경(throw 추가 등) 금지.

## 페이지 / 라우팅 계층 (`app/`)

### 라우트 구조
- `app/page.tsx` — 메인 홈 (Server Component, `getPublishedPages()` + `groupByTopic()` 호출)
- `app/wiki/page.tsx` — 위키 리스트 (Server Component, `searchParams: Promise<{ topic?: string; q?: string }>`)
- `app/wiki/[id]/page.tsx` — 문서 상세 (Server Component, `params: Promise<{ id: string }>`, `generateMetadata` 포함)

### 신규 라우트 추가 시
- 데이터 페칭은 항상 페이지(Server Component)에서 `lib/notion.ts` 함수를 호출하여 수행하고, 결과를 client component에 prop으로 내려준다.
- `params`/`searchParams`는 Next.js 16 규칙에 따라 Promise이므로 `await`으로 해제한 뒤 사용한다 (`app/wiki/page.tsx`, `app/wiki/[id]/page.tsx`의 기존 패턴 참고).
- 존재하지 않는 Notion 페이지 ID로 접근 시 `app/wiki/[id]/page.tsx`처럼 `notFound()`를 호출한다.

### 메타데이터
- `/wiki/[id]`의 `generateMetadata`는 `page.title`, `page.topic`, `page.difficulty`를 조합하여 동적으로 생성하는 기존 패턴을 유지한다. 새 필드를 메타에 추가할 때도 이 함수 내에서만 처리한다.

## 컴포넌트 계층 (`components/wiki/`)

### Server / Client 경계
- `components/wiki/SearchBar.tsx`, `WikiListClient.tsx`는 `"use client"` 컴포넌트로, 검색어 상태 관리와 클라이언트 필터링만 담당한다.
- `WikiSidebar.tsx`, `TopicGrid.tsx`, `NotionRenderer.tsx`, `WikiAccordion.tsx`는 가능한 한 props로 데이터를 받아 렌더링하는 형태를 유지하고, 그 안에서 직접 Notion API를 호출하지 않는다.
- 검색/필터 로직(키워드 매칭, `selectedTopic` AND 조건 결합)은 `WikiListClient.tsx`(상태 보유) / `WikiAccordion.tsx`(매칭·그룹화) 계층에 위치시킨다. `WikiAccordion.tsx`는 이미 필터링된 `pages`를 받아 그룹화·렌더링만 수행한다.
- **debounce는 예외로 `SearchBar.tsx` 입력단에서 처리한다.** `SearchBar`는 홈(`navigateOnSearch=true`, 라우팅)과 리스트(`onSearch` 콜백)에서 공용으로 쓰는 범용 입력 컴포넌트라, 입력값 방출을 300ms debounce하는 책임을 입력단에 두는 것이 자연스럽다. Enter 입력 시에는 debounce를 건너뛰고 즉시 방출한다. WikiListClient는 debounce된 값을 받아 상태로만 관리한다.

### 토픽 아이콘 매핑
- 토픽별 Lucide 아이콘 매핑(`Frontend: Monitor`, `Backend: Server`, `CS: Cpu`, `Life: Heart`, 기타: `FileText`)을 추가/확장할 때는 `components/wiki/TopicGrid.tsx` 내부의 매핑 객체/함수 한 곳에서만 관리한다. 다른 컴포넌트에 동일 매핑을 중복 정의하지 않는다.

### 검색 결과 Empty State
- `/wiki` 검색 결과 0건 시 Empty State 메시지는 `WikiListClient.tsx` (또는 그 자식인 `WikiAccordion.tsx`) 내부에서 처리하며, 페이지(`app/wiki/page.tsx`)에서 조건 분기를 추가하지 않는다.

## 타입 정의 위치

- `WikiPage`, `WikiBlock`, `Difficulty`, `Status` 타입은 `lib/notion.ts`에서만 정의(export)한다. 컴포넌트 파일 내에서 동일 개념의 타입을 재정의하지 않고 `import type { WikiPage, WikiBlock } from "@/lib/notion"`로 가져온다.
- `Status` 타입에 새 상태 값을 추가하면 `getPublishedPages()`의 `Status === "발행됨"` 필터 로직에 영향이 없는지 함께 확인한다.

## 금지 사항

- `lib/notion.ts` 외부에서 `@notionhq/client` 직접 import 금지 (단, `scripts/` 일회성 진단 도구는 예외 — "단일 진입점 원칙" 참고)
- Notion 블록 파싱 로직(switch-case)을 컴포넌트 안에 새로 작성하는 것 금지 — 항상 `parseBlock()`에 위임
- `parseBlock()`과 `NotionRenderer.tsx`의 `BlockRenderer()` 중 한쪽만 수정하는 것 금지 (필수 페어)
- heading 블록의 `id={`h-${block.id}`}` 속성 제거/형식 변경 금지 (ToC 앵커 연동 깨짐)
- `NEXT_PUBLIC_` 접두사로 `NOTION_TOKEN`/`NOTION_DATABASE_ID` 노출 금지
- `.env.local` 파일을 git에 커밋하는 것 금지
