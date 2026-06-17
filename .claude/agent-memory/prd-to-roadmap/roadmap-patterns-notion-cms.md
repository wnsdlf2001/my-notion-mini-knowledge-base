---
name: roadmap-patterns-notion-cms
description: Notion CMS 기반 정적/서버 렌더링 위키 프로젝트의 반복 패턴과 Phase 분할 전략
metadata:
  type: reference
---

## Notion CMS 프로젝트 반복 패턴

### 데이터 레이어 설계 원칙

- Notion API 호출은 `lib/notion.ts` 단일 파일에 집중화 → API 버전 변경 시 한 곳만 수정
- `getNotionClient()` 에서 환경변수 체크 + null 반환으로 graceful fallback 처리
- 타입(`WikiPage`, `WikiBlock`)을 같은 파일에 export하여 전 컴포넌트에서 재사용

### Server/Client Component 경계

- 데이터 페칭 → Server Component (API 토큰 보안)
- 검색/필터/인터랙션 → Client Component (`"use client"`)
- 서버에서 데이터를 fetch한 뒤 Client Component에 prop으로 전달하는 패턴

### 자주 과소평가되는 복잡도 영역

- Notion 블록 타입 다양성: paragraph, heading_1~3, list, code, quote, divider, image, toggle, callout 등 — 초기 구현에서는 핵심 블록만 처리하고 default 케이스에서 빈 문자열 반환
- ToC 앵커 연결: heading 블록에 `id="h-{block.id}"` 속성 추가 누락 시 스크롤 동작 안 함
- `Map` 반환 함수(`groupByTopic`)의 직렬화 문제: Server → Client 전달 시 plain object로 변환 필요

### Phase 분할 전략 (소규모 솔로 프로젝트 기준)

1. 환경 설정 (0.5일): 패키지, 환경변수, 컴포넌트 설치
2. 공통 모듈 (1일): API 유틸, 공통 컴포넌트 (여러 페이지가 공유)
3. 핵심 기능 (2일): 라우트별 페이지 조립, 데이터 흐름 완성
4. 추가 기능 (1일): UX 개선, 접근성, SEO
5. 최적화·배포 (1일): 성능 측정 후 최적화, Vercel 배포

총 약 6일, 버퍼 포함 ~1주.

[[project-mini-knowledge-base]]
