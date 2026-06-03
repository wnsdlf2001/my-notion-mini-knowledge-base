import Link from "next/link";
import { Rocket, Palette, ShieldCheck, Workflow } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { DemoActions } from "@/components/demo/demo-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const stack = [
  {
    icon: Rocket,
    title: "Next.js 16",
    description: "App Router · React 19 · Turbopack",
  },
  {
    icon: ShieldCheck,
    title: "TypeScript 5",
    description: "엄격한 타입 안정성 (strict)",
  },
  {
    icon: Palette,
    title: "Tailwind CSS v4 + shadcn/ui",
    description: "radix-nova 스타일 · neutral 베이스",
  },
  {
    icon: Workflow,
    title: "React Query + RHF + Zod",
    description: "서버 상태 + 타입 안전 폼",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Rocket className="size-5" />
          <span className="text-base font-semibold">Starter Kit</span>
          <Badge variant="secondary">v0.1</Badge>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            모던 웹 스타터킷
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Next.js 16 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui ·
            lucide-react 기반의 빠른 개발 환경입니다. 다크모드, 폼 처리, 서버
            상태 관리가 기본 포함되어 있습니다.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="grid gap-4 sm:grid-cols-2">
          {stack.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="size-5" />
                  <CardTitle>{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <Separator className="my-8" />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">데모</h2>
          <p className="text-muted-foreground text-sm">
            Sonner 토스트 · shadcn Dialog · React Query 동작을 확인하세요.
          </p>
          <Card>
            <CardContent className="pt-6">
              <DemoActions />
            </CardContent>
            <CardFooter>
              <Button asChild variant="link" size="sm">
                <Link href="/examples">전체 예시 보기 →</Link>
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        Built with Next.js 16 · shadcn/ui · lucide-react
      </footer>
    </div>
  );
}
