@AGENTS.md

# 프로젝트 컨벤션 (Next.js 16 스타터킷)

## 응답 언어
한국어. 코드 식별자/주석을 제외한 모든 사용자 응답은 한국어로 작성.

## 디렉토리 구조

| 경로 | 용도 |
| --- | --- |
| `app/` | App Router 라우트. 페이지/레이아웃은 가급적 Server Component 유지 |
| `components/ui/` | shadcn 컴포넌트 (radix-nova 스타일, neutral 베이스). CLI로 추가 |
| `components/providers/` | 전역 클라이언트 프로바이더 (ThemeProvider, QueryProvider 등) |
| `components/demo/` | 메인 페이지(`/`)의 동작 확인용 데모 |
| `components/examples/` | `/examples` 페이지의 카테고리별 사용 예시 |
| `components/theme-toggle.tsx` | 다크모드 토글 (Header에서 재사용) |
| `lib/utils.ts` | `cn()` 헬퍼. 모든 className 합성에 사용 |

## 작성 규칙

### 컴포넌트
- shadcn 신규 추가는 `npx shadcn@latest add <name>` (radix-nova 스타일에 없으면 `components/ui/form.tsx` 패턴 참고해서 수동 작성)
- radix 임포트는 통합 패키지 `radix-ui` 사용: `import { Dialog as DialogPrimitive } from "radix-ui"`
- 모든 shadcn 컴포넌트는 `data-slot` 속성을 부여하고 `cn(...)`로 클래스 합성
- 클라이언트 전용 코드는 `"use client"` 명시 후 `components/examples/` 또는 `components/demo/`에 분리. 페이지 자체는 Server Component 유지

### 폼
- `react-hook-form` + `zod` + `@hookform/resolvers/zod`
- shadcn 표준 패턴: `Form/FormField/FormItem/FormLabel/FormControl/FormDescription/FormMessage` (`@/components/ui/form`)
- zod 에러 메시지는 한국어

### 서버 상태
- `@tanstack/react-query` 사용. `QueryProvider`는 [app/layout.tsx](app/layout.tsx)에서 이미 wrap됨
- 새 쿼리는 `queryKey`를 const 배열로 분리해서 타입 추론·재사용
- 개발 모드에서 React Query Devtools가 좌하단에 표시됨

### 테마/UI
- 다크모드: `next-themes` (`attribute="class"`, `defaultTheme="system"`). `<html>`에 `suppressHydrationWarning` 필수
- 토스트: `sonner` (`import { toast } from "sonner"`). `Toaster`는 layout에 이미 마운트됨
- 툴팁: `TooltipProvider`는 layout에서 전역 wrap (`delayDuration={200}`). 컴포넌트 단위 Provider 추가 금지
- 아이콘: `lucide-react` v1.x. named import (`import { Sun, Moon } from "lucide-react"`)

### Next.js 16
- AGENTS.md 지침대로, 학습 데이터의 Next.js와 다를 수 있음 — 코드 작성 전 `node_modules/next/dist/docs/01-app/` 우선 참조
- `params`/`searchParams`는 Promise (v15+). `async/await` 또는 `React.use()`로 접근
- `layout.tsx`의 `<html>` 태그는 항상 `suppressHydrationWarning` 유지 (next-themes 호환)

## 검증 명령

작업 완료 전 다음 4종을 모두 통과시킬 것:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run dev   # 브라우저로 영향 받은 라우트 동작 확인
```

## 커밋 컨벤션
Conventional Commits + 한국어 본문. 예: `feat: /examples 라우트 추가`, `fix: 다크모드 토글 hydration 경고 제거`.
