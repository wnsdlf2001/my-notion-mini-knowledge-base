"use client"

import * as React from "react"

// localStorage 기반 북마크 저장소.
// useSyncExternalStore로 여러 컴포넌트(버튼·필터)가 동일 상태를 공유하고,
// SSR에서는 빈 배열을 반환해 hydration 불일치를 피한다.

const STORAGE_KEY = "wiki:bookmarks"
const EMPTY: string[] = []

const listeners = new Set<() => void>()
let cache: string[] | null = null

function read(): string[] {
  if (cache) return cache
  if (typeof window === "undefined") return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    cache = raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    cache = []
  }
  return cache
}

function write(next: string[]) {
  cache = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 저장 실패는 무시 (프라이빗 모드 등)
  }
  listeners.forEach((l) => l())
}

export function toggleBookmark(id: string) {
  const current = read()
  write(
    current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
  )
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  // 다른 탭에서의 변경도 반영
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null
      cb()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("storage", onStorage)
  }
}

function getSnapshot(): string[] {
  return read()
}

function getServerSnapshot(): string[] {
  return EMPTY
}

export function useBookmarks() {
  const bookmarks = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  return {
    bookmarks,
    count: bookmarks.length,
    isBookmarked: (id: string) => bookmarks.includes(id),
    toggle: toggleBookmark,
  }
}
