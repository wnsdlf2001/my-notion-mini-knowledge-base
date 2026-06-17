"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { WikiSidebar } from "@/components/wiki/WikiSidebar"

interface TopicItem {
  topic: string
  count: number
}

interface WikiMobileNavProps {
  topics: TopicItem[]
  currentTopic?: string
  currentPageId?: string
}

/**
 * 모바일 전용 햄버거 드로어. 데스크탑(md 이상)에서는 숨기고
 * 좌측 sticky 사이드바를 그대로 사용한다.
 */
export function WikiMobileNav({
  topics,
  currentTopic,
  currentPageId,
}: WikiMobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 토픽 링크 클릭으로 라우트가 바뀌면 드로어를 닫는다.
  // effect 대신 렌더 중 변화를 감지하는 React 권장 패턴 사용.
  const navKey = `${pathname}?${searchParams.toString()}`
  const [prevNavKey, setPrevNavKey] = React.useState(navKey)
  if (navKey !== prevNavKey) {
    setPrevNavKey(navKey)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="토픽 메뉴 열기"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader className="sr-only">
          <SheetTitle>토픽 탐색</SheetTitle>
        </SheetHeader>
        <div className="px-4 py-2">
          <WikiSidebar
            topics={topics}
            currentTopic={currentTopic}
            currentPageId={currentPageId}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
