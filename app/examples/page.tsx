import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Layers,
  LayoutPanelTop,
  ListChecks,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { FormsExample } from "@/components/examples/forms-example";
import { OverlaysExample } from "@/components/examples/overlays-example";
import { DisplayExample } from "@/components/examples/display-example";
import { DataFetchingExample } from "@/components/examples/data-fetching-example";

const sections = [
  {
    id: "forms",
    icon: ListChecks,
    title: "폼 (react-hook-form + zod)",
    description:
      "타입 안전한 폼 처리. shadcn Form 컴포넌트와 zodResolver 조합 예시.",
    component: <FormsExample />,
  },
  {
    id: "overlays",
    icon: LayoutPanelTop,
    title: "오버레이 (Dialog · Sheet · Dropdown · Tooltip)",
    description:
      "사용자 액션에 따라 떠오르는 UI. 트리거 → 콘텐츠 → 닫기 흐름.",
    component: <OverlaysExample />,
  },
  {
    id: "display",
    icon: Layers,
    title: "디스플레이 (Card · Badge · Avatar · Separator · Skeleton)",
    description:
      "정보 표시용 정적 컴포넌트들. 로딩 상태 placeholder까지 함께 활용.",
    component: <DisplayExample />,
  },
  {
    id: "data",
    icon: Database,
    title: "데이터 패칭 (React Query)",
    description:
      "useQuery 상태 분기 · refetch · invalidateQueries · useMutation 패턴.",
    component: <DataFetchingExample />,
  },
];

export default function ExamplesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon-sm" aria-label="홈으로">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <span className="text-base font-semibold">예시</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            컴포넌트 사용 예시
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            설치된 shadcn 컴포넌트와 React Query · react-hook-form · zod의 실
            사용 패턴입니다. 각 섹션의 코드는{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              components/examples/*.tsx
            </code>
            에 위치합니다.
          </p>
          <nav className="flex flex-wrap gap-2 pt-2">
            {sections.map(({ id, title }) => (
              <Button key={id} asChild variant="outline" size="sm">
                <a href={`#${id}`}>{title.split(" (")[0]}</a>
              </Button>
            ))}
          </nav>
        </section>

        <div className="mt-10 grid gap-8">
          {sections.map(({ id, icon: Icon, title, description, component }) => (
            <section key={id} id={id} className="scroll-mt-20">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="size-5" />
                    <CardTitle>{title}</CardTitle>
                  </div>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>{component}</CardContent>
              </Card>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        components/examples/*.tsx 의 코드를 복사해서 시작하세요
      </footer>
    </div>
  );
}
