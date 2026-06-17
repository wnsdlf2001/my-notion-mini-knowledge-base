# Mini Knowledge Base ROADMAP v2

> **버전** v2.0 · **작성일** 2026-06-17 · **기준** docs/PRD.md v1.0 · docs/ROADMAP_V1.md v1.0
> **전제** v1.0 프로덕션 배포 완료 (Notion 연동·3개 라우트·검색/필터·SEO·모바일 드로어·발행 문서 24건)

---

## v2 목표

v1은 "Notion 콘텐츠를 빠르게 탐색·검색하는 위키"의 골격을 완성했다.
v2는 v1에서 의도적으로 미뤘거나 한계로 남은 부분을 메워 **콘텐츠 품질·검색 깊이·성능·재방문성**을 끌어올린다.

### v1에서 넘어온 한계 (v2가 해결할 문제)

| # | v1 한계 | 영향 |
|---|---------|------|
| L1 | 매 요청마다 Notion 재호출 (캐싱 없음) | rate limit 리스크, 느린 응답 |
| L2 | 홈/sitemap이 빌드 시점 고정 | 콘텐츠 추가 시 재배포 전까지 미반영 |
| L3 | 아코디언이 본문 없이 메타+링크만 노출 | PRD 4.1 "아코디언 본문 렌더링" 미충족 |
| L4 | 검색이 제목(title) 클라이언트 필터만 | 본문 키워드로 못 찾음 |
| L5 | `extractPlainText`가 굵게/링크/인라인코드 등 서식 폐기 | 문서 가독성·표현력 저하 |
| L6 | 이미지 블록 미지원 (`parseBlock` default → 빈 문자열) | 시각 콘텐츠 불가 |
| L7 | 목차가 단순 앵커 (현재 위치 표시 없음) | 긴 문서 탐색성 부족 |
| L8 | 재방문 사용자를 위한 개인화 0 | 다시 찾는 동기 약함 |

---

## v2 범위 (In Scope)

| ID | 기능 | 해결 한계 | 분류 |
|----|------|-----------|------|
| V-01 | Notion 응답 캐싱 + ISR/On-demand Revalidation | L1·L2 | Must |
| V-02 | 리치 텍스트 인라인 스타일 렌더링 (bold/italic/code/link 등) | L5 | Must |
| V-03 | 이미지 블록 렌더링 (`next/image`) | L6 | Must |
| V-04 | 전체 본문 검색 (제목 + 본문 텍스트) | L4 | Must |
| V-05 | 아코디언 본문 미리보기 | L3 | Must |
| V-06 | 목차 스크롤 스파이 (현재 섹션 하이라이트 + 부드러운 스크롤) | L7 | Must |
| V-07 | 북마크 (localStorage 기반 즐겨찾기) | L8 | Must |

### Out of Scope (v2.1+ 이월)

- Notion 중첩 블록(토글·콜아웃·표·체크박스) 재귀 렌더링
- 코드블록 신택스 하이라이팅 (Shiki)
- 동적 OG 이미지(`opengraph-image`) · RSS · JSON-LD
- 댓글(Giscus) · 방문 분석(Vercel Analytics)
- 사용자 인증(NextAuth) · 서버 동기화 북마크
- 다국어(i18n)

---

## 가정 사항

| 항목 | 가정값 | 근거 |
|------|--------|------|
| 팀 구성 | 풀스택 1명 (솔로) | v1과 동일 |
| 총 개발 기간 | 약 1주 (버퍼 포함) | 7개 기능, 대부분 v1 자산 확장 |
| Next.js | 16 (Cache Components 사용) | `cacheComponents: true` 활성화 전제 |
| Notion Webhook | 사용 가능 계정 | On-demand revalidation 전제. 미사용 시 시간 기반 + 수동 엔드포인트로 폴백 |
| 기존 규칙 | shrimp-rules.md 준수 | 특히 parseBlock↔BlockRenderer 페어 작업, 타입 변경 동시 수정 |

---

## 시스템 아키텍처 변화 (v1 → v2)

```
[v1]  요청 → Server Component → lib/notion.ts → Notion API  (매번 호출)

[v2]  요청 → Server Component → lib/notion.ts ('use cache' + cacheTag)
                                      │  캐시 적중 시 Notion 호출 없음
                                      ▼
                              [캐시 스토어]
                                      ▲
        Notion 발행/수정 → Webhook → /api/revalidate → revalidateTag('notion')
```

