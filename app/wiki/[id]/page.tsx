import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BookOpen, Calendar } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { WikiSidebar } from "@/components/wiki/WikiSidebar"
import { NotionRenderer } from "@/components/wiki/NotionRenderer"
import { getPublishedPages, getPageById, groupByTopic } from "@/lib/notion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface WikiDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: WikiDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const { page } = await getPageById(id)

  if (!page) {
    return { title: "문서를 찾을 수 없음" }
  }

  const description = `${page.topic} · 난이도 ${page.difficulty ?? "-"} · ${page.title}`

  return {
    title: page.title,
    description,
    openGraph: {
      type: "article",
      title: page.title,
      description,
      url: `/wiki/${id}`,
      ...(page.lastUpdated ? { modifiedTime: page.lastUpdated } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description,
    },
  }
}

const DIFFICULTY_COLORS: Record<string, string> = {
  상: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  중: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  하: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
}

export default async function WikiDetailPage({
  params,
}: WikiDetailPageProps) {
  const { id } = await params

  const [{ page, blocks }, allPages] = await Promise.all([
    getPageById(id),
    getPublishedPages(),
  ])

  if (!page) {
    notFound()
  }

  const topicMap = groupByTopic(allPages)
  const topics = Array.from(topicMap.entries()).map(([topic, items]) => ({
    topic,
    count: items.length,
  }))

  // 목차: heading_2, heading_3 블록 추출
  const toc = blocks.filter(
    (b) => b.type === "heading_2" || b.type === "heading_3"
  )

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon-sm" aria-label="위키 목록으로">
            <Link href="/wiki">
              <ArrowLeft />
            </Link>
          </Button>
          <BookOpen className="size-4" />
          <span className="text-base font-semibold">위키</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 px-4 py-8 md:gap-6 lg:px-8">
        {/* 좌측 토픽 사이드바 */}
        <aside className="hidden w-44 shrink-0 md:block lg:w-52">
          <WikiSidebar
            topics={topics}
            currentTopic={page.topic}
            currentPageId={page.id}
            className="sticky top-8"
          />
        </aside>

        {/* 본문 */}
        <main className="min-w-0 flex-1">
          {/* 메타 헤더 */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{page.topic}</Badge>
              {page.difficulty && (
                <Badge
                  variant="outline"
                  className={DIFFICULTY_COLORS[page.difficulty]}
                >
                  난이도 {page.difficulty}
                </Badge>
              )}
              {page.lastUpdated && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {new Date(page.lastUpdated).toLocaleDateString("ko-KR")}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {page.title}
            </h1>
          </div>

          <Separator className="mb-8" />

          <NotionRenderer blocks={blocks} />
        </main>

        {/* 우측 목차 */}
        {toc.length > 0 && (
          <aside className="hidden w-44 shrink-0 lg:block lg:w-52">
            <nav
              className="sticky top-8 space-y-1"
              aria-label="목차"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                목차
              </p>
              {toc.map((block) => (
                <a
                  key={block.id}
                  href={`#h-${block.id}`}
                  className={`block text-sm text-muted-foreground transition-colors hover:text-foreground ${
                    block.type === "heading_3" ? "pl-3" : ""
                  }`}
                >
                  {block.content}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </div>
  )
}
