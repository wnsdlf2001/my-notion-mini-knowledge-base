// Notion DB 콘텐츠 대량 보강 (v2: 리치 텍스트/코드/리스트/인용구 활용)
// 사용법: npm run notion:seed-v2
// 이미 존재하는 제목은 건너뛴다(중복 방지).

import { readFileSync } from "node:fs"
import { Client } from "@notionhq/client"

function loadEnv() {
  const env = {}
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
  return env
}

const env = loadEnv()
const notion = new Client({ auth: env.NOTION_TOKEN })
const dataSourceId = env.NOTION_DATABASE_ID

// ── 인라인 리치 텍스트 빌더 ──
// t("텍스트", { b:bold, i:italic, c:code, s:strike, href:"링크" })
const t = (content, o = {}) => ({
  type: "text",
  text: { content, ...(o.href ? { link: { url: o.href } } : {}) },
  annotations: {
    bold: !!o.b,
    italic: !!o.i,
    strikethrough: !!o.s,
    code: !!o.c,
  },
})

// ── 블록 빌더 ──
const h2 = (s) => ({ type: "heading_2", heading_2: { rich_text: [t(s)] } })
const h3 = (s) => ({ type: "heading_3", heading_3: { rich_text: [t(s)] } })
const p = (...segs) => ({ type: "paragraph", paragraph: { rich_text: segs.length ? segs : [t("")] } })
const li = (...segs) => ({ type: "bulleted_list_item", bulleted_list_item: { rich_text: segs } })
const nli = (...segs) => ({ type: "numbered_list_item", numbered_list_item: { rich_text: segs } })
const q = (s) => ({ type: "quote", quote: { rich_text: [t(s)] } })
const code = (s, lang = "javascript") => ({ type: "code", code: { rich_text: [t(s)], language: lang } })
const hr = () => ({ type: "divider", divider: {} })

