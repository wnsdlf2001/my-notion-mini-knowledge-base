"use client"

import * as React from "react"
import Link from "next/link"
import { FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { NotionRenderer } from "@/components/wiki/NotionRenderer"
import { BookmarkButton } from "@/components/wiki/BookmarkButton"
import { useBookmarks } from "@/lib/bookmarks"
import type { WikiPage, WikiPageContent } from "@/lib/notion"

interface WikiAccordionProps {
  pages: WikiPage[]
  contents?: Record<string, WikiPageContent>
  searchQuery?: string
  selectedTopic?: string
  bookmarkedOnly?: boolean
  className?: string
}

const DIFFICULTY_COLORS: Record<string, string> = {
  상: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  중: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  하: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
}

function EmptyState({
  query,
  bookmarkedOnly,
}: {
  query?: string
  bookmarkedOnly?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <FileText className="text-muted-foreground size-10" />
      <p className="text-muted-foreground text-sm">
        {bookmarkedOnly
          ? "북마크한 문서가 없습니다."
          : query
            ? `"${query}"에 해당하는 문서를 찾을 수 없습니다.`
            : "표시할 문서가 없습니다."}
      </p>
    </div>
  )
}

export function WikiAccordion({
  pages,
  contents = {},
  searchQuery = "",
  selectedTopic = "",
  bookmarkedOnly = false,
  className,
}: WikiAccordionProps) {
  const { bookmarks } = useBookmarks()

  // 클라이언트 사이드 필터링 (북마크 + 토픽 + 제목/본문 텍스트)
  const filtered = React.useMemo(() => {
    let result = pages

    if (bookmarkedOnly) {
      const set = new Set(bookmarks)
      result = result.filter((p) => set.has(p.id))
    }

    if (selectedTopic && selectedTopic !== "전체") {
      result = result.filter((p) => p.topic === selectedTopic)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((p) => {
        if (p.title.toLowerCase().includes(q)) return true
        const body = contents[p.id]?.searchText
        return body ? body.toLowerCase().includes(q) : false
      })
    }

    return result
  }, [pages, contents, searchQuery, selectedTopic, bookmarkedOnly, bookmarks])

  // 토픽별 그룹화
  const grouped = React.useMemo(() => {
    const map = new Map<string, WikiPage[]>()
    for (const page of filtered) {
      const topic = page.topic || "기타"
      map.set(topic, [...(map.get(topic) ?? []), page])
    }
    return map
  }, [filtered])

  if (filtered.length === 0) {
    return <EmptyState query={searchQuery} bookmarkedOnly={bookmarkedOnly} />
  }

  return (
    <div
      data-slot="wiki-accordion"
      className={cn("space-y-6", className)}
    >
      {Array.from(grouped.entries()).map(([topic, topicPages]) => (
        <section key={topic}>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            {topic}
            <Badge variant="secondary" className="text-xs">
              {topicPages.length}
            </Badge>
          </h2>
          <Accordion type="multiple">
            {topicPages.map((page) => (
              <AccordionItem key={page.id} value={page.id}>
                <AccordionTrigger className="gap-3">
                  <span className="flex-1 text-left">{page.title}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {page.difficulty && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          DIFFICULTY_COLORS[page.difficulty]
                        )}
                      >
                        {page.difficulty}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {page.topic}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3">
                    {page.lastUpdated && (
                      <p className="text-muted-foreground text-xs">
                        최종 수정:{" "}
                        {new Date(page.lastUpdated).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                    {contents[page.id]?.preview?.length ? (
                      <div className="border-border/60 border-l-2 pl-3 opacity-90">
                        <NotionRenderer
                          blocks={contents[page.id].preview}
                          className="text-sm"
                        />
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/wiki/${page.id}`}
                        className="text-primary text-sm underline underline-offset-4 hover:opacity-80"
                      >
                        전체 내용 보기 →
                      </Link>
                      <BookmarkButton pageId={page.id} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
    </div>
  )
}
