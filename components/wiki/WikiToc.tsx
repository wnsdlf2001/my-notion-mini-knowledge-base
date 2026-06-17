"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { WikiBlock } from "@/lib/notion"

interface WikiTocProps {
  items: WikiBlock[]
  className?: string
}

/**
 * 우측 목차 + 스크롤 스파이. 현재 화면에 보이는 heading을 추적해 활성 항목을 강조한다.
 * heading 요소의 id(`h-{block.id}`)는 NotionRenderer가 부여한 것과 연결된다.
 */
export function WikiToc({ items, className }: WikiTocProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const headings = items
      .map((b) => document.getElementById(`h-${b.id}`))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        // 화면 상단에 가장 가까운(가장 위) heading을 활성으로
        const top = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        )
        setActiveId(top.target.id)
      },
      // 상단 80px(헤더) 아래, 하단 70% 위 구간에 들어온 heading을 감지
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  return (
    <nav className={cn("sticky top-8 space-y-1", className)} aria-label="목차">
      <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        목차
      </p>
      {items.map((block) => {
        const id = `h-${block.id}`
        const active = activeId === id
        return (
          <a
            key={block.id}
            href={`#${id}`}
            aria-current={active ? "location" : undefined}
            className={cn(
              "block text-sm transition-colors",
              block.type === "heading_3" && "pl-3",
              active
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {block.content}
          </a>
        )
      })}
    </nav>
  )
}