### 주요 기술 결정사항

| 결정 | 선택 | 근거 |
|------|------|------|
| 캐싱 방식 | `unstable_cache`(이전 모델) + `tags` + `revalidate` | 전역 `cacheComponents: true` 활성화로 인한 기존 라우트 동작 변경 위험 회피. Notion SDK는 `fetch` 미사용이라 `unstable_cache`가 적합 |
| 갱신 방식 | `revalidateTag('notion-pages', 'max')` (Webhook/수동) + `revalidate: 3600` 폴백 | 발행 즉시 반영 + 안전망. Next 16에서 `revalidateTag`는 2번째 인자(stale 윈도우 프로파일) 필수 |
| 본문 검색 | 캐시된 페이지 데이터에 본문 plain-text 동봉 → 클라이언트 필터 | 외부 검색엔진 없이 MVP, rate limit 무관 |
| 리치 텍스트 | `WikiRichText[]` 세그먼트 배열로 모델 변경 | 서식 보존, parseBlock↔Renderer 페어 |
| 북마크 저장소 | localStorage + Context/경량 store | 인증 없이 즉시, 서버 부하 0 |

> ⚠️ **AGENTS.md 준수**: 캐싱/리밸리데이션/이미지 설정은 코드 작성 전 `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`, `09-revalidating.md` 재확인.

---

## 개발 로드맵

---

### Phase 1: 데이터 캐싱 & 자동 갱신 (토대)

**왜 먼저인가?** 캐싱이 깔려야 본문 검색(V-04)·아코디언 본문(V-05)이 rate limit 걱정 없이 가능해지고, 홈/sitemap 최신화(L2)가 해결된다. v2의 모든 후속 작업의 기반.

**예상 소요:** 1.5일

#### 스프린트 1

- [x] `lib/notion.ts`의 `getPublishedPages()`/`getPageById()`를 `unstable_cache`로 래핑 (`tags: ['notion-pages']`, `revalidate: 3600`)
  - 내부 `fetch*` 함수로 분리 후 캐시 래퍼 export. 환경변수 미설정 시 빈 배열/`null` fallback 유지 (shrimp-rules 보안 규칙)
- [x] `app/api/revalidate/route.ts` 라우트 핸들러
  - `NOTION_REVALIDATE_SECRET`(쿼리/헤더) 검증 후 `revalidateTag('notion-pages', 'max')` 호출
  - Notion Webhook 최초 `verification_token` 핸드셰이크 에코 처리
  - 시크릿은 서버 전용 (`NEXT_PUBLIC_` 금지)
- [ ] Notion Webhook 연결 (발행/수정 시 위 엔드포인트 호출) — 미지원 환경이면 Vercel Cron 또는 수동 호출로 폴백 *(배포 후 설정)*
- [x] 홈(`/`)·`sitemap.ts`가 빌드 출력상 `Revalidate 1h`로 전환됨 확인

#### Phase 1 완료 기준
- [x] 빌드 출력에서 `/`·`/sitemap.xml`이 Revalidate 1h, Notion 호출은 태그 캐시로 공유됨
- [x] `/api/revalidate`: 시크릿 없음 401, 정상 시크릿 시 `revalidated:true`, 검증 핸드셰이크 에코 동작
- [x] `npm run build` 통과, 런타임 오류 0건
- [ ] *(배포 후)* Vercel에 `NOTION_REVALIDATE_SECRET` 등록 + Webhook 연결

---

### Phase 2: 콘텐츠 표현력 강화 (NotionRenderer)

**왜 두 번째인가?** 검색·미리보기에서 다룰 "본문 데이터" 모델을 먼저 확정해야 한다. 리치 텍스트 도입은 `WikiBlock` 타입을 바꾸므로 검색 인덱싱(Phase 3)보다 앞서야 재작업이 없다.

**예상 소요:** 2일

#### 스프린트 2 — 리치 텍스트 (V-02)

