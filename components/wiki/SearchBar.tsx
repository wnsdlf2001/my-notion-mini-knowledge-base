"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  initialValue?: string
  placeholder?: string
  className?: string
  /** true이면 /wiki로 라우팅, false이면 onSearch 콜백만 호출 */
  navigateOnSearch?: boolean
  onSearch?: (value: string) => void
}

export function SearchBar({
  initialValue = "",
  placeholder = "검색어를 입력하세요...",
  className,
  navigateOnSearch = false,
  onSearch,
}: SearchBarProps) {
  const router = useRouter()
  const [value, setValue] = React.useState(initialValue)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // 외부에서 initialValue가 바뀌면(초기화 버튼·뒤로가기 등) 입력값을 동기화.
  // effect 대신 렌더 중 prop 변화를 감지하는 React 권장 패턴 사용.
  const [prevInitial, setPrevInitial] = React.useState(initialValue)
  if (initialValue !== prevInitial) {
    setPrevInitial(initialValue)
    setValue(initialValue)
  }

  const submit = React.useCallback(
    (next: string) => {
      if (navigateOnSearch) {
        const params = new URLSearchParams()
        if (next) params.set("q", next)
        router.push(`/wiki${next ? `?${params.toString()}` : ""}`)
      } else {
        onSearch?.(next)
      }
    },
    [navigateOnSearch, onSearch, router]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setValue(next)

    // 라우팅 모드(홈)에서는 입력 중 자동 이동하지 않고 Enter에서만 이동한다.
    // 콜백 모드(리스트)에서는 입력 즉시(300ms debounce) 실시간 필터링한다.
    if (navigateOnSearch) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => submit(next), 300)
  }

  // Enter 입력 시 debounce를 건너뛰고 즉시 검색/이동
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      submit(value)
    }
  }

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div
      data-slot="search-bar"
      role="search"
      className={cn("relative w-full", className)}
    >
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-10 pl-9"
        aria-label="검색"
      />
    </div>
  )
}
