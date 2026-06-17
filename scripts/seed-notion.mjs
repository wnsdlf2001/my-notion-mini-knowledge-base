// Notion DB 시드 스크립트: 발행됨 위키 문서를 일괄 생성한다.
// 사용법: npm run notion:seed
// 주의: 실행할 때마다 새 페이지를 추가한다(중복 생성 주의).

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

// ── 블록 빌더 ──
const rt = (s) => [{ type: "text", text: { content: s } }]
const h2 = (s) => ({ type: "heading_2", heading_2: { rich_text: rt(s) } })
const p = (s) => ({ type: "paragraph", paragraph: { rich_text: rt(s) } })
const li = (s) => ({ type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(s) } })
const q = (s) => ({ type: "quote", quote: { rich_text: rt(s) } })
const code = (s, lang = "javascript") => ({ type: "code", code: { rich_text: rt(s), language: lang } })

// ── 문서 데이터 ──
const docs = [
  // Frontend
  { title: "CSR과 SSR의 차이", topic: "Frontend", difficulty: "중", date: "2026-06-16", body: [
    h2("CSR (Client-Side Rendering)"),
    p("브라우저가 빈 HTML을 받고 JavaScript로 화면을 그린다. 초기 로딩은 느리지만 이후 상호작용이 부드럽다."),
    h2("SSR (Server-Side Rendering)"),
    p("서버가 완성된 HTML을 내려준다. 초기 화면이 빠르고 SEO에 유리하다."),
    h2("선택 기준"),
    li("SEO·초기 로딩 중요 → SSR"),
    li("로그인 후 대시보드 같은 앱 → CSR"),
    q("Next.js는 둘을 페이지 단위로 섞어 쓸 수 있다."),
  ]},
  { title: "클로저(Closure)란?", topic: "Frontend", difficulty: "상", date: "2026-06-15", body: [
    h2("정의"),
    p("함수가 선언될 때의 렉시컬 환경을 기억하여, 함수 바깥의 변수에 계속 접근할 수 있는 현상이다."),
    h2("예시"),
    code("function counter() {\n  let count = 0\n  return () => ++count\n}\nconst next = counter()\nnext() // 1\nnext() // 2"),
    h2("활용"),
    li("상태 은닉(private 변수)"),
    li("이벤트 핸들러/콜백에서 값 캡처"),
  ]},
  { title: "이벤트 루프와 비동기 처리", topic: "Frontend", difficulty: "상", date: "2026-06-14", body: [
    h2("싱글 스레드"),
    p("JavaScript는 한 번에 하나의 작업만 처리하지만, 이벤트 루프 덕분에 비동기 동작이 가능하다."),
    h2("태스크 큐"),
    li("매크로태스크: setTimeout, I/O"),
    li("마이크로태스크: Promise.then (우선순위 높음)"),
    q("마이크로태스크 큐가 비워진 뒤에야 다음 매크로태스크가 실행된다."),
  ]},
  { title: "Virtual DOM은 왜 쓰는가", topic: "Frontend", difficulty: "중", date: "2026-06-13", body: [
    h2("개념"),
    p("실제 DOM을 추상화한 가벼운 객체 트리. 변경 전후를 비교(diff)해 바뀐 부분만 실제 DOM에 반영한다."),
    h2("이점"),
    li("직접 DOM 조작 최소화"),
    li("선언적 UI 작성 가능"),
    h2("오해"),
    p("Virtual DOM이 항상 더 빠른 것은 아니다. 잦은 직접 조작을 줄여 예측 가능하게 만드는 것이 핵심이다."),
  ]},
  { title: "CSS Flexbox와 Grid 선택 기준", topic: "Frontend", difficulty: "하", date: "2026-06-12", body: [
    h2("Flexbox"),
    p("1차원(가로 또는 세로) 정렬에 적합하다. 내비게이션 바, 버튼 그룹 등."),
    h2("Grid"),
    p("2차원(행과 열) 레이아웃에 적합하다. 카드 그리드, 페이지 전체 레이아웃 등."),
    q("한 줄 정렬은 Flex, 격자 배치는 Grid를 먼저 떠올리자."),
  ]},
  { title: "브라우저 렌더링 과정", topic: "Frontend", difficulty: "상", date: "2026-06-11", body: [
    h2("Critical Rendering Path"),
    li("HTML 파싱 → DOM 트리"),
    li("CSS 파싱 → CSSOM 트리"),
    li("DOM + CSSOM → Render 트리"),
    li("Layout(위치 계산) → Paint(그리기)"),
    h2("리플로우/리페인트"),
    p("레이아웃에 영향을 주는 변경은 리플로우를 유발하므로 비용이 크다. transform/opacity는 합성만 일으켜 저렴하다."),
  ]},

  // Backend
  { title: "HTTP 상태 코드 정리", topic: "Backend", difficulty: "하", date: "2026-06-16", body: [
    h2("분류"),
    li("2xx 성공: 200 OK, 201 Created, 204 No Content"),
    li("3xx 리다이렉트: 301 Moved, 304 Not Modified"),
    li("4xx 클라이언트 오류: 400, 401, 403, 404, 429"),
    li("5xx 서버 오류: 500, 502, 503"),
    q("401은 인증 실패, 403은 인증됐지만 권한 없음."),
  ]},
  { title: "데이터베이스 인덱스의 원리", topic: "Backend", difficulty: "중", date: "2026-06-15", body: [
    h2("인덱스란"),
    p("테이블의 특정 컬럼을 정렬된 자료구조(주로 B-Tree)로 따로 보관해 조회 속도를 높인다."),
    h2("트레이드오프"),
    li("조회(SELECT)는 빨라진다"),
    li("쓰기(INSERT/UPDATE/DELETE)는 인덱스 갱신 비용으로 느려진다"),
    q("모든 컬럼에 인덱스를 거는 것은 오히려 독이 된다."),
  ]},
  { title: "JWT 인증 흐름", topic: "Backend", difficulty: "중", date: "2026-06-14", body: [
    h2("구성"),
    p("Header.Payload.Signature 세 부분이 점으로 연결된 토큰이다."),
    h2("흐름"),
    li("로그인 성공 시 서버가 토큰 발급"),
    li("클라이언트가 요청마다 Authorization 헤더로 전송"),
    li("서버는 서명을 검증해 신원 확인 (세션 저장 불필요)"),
    q("Payload는 누구나 디코딩 가능하므로 민감 정보를 넣지 않는다."),
  ]},
  { title: "트랜잭션과 ACID", topic: "Backend", difficulty: "중", date: "2026-06-13", body: [
    h2("ACID"),
    li("Atomicity(원자성): 전부 성공 또는 전부 실패"),
    li("Consistency(일관성): 제약 조건 유지"),
    li("Isolation(격리성): 동시 트랜잭션 간섭 방지"),
    li("Durability(지속성): 커밋된 결과는 영구 보존"),
    h2("예시"),
    p("계좌 이체에서 출금과 입금은 하나의 트랜잭션으로 묶여야 한다."),
  ]},
  { title: "캐싱 전략 비교", topic: "Backend", difficulty: "상", date: "2026-06-12", body: [
    h2("Cache-Aside"),
    p("애플리케이션이 캐시를 먼저 조회하고, 없으면 DB에서 읽어 캐시에 채운다. 가장 흔한 패턴."),
    h2("Write-Through"),
    p("쓰기 시 캐시와 DB를 동시에 갱신한다. 데이터 정합성이 높지만 쓰기 지연이 늘 수 있다."),
    q("캐시 무효화(invalidation)는 컴퓨터 과학의 어려운 문제 중 하나다."),
  ]},

  // CS
  { title: "빅오 표기법 (시간 복잡도)", topic: "CS", difficulty: "중", date: "2026-06-16", body: [
    h2("의미"),
    p("입력 크기 n이 커질 때 연산 횟수가 어떻게 증가하는지를 나타내는 상한 표기법이다."),
    h2("자주 보는 복잡도"),
    li("O(1) 상수: 배열 인덱스 접근"),
    li("O(log n): 이진 탐색"),
    li("O(n): 선형 순회"),
    li("O(n log n): 효율적 정렬"),
    li("O(n^2): 이중 반복문"),
  ]},
  { title: "스택과 큐", topic: "CS", difficulty: "하", date: "2026-06-15", body: [
    h2("스택 (Stack)"),
    p("LIFO(후입선출). 함수 호출, 실행 취소(undo) 등에 쓰인다."),
    h2("큐 (Queue)"),
    p("FIFO(선입선출). 작업 대기열, BFS 탐색 등에 쓰인다."),
    q("브라우저 뒤로가기는 스택, 프린터 출력 대기는 큐를 떠올리면 쉽다."),
  ]},
  { title: "TCP와 UDP의 차이", topic: "CS", difficulty: "중", date: "2026-06-14", body: [
    h2("TCP"),
    li("연결 지향, 3-way handshake"),
    li("순서 보장·재전송으로 신뢰성 높음"),
    h2("UDP"),
    li("비연결, 헤더가 가벼움"),
    li("빠르지만 손실·순서 보장 없음"),
    h2("용도"),
    p("웹/파일 전송은 TCP, 실시간 스트리밍·게임은 UDP가 적합하다."),
  ]},
  { title: "해시 테이블 동작 원리", topic: "CS", difficulty: "상", date: "2026-06-13", body: [
    h2("핵심"),
    p("키를 해시 함수로 인덱스로 변환해 평균 O(1) 조회를 가능하게 한다."),
    h2("충돌 해결"),
    li("체이닝: 같은 버킷에 연결 리스트로 저장"),
    li("개방 주소법: 다른 빈 버킷을 탐사"),
    q("해시 함수가 고르게 분포할수록 충돌이 줄어 성능이 좋아진다."),
  ]},
  { title: "컨텍스트 스위칭이란", topic: "CS", difficulty: "중", date: "2026-06-12", body: [
    h2("정의"),
    p("CPU가 실행 중인 프로세스/스레드를 바꿀 때 현재 상태를 저장하고 다음 상태를 복원하는 과정이다."),
    h2("비용"),
    p("레지스터·캐시 갱신 등으로 오버헤드가 발생한다. 스레드 수가 많다고 항상 빠른 것은 아니다."),
  ]},

  // Life
  { title: "개발자 번아웃 예방", topic: "Life", difficulty: "하", date: "2026-06-16", body: [
    h2("신호"),
    li("일에 대한 흥미 상실"),
    li("만성 피로와 집중력 저하"),
    h2("대처"),
    p("작업을 작게 쪼개 성취감을 자주 느끼고, 의식적으로 쉬는 시간을 일정에 넣는다."),
    q("지속 가능한 페이스가 단기 스퍼트보다 멀리 간다."),
  ]},
  { title: "좋은 커밋 메시지 작성법", topic: "Life", difficulty: "하", date: "2026-06-15", body: [
    h2("규칙"),
    li("제목은 50자 이내, 명령형으로"),
    li("'무엇을'보다 '왜'를 본문에 설명"),
    li("Conventional Commits: feat/fix/docs/refactor"),
    h2("예시"),
    code("feat: 위키 검색에 debounce 적용\n\n입력마다 필터링되어 렉이 발생하던 문제 해결", "plain text"),
  ]},
  { title: "효율적인 코드 리뷰 문화", topic: "Life", difficulty: "중", date: "2026-06-14", body: [
    h2("리뷰어"),
    li("사람이 아니라 코드를 비평한다"),
    li("의견에는 이유와 대안을 함께 제시"),
    h2("작성자"),
    p("PR을 작게 유지하고, 변경 의도를 설명으로 남기면 리뷰가 빨라진다."),
    q("작은 PR이 좋은 리뷰의 가장 큰 비결이다."),
  ]},
  { title: "기술 부채 관리", topic: "Life", difficulty: "중", date: "2026-06-13", body: [
    h2("기술 부채란"),
    p("당장의 속도를 위해 미룬 개선 작업. 이자처럼 시간이 지날수록 유지보수 비용이 늘어난다."),
    h2("관리 방법"),
    li("부채를 문서로 가시화(이슈/주석 TODO)"),
    li("리팩터링을 일정에 정기적으로 배정"),
    q("모든 부채가 나쁜 것은 아니다. 의식적으로 진 부채는 전략이 된다."),
  ]},
]

async function main() {
  console.log(`총 ${docs.length}개 문서 생성 시작...\n`)
  let ok = 0
  for (const doc of docs) {
    try {
      await notion.pages.create({
        parent: { type: "data_source_id", data_source_id: dataSourceId },
        properties: {
          Title: { title: rt(doc.title) },
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
    await new Promise((r) => setTimeout(r, 350)) // rate limit 완화
  }
  console.log(`\n완료: ${ok}/${docs.length}건 생성`)
}

main()