- [ ] `lib/notion.ts`: `WikiRichText` 타입 추가 (`text`, `annotations{bold,italic,strikethrough,code}`, `href`)
- [ ] `parseBlock()`: `extractPlainText` 대신 rich_text 세그먼트 보존 함수로 교체 (paragraph/heading/list/quote 전부)
- [ ] **동시 수정 (shrimp-rules)**: `WikiBlock` 타입 변경 → `WikiAccordion`, `app/wiki/[id]/page.tsx`, `generateMetadata`(plain-text 폴백) 점검
- [ ] `NotionRenderer.tsx`: 세그먼트를 `<strong>/<em>/<code>/<a>`로 렌더, heading `id` 앵커는 plain-text 기준 유지
- [ ] ToC·메타·검색용 plain-text 추출 헬퍼 별도 유지 (`richTextToPlain()`)

#### 스프린트 3 — 이미지 블록 (V-03)

- [ ] `parseBlock()`에 `case "image"` 추가 → `WikiBlock.url`, `caption` 확장 (페어 작업)
- [ ] `NotionRenderer.tsx`의 `BlockRenderer()`에 `case "image"` → `next/image` 렌더 + caption
- [ ] `next.config.ts` `images.remotePatterns`에 Notion S3/외부 호스트 등록
- [ ] Notion 서명 URL 만료 대응: 캐시 `cacheLife` 주기에 맞춰 재발급되도록 확인 (또는 이미지 프록시 검토)

#### Phase 2 완료 기준
- [ ] 굵게/기울임/인라인코드/링크가 본문에 정상 표시
- [ ] 이미지 블록이 깨짐 없이 렌더 (만료 URL 포함)
- [ ] heading 앵커(`h-{id}`)·ToC 연동 유지, tsc/lint/build 통과

---

### Phase 3: 검색 & 콘텐츠 노출 확장

**왜 세 번째인가?** 본문 데이터 모델(Phase 2)이 확정된 뒤라야 본문 텍스트를 인덱싱·미리보기로 활용할 수 있다.

**예상 소요:** 1.5일

#### 스프린트 4 — 전체 본문 검색 (V-04)

- [ ] 캐시된 페이지 데이터에 본문 plain-text(`searchText`) 동봉 — `getPublishedPages()` 확장 또는 별도 `getSearchIndex()`
- [ ] `WikiAccordion`/`WikiListClient` 필터를 제목 + 본문(`searchText`) `includes`로 확장 (debounce 유지)
- [ ] 검색어 하이라이트(선택) 및 0건 Empty State 메시지 유지
- [ ] 본문 동봉으로 인한 페이로드 증가 모니터링 (필요 시 요약 길이 제한)

#### 스프린트 5 — 아코디언 본문 미리보기 (V-05)

- [ ] 아코디언 `AccordionContent`에 본문 앞부분(N블록 또는 요약) 렌더 — `NotionRenderer` 재사용
- [ ] "전체 내용 보기" 링크 유지, 미리보기 길이 제한
- [ ] PRD 4.1 "아코디언 본문 Notion 마크다운 렌더링" 요구 충족 확인

#### Phase 3 완료 기준
- [ ] 본문에만 있는 키워드로 검색 시 해당 문서가 노출
- [ ] 아코디언 펼침 시 본문 미리보기 표시, rate limit 미발생(캐시 적중)
- [ ] 검색 입력 후 300ms 내 필터링 동작 유지

---

### Phase 4: 탐색 UX & 개인화

**왜 네 번째인가?** 콘텐츠/검색이 충실해진 뒤 탐색 경험과 재방문 동기를 더한다. 기능적으로 독립적이라 마지막에 배치해도 안전.

**예상 소요:** 1.5일

#### 스프린트 6 — 목차 스크롤 스파이 (V-06)

- [ ] 우측 ToC를 클라이언트 컴포넌트화, `IntersectionObserver`로 현재 보이는 heading 추적
- [ ] 활성 항목 하이라이트 + 앵커 클릭 시 `scroll-behavior: smooth`
- [ ] 모바일(`lg` 미만)에서는 기존처럼 숨김 유지

#### 스프린트 7 — 북마크 (V-07)

- [ ] localStorage 기반 북마크 store (Context 또는 경량 라이브러리), hydration-safe(마운트 후 읽기)
- [ ] 북마크 토글 버튼: 상세 페이지 메타 영역 + 아코디언 헤더
- [ ] `/wiki?bookmarked=1` 또는 사이드바 "북마크" 항목으로 즐겨찾기만 필터
- [ ] 빈 북마크 Empty State, 토스트(`sonner`)로 추가/해제 피드백
- [ ] 접근성: 토글 버튼 `aria-pressed`·`aria-label`

