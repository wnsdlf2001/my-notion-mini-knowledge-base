"use client"

import * as React from "react"
import Link from "next/link"

import { SearchBar } from "@/components/wiki/SearchBar"
import { WikiAccordion } from "@/components/wiki/WikiAccordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WikiPage } from "@/lib/notion"

interface WikiListClientProps {
  pages: WikiPage[]
  initialQuery: string
  selectedTopic: string
}

export function WikiListClient({
  pages,
  initialQuery,
  selectedTopic,
}: WikiListClientProps) {
  const [searchQuery, setSearchQuery] = React.useState(initialQuery)

  // URL searchParams 동기화: 검색어/토픽 변경 시 주소를 갱신해
  // 새로고침·공유·뒤로가기(상세→목록) 시 필터 상태가 유지되도록 한다.
  // history.replaceState를 사용해 서버 컴포넌트 재요청(Notion 호출) 없이 URL만 갱신한다.
  React.useEffect(() => {
    const params = new URLSearchParams()
    if (selectedTopic) params.set("topic", selectedTopic)
    if (searchQuery) params.set("q", searchQuery)
    const qs = params.toString()
    window.history.replaceState(null, "", qs ? `/wiki?${qs}` : "/wiki")
  }, [searchQuery, selectedTopic])

  const resetHref = selectedTopic
    ? `/wiki?topic=${encodeURIComponent(selectedTopic)}`
    : "/wiki"

  return (
    <div className={cn("flex flex-col gap-6")}>
      <div className="flex items-center gap-2">
        <SearchBar
          initialValue={initialQuery}
          placeholder="제목으로 필터링..."
          navigateOnSearch={false}
          onSearch={setSearchQuery}
          className="max-w-md"
        />
        {(searchQuery || selectedTopic) && (
          <Button asChild variant="ghost" size="sm">
            <Link href={resetHref} onClick={() => setSearchQuery("")}>
              초기화
            </Link>
          </Button>
        )}
      </div>

      <WikiAccordion
        pages={pages}
        searchQuery={searchQuery}
        selectedTopic={selectedTopic}
      />
    </div>
  )
}
