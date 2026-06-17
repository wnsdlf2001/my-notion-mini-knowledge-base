---
name: project-mini-kb-init
description: Mini Knowledge Base 프로젝트 초기화 완료 — @notionhq/client API 구조 및 스타터킷 정리 내역
metadata:
  type: project
---

Mini Knowledge Base (나만의 미니 위키) 초기화 완료. 2026-06-04 기준.

**Why:** Notion을 CMS로 활용한 개인 기술 위키 및 FAQ 가이드북 구현 목적.

**How to apply:** 이 프로젝트에서 Notion API 작업 시 아래 사항을 반드시 확인할 것.

## @notionhq/client API 구조 (버전: 설치 시 최신)

이 버전의 `@notionhq/client`에는 **`databases.query`가 존재하지 않는다**. 대신:
- 데이터베이스 쿼리(필터/정렬): `notion.dataSources.query({ data_source_id: dbId, filter: ..., sorts: ... })`
- 페이지 조회: `notion.pages.retrieve({ page_id: id })`
- 블록 조회: `notion.blocks.children.list({ block_id: id })`
- 전체 검색: `notion.search({ query, filter: { property: "object", value: "page" } })`

`databases` 네임스페이스에는 `retrieve`, `create`, `update`만 있음.

## 제거된 보일러플레이트

- `components/demo/` — DemoActions 데모 코드
- `components/examples/` — forms/overlays/display/data-fetching 예시
- `app/examples/` — /examples 라우트

## 생성된 주요 파일

- `lib/notion.ts` — Notion API 유틸 (getPublishedPages, getPageById, groupByTopic)
- `components/wiki/SearchBar.tsx` — debounce 300ms 검색바 (클라이언트)
- `components/wiki/TopicGrid.tsx` — 토픽 카드 그리드
- `components/wiki/WikiAccordion.tsx` — 아코디언 (클라이언트, 내부 필터링)
- `components/wiki/WikiListClient.tsx` — 검색 상태 관리 클라이언트 래퍼
- `components/wiki/WikiSidebar.tsx` — 토픽 사이드바
- `components/wiki/NotionRenderer.tsx` — Notion 블록 렌더러
- `app/wiki/page.tsx` — 위키 리스트 (서버 컴포넌트, searchParams Promise)
- `app/wiki/[id]/page.tsx` — 문서 상세 (서버 컴포넌트, params Promise)
- `.env.local.example` — 환경변수 예시 파일

## 환경변수 (서버 전용)

- `NOTION_TOKEN` — Notion Integration Secret
- `NOTION_DATABASE_ID` — Notion 데이터베이스 ID

환경변수 미설정 시 graceful fallback (빈 배열 반환) 처리됨.

See also: [[nextjs-16-conventions]]