// ── 문서 데이터 ──
const docs = [
  // ───────── Frontend ─────────
  { title: "TypeScript 제네릭 기초", topic: "Frontend", difficulty: "중", date: "2026-06-17", body: [
    h2("제네릭이란"),
    p(t("타입을 "), t("매개변수처럼", { b: true }), t(" 받아 재사용 가능한 컴포넌트를 만드는 기능이다. "), t("any", { c: true }), t("를 쓰지 않고도 유연하면서 타입 안전한 코드를 작성할 수 있다.")),
    h2("예시"),
    code("function identity<T>(value: T): T {\n  return value\n}\nconst n = identity<number>(42) // number\nconst s = identity('hi')        // 추론으로 string", "typescript"),
    h2("제약 조건"),
    p(t("extends", { c: true }), t(" 로 타입 범위를 좁힐 수 있다.")),
    code("function len<T extends { length: number }>(x: T) {\n  return x.length\n}", "typescript"),
    q("제네릭은 '나중에 정할 타입'에 이름을 붙이는 것이라고 생각하면 쉽다."),
  ]},
  { title: "useEffect 의존성 배열 완벽 이해", topic: "Frontend", difficulty: "상", date: "2026-06-17", body: [
    h2("의존성 배열의 의미"),
    p(t("두 번째 인자 배열은 "), t("\"이 값들이 바뀌면 effect를 다시 실행하라\"", { i: true }), t(" 는 뜻이다.")),
    li(t("[]", { c: true }), t(" — 마운트 시 1회만 실행")),
    li(t("[dep]", { c: true }), t(" — dep이 바뀔 때마다 실행")),
    li(t("생략 — 매 렌더마다 실행 (대개 버그)")),
    h2("자주 하는 실수"),
    p(t("객체·함수를 의존성에 넣으면 매 렌더마다 새 참조가 생겨 무한 루프가 날 수 있다. "), t("useCallback", { c: true }), t(" / "), t("useMemo", { c: true }), t(" 로 참조를 안정화한다.")),
    q("린트 규칙 exhaustive-deps 경고를 임의로 무시하지 말 것."),
  ]},
  { title: "디바운스와 스로틀의 차이", topic: "Frontend", difficulty: "중", date: "2026-06-16", body: [
    h2("디바운스 (Debounce)"),
    p(t("연속 이벤트가 "), t("멈춘 뒤", { b: true }), t(" 일정 시간이 지나면 한 번 실행. 검색 입력에 적합하다.")),
    h2("스로틀 (Throttle)"),
    p(t("일정 간격마다 "), t("최대 한 번", { b: true }), t(" 실행. 스크롤·리사이즈에 적합하다.")),
    code("function debounce(fn, ms) {\n  let id\n  return (...args) => {\n    clearTimeout(id)\n    id = setTimeout(() => fn(...args), ms)\n  }\n}", "javascript"),
    q("이 위키의 검색창도 300ms 디바운스를 쓴다."),
  ]},
  { title: "CSS 박스 모델", topic: "Frontend", difficulty: "하", date: "2026-06-16", body: [
    h2("구성"),
    p(t("모든 요소는 "), t("content → padding → border → margin", { c: true }), t(" 순의 사각형 박스다.")),
    h2("box-sizing"),
    li(t("content-box", { c: true }), t(" (기본): width가 content만 의미")),
    li(t("border-box", { c: true }), t(" : width가 border까지 포함 — 레이아웃 계산이 직관적")),
    p(t("대부분의 리셋 CSS가 "), t("* { box-sizing: border-box }", { c: true }), t(" 를 적용하는 이유다.")),
  ]},
  { title: "웹 접근성(a11y) 기본", topic: "Frontend", difficulty: "중", date: "2026-06-15", body: [
    h2("왜 중요한가"),
    p(t("스크린리더 사용자, 키보드 사용자 등 "), t("모두", { b: true }), t("가 쓸 수 있어야 한다. SEO와 법적 요구사항에도 영향.")),
    h2("핵심 체크리스트"),
    li(t("의미있는 시맨틱 태그 사용 (button, nav, main)")),
    li(t("이미지 "), t("alt", { c: true }), t(" 제공")),
    li(t("폼 요소에 "), t("label", { c: true }), t(" 연결")),
    li(t("키보드만으로 모든 기능 사용 가능")),
    li(t("색 대비(contrast) 4.5:1 이상")),
    q("ARIA는 '시맨틱 HTML로 안 될 때'의 보충재다. 네이티브 요소가 우선."),
  ]},
  { title: "상태관리: 언제 외부 라이브러리가 필요한가", topic: "Frontend", difficulty: "상", date: "2026-06-15", body: [
    h2("기본은 로컬 상태"),
    p(t("useState", { c: true }), t(" / "), t("useReducer", { c: true }), t(" 로 충분한 경우가 대부분이다.")),
    h2("Context의 한계"),
    p(t("전역 공유엔 좋지만, 값이 자주 바뀌면 "), t("구독한 모든 컴포넌트가 리렌더", { b: true }), t(" 되어 성능 문제가 생길 수 있다.")),
    h2("외부 라이브러리 고려 시점"),
    li(t("서버 상태 캐싱 → "), t("TanStack Query", { href: "https://tanstack.com/query" })),
    li(t("복잡한 전역 클라이언트 상태 → Zustand, Jotai 등")),
  ]},
  { title: "번들 사이즈 최적화", topic: "Frontend", difficulty: "상", date: "2026-06-14", body: [
    h2("측정이 먼저"),
    p(t("추측하지 말고 번들 분석기로 무엇이 큰지 확인한다.")),
    h2("주요 기법"),
    li(t("코드 스플리팅 / 동적 "), t("import()", { c: true })),
    li(t("트리 셰이킹 가능한 라이브러리 선택")),
    li(t("거대 의존성을 경량 대안으로 교체 (예: moment → date-fns)")),
    li(t("이미지·폰트 최적화")),
    q("가장 빠른 코드는 보내지 않은 코드다."),
  ]},
  { title: "이벤트 위임(Event Delegation)", topic: "Frontend", difficulty: "중", date: "2026-06-14", body: [
    h2("개념"),
    p(t("자식마다 핸들러를 다는 대신 "), t("부모에 하나", { b: true }), t("만 달고, 이벤트 버블링을 이용해 "), t("event.target", { c: true }), t(" 으로 분기한다.")),
    h2("장점"),
    li(t("핸들러 수 감소 → 메모리 절약")),
    li(t("동적으로 추가된 요소도 자동 처리")),
    code("list.addEventListener('click', (e) => {\n  const item = e.target.closest('li')\n  if (item) handle(item.dataset.id)\n})", "javascript"),
  ]},

  // ───────── Backend ─────────
  { title: "RESTful API 설계 원칙", topic: "Backend", difficulty: "중", date: "2026-06-17", body: [
    h2("리소스 중심 설계"),
    p(t("URL은 "), t("명사", { b: true }), t(" 로, 행위는 "), t("HTTP 메서드", { b: true }), t(" 로 표현한다.")),
    li(t("GET /users", { c: true }), t(" — 목록 조회")),
    li(t("POST /users", { c: true }), t(" — 생성")),
    li(t("GET /users/1", { c: true }), t(" — 단건 조회")),
    li(t("PATCH /users/1", { c: true }), t(" — 부분 수정")),
    li(t("DELETE /users/1", { c: true }), t(" — 삭제")),
    h2("좋은 습관"),
    li(t("동사형 URL 금지 ("), t("/getUser", { c: true, s: true }), t(")")),
    li(t("적절한 상태 코드 반환")),
    li(t("페이지네이션·필터는 쿼리스트링으로")),
  ]},
  { title: "인증(Authentication) vs 인가(Authorization)", topic: "Backend", difficulty: "중", date: "2026-06-16", body: [
    h2("인증"),
    p(t("\"너 누구야?\"", { i: true }), t(" — 신원 확인. 로그인이 대표적이다.")),
    h2("인가"),
    p(t("\"너 이거 해도 돼?\"", { i: true }), t(" — 권한 확인. 관리자만 접근 같은 것.")),
    q("인증은 401, 인가 실패는 403으로 응답한다."),
  ]},
  { title: "N+1 쿼리 문제", topic: "Backend", difficulty: "상", date: "2026-06-16", body: [
    h2("증상"),
    p(t("목록 1번 조회 후, 각 항목마다 연관 데이터를 "), t("N번", { b: true }), t(" 추가 조회 → 총 N+1번의 쿼리.")),
    h2("해결"),
    li(t("Eager loading / JOIN 으로 한 번에 가져오기")),
    li(t("ORM의 "), t("include", { c: true }), t(" / "), t("select_related", { c: true }), t(" 활용")),
    li(t("DataLoader로 배치 조회")),
    q("이 위키도 본문 수집 시 동시성을 제한해 과도한 호출을 막는다."),
  ]},
  { title: "멱등성(Idempotency)", topic: "Backend", difficulty: "상", date: "2026-06-15", body: [
    h2("정의"),
    p(t("같은 요청을 "), t("여러 번 보내도 결과가 동일", { b: true }), t("한 성질.")),
    h2("메서드별"),
    li(t("GET, PUT, DELETE — 멱등")),
    li(t("POST — 일반적으로 비멱등")),
    h2("실무"),
    p(t("결제처럼 중복이 치명적인 API는 "), t("Idempotency-Key", { c: true }), t(" 헤더로 중복 실행을 막는다.")),
  ]},
  { title: "메시지 큐 기초", topic: "Backend", difficulty: "중", date: "2026-06-15", body: [
    h2("왜 쓰나"),
    p(t("생산자와 소비자를 "), t("비동기로 분리", { b: true }), t("해 트래픽 급증을 완충하고 장애를 격리한다.")),
    h2("활용 예"),
    li(t("이메일·알림 발송")),
    li(t("무거운 작업 백그라운드 처리")),
    li(t("서비스 간 이벤트 전달")),
    q("대표 도구: RabbitMQ, Kafka, AWS SQS."),
  ]},
  { title: "Rate Limiting 전략", topic: "Backend", difficulty: "상", date: "2026-06-14", body: [
    h2("필요성"),
    p(t("남용·과금 폭탄·DoS를 막는다. (Notion API도 "), t("초당 약 3회", { b: true }), t(" 제한이 있다.)")),
    h2("알고리즘"),
    li(t("고정 윈도우 — 단순하지만 경계에서 버스트")),
    li(t("슬라이딩 윈도우 — 더 부드러움")),
    li(t("토큰 버킷 — 버스트 허용 + 평균 제한")),
    p(t("초과 시 "), t("429 Too Many Requests", { c: true }), t(" 와 "), t("Retry-After", { c: true }), t(" 헤더를 반환한다.")),
  ]},
  { title: "쿠키, 세션, 토큰", topic: "Backend", difficulty: "중", date: "2026-06-13", body: [
    h2("세션 방식"),
    p(t("서버가 세션을 저장하고 클라이언트는 세션 ID 쿠키만 가진다. 서버 상태가 필요(stateful).")),
    h2("토큰 방식(JWT)"),
    p(t("서버가 상태를 저장하지 않고(stateless) 토큰 서명만 검증한다. 확장에 유리.")),
    h2("쿠키 보안 플래그"),
    li(t("HttpOnly", { c: true }), t(" — JS 접근 차단(XSS 완화)")),
    li(t("Secure", { c: true }), t(" — HTTPS에서만 전송")),
    li(t("SameSite", { c: true }), t(" — CSRF 완화")),
  ]},

  // ───────── CS ─────────
  { title: "정렬 알고리즘 비교", topic: "CS", difficulty: "중", date: "2026-06-17", body: [
    h2("주요 정렬"),
    li(t("버블/삽입/선택 — "), t("O(n^2)", { c: true }), t(", 작은 데이터에만")),
    li(t("병합 정렬 — "), t("O(n log n)", { c: true }), t(", 안정 정렬")),
    li(t("퀵 정렬 — 평균 "), t("O(n log n)", { c: true }), t(", 최악 "), t("O(n^2)", { c: true })),
    li(t("힙 정렬 — "), t("O(n log n)", { c: true }), t(", 제자리")),
    q("대부분 언어의 표준 정렬은 Timsort/Introsort 같은 하이브리드다."),
  ]},
  { title: "이진 탐색 트리(BST)", topic: "CS", difficulty: "중", date: "2026-06-16", body: [
    h2("규칙"),
    p(t("왼쪽 < 부모 < 오른쪽. 중위 순회하면 "), t("정렬된 순서", { b: true }), t("로 나온다.")),
    h2("복잡도"),
    li(t("균형 잡힌 경우 탐색/삽입/삭제 "), t("O(log n)", { c: true })),
    li(t("한쪽으로 치우치면 "), t("O(n)", { c: true }), t(" 으로 퇴화")),
    q("그래서 AVL·레드블랙 트리 같은 자가 균형 트리를 쓴다."),
  ]},
  { title: "동적 계획법(DP) 기초", topic: "CS", difficulty: "상", date: "2026-06-16", body: [
    h2("핵심 아이디어"),
    p(t("큰 문제를 "), t("겹치는 부분 문제", { b: true }), t("로 나누고 결과를 저장(메모이제이션)해 재계산을 피한다.")),
    h2("피보나치 예시"),
    code("const memo = {}\nfunction fib(n) {\n  if (n < 2) return n\n  if (memo[n]) return memo[n]\n  return (memo[n] = fib(n-1) + fib(n-2))\n}", "javascript"),
    q("DP의 두 조건: 최적 부분 구조 + 중복 부분 문제."),
  ]},
  { title: "그래프 탐색: DFS와 BFS", topic: "CS", difficulty: "중", date: "2026-06-15", body: [
    h2("DFS (깊이 우선)"),
    p(t("스택(또는 재귀)으로 한 방향 끝까지 파고든다. 경로·사이클 탐지에 유용.")),
    h2("BFS (너비 우선)"),
    p(t("큐로 가까운 노드부터 탐색. "), t("최단 경로", { b: true }), t("(가중치 동일) 탐색에 적합.")),
    q("미로 최단거리는 BFS, 모든 경우 탐색은 DFS를 먼저 떠올리자."),
  ]},
  { title: "캐시 메모리와 지역성", topic: "CS", difficulty: "상", date: "2026-06-15", body: [
    h2("지역성(Locality)"),
    li(t("시간 지역성 — 최근 쓴 데이터를 곧 다시 쓸 가능성")),
    li(t("공간 지역성 — 인접한 데이터를 곧 쓸 가능성")),
    h2("실무 영향"),
    p(t("배열을 "), t("순차 접근", { b: true }), t("하면 캐시 히트율이 높아 같은 연산도 훨씬 빠르다.")),
  ]},
  { title: "데드락의 4가지 조건", topic: "CS", difficulty: "상", date: "2026-06-14", body: [
    h2("4조건 (모두 충족 시 발생)"),
    nli(t("상호 배제 (Mutual Exclusion)")),
    nli(t("점유와 대기 (Hold and Wait)")),
    nli(t("비선점 (No Preemption)")),
    nli(t("순환 대기 (Circular Wait)")),
    h2("예방"),
    p(t("네 조건 중 "), t("하나만 깨도", { b: true }), t(" 데드락을 막을 수 있다. 흔한 방법은 자원 획득 순서를 고정하는 것.")),
  ]},
  { title: "비트 연산 기초", topic: "CS", difficulty: "중", date: "2026-06-13", body: [
    h2("주요 연산"),
    li(t("AND "), t("&", { c: true }), t(", OR "), t("|", { c: true }), t(", XOR "), t("^", { c: true }), t(", NOT "), t("~", { c: true })),
    li(t("시프트 "), t("<<", { c: true }), t(", "), t(">>", { c: true })),
    h2("유용한 트릭"),
    code("x & 1        // 홀짝 판별\nx << 1       // 2 곱하기\nx & (x - 1)  // 가장 낮은 1비트 제거", "javascript"),
  ]},
  { title: "DNS는 어떻게 동작하나", topic: "CS", difficulty: "하", date: "2026-06-13", body: [
    h2("역할"),
    p(t("도메인 이름을 "), t("IP 주소", { b: true }), t("로 변환하는 인터넷의 전화번호부.")),
    h2("조회 순서"),
    nli(t("브라우저/OS 캐시")),
    nli(t("재귀 리졸버(보통 ISP)")),
    nli(t("루트 → TLD → 권한 네임서버")),
    q("결과는 TTL 동안 캐시되어 다음 조회를 빠르게 한다."),
  ]},

  // ───────── Life ─────────
  { title: "디버깅 전략", topic: "Life", difficulty: "하", date: "2026-06-17", body: [
    h2("체계적으로"),
    nli(t("재현 가능한 최소 케이스 만들기")),
    nli(t("가설 세우고 하나씩 검증")),
    nli(t("이분 탐색으로 문제 범위 좁히기")),
    nli(t("로그·디버거로 실제 값 확인")),
    q("\"고쳤다\"가 아니라 \"왜 고쳐졌는지\"를 이해할 때까지 본다."),
  ]},
  { title: "페어 프로그래밍 잘하기", topic: "Life", difficulty: "하", date: "2026-06-16", body: [
    h2("역할"),
    li(t("드라이버 — 키보드를 잡고 코드 작성")),
    li(t("내비게이터 — 방향·리뷰·다음 단계 고민")),
    h2("팁"),
    p(t("역할을 "), t("자주 교대", { b: true }), t("하고, 침묵보다 생각을 소리내어 공유한다.")),
  ]},
  { title: "회고(Retrospective) 잘하기", topic: "Life", difficulty: "하", date: "2026-06-16", body: [
    h2("기본 틀"),
    li(t("좋았던 점 (Keep)")),
    li(t("아쉬웠던 점 (Problem)")),
    li(t("시도할 것 (Try)")),
    q("사람을 탓하지 않고 시스템을 개선하는 자리로 만든다."),
  ]},
  { title: "일정 추정이 어려운 이유", topic: "Life", difficulty: "중", date: "2026-06-15", body: [
    h2("계획 오류"),
    p(t("우리는 "), t("낙관적으로", { b: true }), t(" 추정하는 경향이 있다(planning fallacy).")),
    h2("대처"),
    li(t("작업을 작게 쪼개 추정")),
    li(t("불확실성엔 범위로 답하기 (예: 3~5일)")),
    li(t("버퍼를 명시적으로 두기")),
  ]},
  { title: "효과적인 학습 로드맵 짜기", topic: "Life", difficulty: "하", date: "2026-06-14", body: [
    h2("원칙"),
    li(t("목표를 "), t("측정 가능", { b: true }), t("하게")),
    li(t("작은 프로젝트로 바로 적용")),
    li(t("기초(CS·언어)와 트렌드의 균형")),
    q("튜토리얼 지옥에서 벗어나는 법: 직접 만들어 보기."),
  ]},
]