#### Phase 4 완료 기준
- [ ] 스크롤 시 ToC 활성 항목이 정확히 따라옴
- [ ] 새로고침 후에도 북마크 유지, 북마크 필터 동작
- [ ] 키보드로 북마크 토글 가능

---

### Phase 5: 검증 & 배포

**예상 소요:** 0.5일

- [ ] 캐시 적중률·Notion 호출 횟수 측정 (Phase 1 효과 확인)
- [ ] Lighthouse 재측정: LCP 2.5초 이하 유지/개선
- [ ] Vercel 환경변수 추가: `NOTION_REVALIDATE_SECRET`
- [ ] 프로덕션 배포 후 7개 기능 회귀 점검
- [ ] `npx tsc --noEmit` / `npm run lint` / `npm run build` 0 오류

---

## 리스크 및 완화

| 리스크 | 영향 | 완화 |
|--------|------|------|
| Cache Components 활성화로 기존 동적 라우트 동작 변화 | 중 | 단계적 적용, 빌드 출력의 静/動 라우트 재확인 |
| Notion 이미지 서명 URL 만료 | 중 | `cacheLife` 주기 내 재발급 확인, 필요 시 프록시 |
| 리치 텍스트 도입 시 타입 변경 누락 | 높음 | shrimp-rules "동시 수정 대상" 체크리스트 강제 |
| Webhook 미지원/지연 | 중 | 시간 기반 `cacheLife` + 수동 revalidate 폴백 |
| 본문 동봉으로 페이로드 증가 → LCP 악화 | 중 | 검색용 텍스트 길이 제한, 미리보기 블록 수 제한 |
| 북마크 hydration mismatch | 낮 | 마운트 후 localStorage 읽기, SSR 기본값 빈 상태 |

---

## 기술 부채 / v2.1+ 후보

| 항목 | 우선순위 |
|------|---------|
| 중첩 블록(토글·콜아웃·표) 재귀 렌더링 | 높음 |
| 코드블록 신택스 하이라이팅 (Shiki) | 중간 |
| 동적 OG 이미지 · RSS · JSON-LD | 중간 |
| 방문 분석 · 인기 문서 | 중간 |
| 댓글(Giscus) | 낮음 |
| 인증 + 서버 동기화 북마크 | 낮음 |
| 다국어(i18n) | 낮음 |

---

## 작업 일정 요약

| Phase | 일정 | 산출물 |
|-------|------|--------|
| Phase 1: 캐싱·갱신 | 1.5일 | `'use cache'` 적용, `/api/revalidate` |
| Phase 2: 표현력 | 2일 | 리치 텍스트, 이미지 블록 |
| Phase 3: 검색·미리보기 | 1.5일 | 본문 검색, 아코디언 미리보기 |
| Phase 4: 탐색·개인화 | 1.5일 | 스크롤 스파이, 북마크 |
| Phase 5: 검증·배포 | 0.5일 | 프로덕션 재배포 |
| **합계** | **~7일** | **v2.0 배포** |

---

## 전체 완료 기준 (Definition of Done)

### 기능
- [ ] V-01 캐싱 동작 + 발행 시 자동/수동 갱신 반영
- [ ] V-02 리치 텍스트 서식 렌더링
- [ ] V-03 이미지 블록 렌더링
- [ ] V-04 본문 키워드 검색 동작
- [ ] V-05 아코디언 본문 미리보기 (PRD 4.1 충족)
- [ ] V-06 ToC 스크롤 스파이
- [ ] V-07 북마크 저장·필터·유지

### 품질/성능/보안
- [ ] tsc/lint/build 0 오류, 런타임 콘솔 오류 0건
- [ ] Lighthouse LCP 2.5초 이하 유지
- [ ] `NOTION_TOKEN`·`NOTION_REVALIDATE_SECRET` 클라이언트 미노출
- [ ] shrimp-rules 규칙 준수 (parseBlock↔Renderer 페어, 타입 동시 수정, 단일 진입점)

### 배포
- [ ] Vercel 프로덕션 재배포 + 신규 환경변수 등록
- [ ] 모바일(320px)·데스크탑 전 라우트 정상
