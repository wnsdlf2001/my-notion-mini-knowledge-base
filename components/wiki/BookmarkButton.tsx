"use client"

import { Bookmark } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useBookmarks } from "@/lib/bookmarks"

interface BookmarkButtonProps {
  pageId: string
  className?: string
}

export function BookmarkButton({ pageId, className }: BookmarkButtonProps) {
  const { isBookmarked, toggle } = useBookmarks()
  const active = isBookmarked(pageId)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-pressed={active}
      aria-label={active ? "북마크 해제" : "북마크 추가"}
      onClick={(e) => {
        // 아코디언 트리거 등 상위 클릭 핸들러로의 전파 방지
        e.preventDefault()
        e.stopPropagation()
        toggle(pageId)
        toast(active ? "북마크에서 제거했습니다" : "북마크에 추가했습니다")
      }}
      className={className}
    >
      <Bookmark className={cn("size-4", active && "fill-current")} />
    </Button>
  )
}