async function getExistingTitles() {
  const titles = new Set()
  let cursor
  do {
    const r = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    })
    for (const pg of r.results) {
      const tt = pg.properties?.Title?.title?.map((x) => x.plain_text).join("") ?? ""
      if (tt) titles.add(tt)
    }
    cursor = r.has_more ? r.next_cursor : undefined
  } while (cursor)
  return titles
}

async function main() {
  const existing = await getExistingTitles()
  console.log(`기존 문서 ${existing.size}건. 신규 후보 ${docs.length}건 처리...\n`)
  let ok = 0,
    skip = 0
  for (const doc of docs) {
    if (existing.has(doc.title)) {
      console.log(`⏭️  이미 존재: ${doc.title}`)
      skip++
      continue
    }
    try {
      await notion.pages.create({
        parent: { type: "data_source_id", data_source_id: dataSourceId },
        properties: {
          Title: { title: [t(doc.title)] },
          Topic: { select: { name: doc.topic } },
          Difficulty: { select: { name: doc.difficulty } },
          Status: { select: { name: "발행됨" } },
          LastUpdated: { date: { start: doc.date } },
        },
        children: doc.body,
      })
      ok++
      console.log(`✅ [${doc.topic}/${doc.difficulty}] ${doc.title}`)
    } catch (e) {
      console.error(`❌ ${doc.title}:`, e.body ?? e.message ?? e)
    }
    await new Promise((r) => setTimeout(r, 350))
  }
  console.log(`\n완료: 생성 ${ok}건 / 건너뜀 ${skip}건`)
}

main()
