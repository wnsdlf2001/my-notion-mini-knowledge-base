import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { WikiSidebar } from "@/components/wiki/WikiSidebar"
import { WikiListClient } from "@/components/wiki/WikiListClient"
import { getPublishedPages, getPageContents, groupByTopic } from "@/lib/notion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "위키",
  description: "토픽별로 정리된 기술 문서 목록",
}

interface WikiPageProps {
  searchParams: Promise<{ topic?: string; q?: string }>
}

export default async function WikiPage({ searchParams }: WikiPageProps) {
  const { topic: selectedTopic = "", q: searchQuery = "" } =
    await searchParams

  const [pages, contents] = await Promise.all([
    getPublishedPages(),
    getPageContents(),
  ])
  const topicMap = groupByTopic(pages)
  const topics = Array.from(topicMap.entries()).map(([topic, items]) => ({
    topic,
    count: items.length,
  }))

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon-sm" aria-label="홈으로">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <BookOpen className="size-4" />
          <span className="text-base font-semibold">위키</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-0 px-6 py-8 md:gap-8">
        {/* 좌측 사이드바 */}
        <aside className="hidden w-48 shrink-0 md:block lg:w-56">
          <WikiSidebar
            topics={topics}
            currentTopic={selectedTopic}
            className="sticky top-8"
          />
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex flex-1 flex-col gap-6 overflow-hidden">
          {/* 필터 탭 (모바일) */}
          <div className="flex flex-wrap gap-2 md:hidden">
            <Link href="/wiki">
              <Badge
                variant={!selectedTopic ? "default" : "outline"}
                className="cursor-pointer"
              >
                전체
              </Badge>
            </Link>
            {topics.map(({ topic }) => (
              <Link
                key={topic}
                href={`/wiki?topic=${encodeURIComponent(topic)}`}
              >
                <Badge
                  variant={selectedTopic === topic ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {topic}
                </Badge>
              </Link>
            ))}
          </div>

          {/* 검색 + 아코디언 (클라이언트) */}
          <WikiListClient
            pages={pages}
            contents={contents}
            initialQuery={searchQuery}
            selectedTopic={selectedTopic}
          />
        </main>
      </div>
    </div>
  )
}
