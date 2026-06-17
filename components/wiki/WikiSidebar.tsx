import Link from "next/link"
import { BookOpen } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TopicItem {
  topic: string
  count: number
}

interface WikiSidebarProps {
  topics: TopicItem[]
  currentTopic?: string
  currentPageId?: string
  className?: string
}

export function WikiSidebar({
  topics,
  currentTopic,
  currentPageId,
  className,
}: WikiSidebarProps) {
  return (
    <nav
      data-slot="wiki-sidebar"
      className={cn("flex flex-col gap-1", className)}
      aria-label="토픽 탐색"
    >
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="size-4" />
        <span className="text-sm font-semibold">토픽</span>
      </div>

      <Link
        href="/wiki"
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
          !currentTopic
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <span>전체</span>
        <Badge variant="secondary" className="text-xs">
          {topics.reduce((acc, t) => acc + t.count, 0)}
        </Badge>
      </Link>

      {topics.map(({ topic, count }) => (
        <Link
          key={topic}
          href={`/wiki?topic=${encodeURIComponent(topic)}`}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
            currentTopic === topic && !currentPageId
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <span>{topic}</span>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </Link>
      ))}
    </nav>
  )
}
