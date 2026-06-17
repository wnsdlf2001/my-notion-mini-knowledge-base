---
name: project-mini-knowledge-base
description: Mini Knowledge Base 프로젝트 현황 — Notion CMS 기반 개인 기술 위키, Next.js 16 App Router
metadata:
  type: project
---

Mini Knowledge Base는 Notion을 CMS로 활용한 개인 기술 위키 웹사이트로, Next.js 16 App Router 기반으로 구축 중이다.

**Why:** 별도 어드민 패널 없이 Notion 워크스페이스에서 콘텐츠를 관리하고, 웹에서는 빠른 탐색/검색 UX를 제공하기 위함.

**How to apply:** 데이터 페칭은 반드시 Server Component에서만 수행 (`NOTION_TOKEN` 보안). 검색/필터는 Client Component에서 처리.

## 구현 현황 (2026-06-04)

- Phase 1 (환경 설정): 완료 — `@notionhq/client` v5, shadcn/ui 컴포넌트 설치 완료
- Phase 2 (공통 모듈): 완료 — `lib/notion.ts` (3개 함수), 5개 공통 컴포넌트 완료
- Phase 3 (핵심 기능): 대부분 완료 — 3개 라우트 구현, debounce 필터·ToC 앵커 검증 필요
- Phase 4~5 (추가 기능·배포): 미착수

## 주요 기술 결정

- `params`/`searchParams`는 `Promise` 타입 (`await` 필수, Next.js 15+ 변경사항)
- `groupByTopic()` 반환값이 `Map`이므로 `Array.from().map()` 변환 필요
- Notion API 미설정 시 빈 배열 반환으로 graceful fallback 처리 (개발 환경 배려)

## 잔여 작업

- `.env.local` 실제 토큰 값 입력
- debounce 300ms 필터링 구현 확인
- ToC 앵커(`#h-{block.id}`) 스크롤 동작 검증
- Vercel 배포 및 Lighthouse 검증

[[roadmap-patterns-notion-cms]]
