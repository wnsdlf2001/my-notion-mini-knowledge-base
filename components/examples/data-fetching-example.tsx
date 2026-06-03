"use client"

import * as React from "react"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Heart, Loader2, RefreshCcw, RotateCw } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

type Article = {
  id: number
  title: string
  likes: number
}

async function fetchArticle(): Promise<Article> {
  await new Promise((r) => setTimeout(r, 700))
  if (Math.random() < 0.4) {
    throw new Error("네트워크 오류 (시뮬레이션)")
  }
  return {
    id: 42,
    title: "React Query로 서버 상태 관리하기",
    likes: Math.floor(Math.random() * 100),
  }
}

async function likeArticle(currentLikes: number): Promise<number> {
  await new Promise((r) => setTimeout(r, 400))
  return currentLikes + 1
}

const ARTICLE_KEY = ["example", "article"] as const

export function DataFetchingExample() {
  const queryClient = useQueryClient()

  const articleQuery = useQuery({
    queryKey: ARTICLE_KEY,
    queryFn: fetchArticle,
    retry: 0,
  })

  const likeMutation = useMutation({
    mutationFn: (current: number) => likeArticle(current),
    onSuccess: (newLikes) => {
      queryClient.setQueryData<Article>(ARTICLE_KEY, (prev) =>
        prev ? { ...prev, likes: newLikes } : prev
      )
      toast.success("좋아요 반영됨", { description: `현재 ${newLikes}` })
    },
    onError: () => toast.error("좋아요 실패"),
  })

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">queryKey</Badge>
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {JSON.stringify(ARTICLE_KEY)}
        </code>
      </div>

      <Separator />

      {/* 상태별 표시 */}
      {articleQuery.isPending ? (
        <div className="grid gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ) : articleQuery.isError ? (
        <div className="grid gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <div className="font-medium text-destructive">
            요청 실패: {articleQuery.error.message}
          </div>
          <div className="text-muted-foreground text-xs">
            아래 재시도 버튼으로 다시 호출해보세요.
          </div>
        </div>
      ) : (
        <div className="grid gap-1">
          <div className="text-sm font-medium">{articleQuery.data.title}</div>
          <div className="text-muted-foreground text-xs">
            id={articleQuery.data.id} · likes={articleQuery.data.likes}
          </div>
        </div>
      )}

      <Separator />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => articleQuery.refetch()}
          disabled={articleQuery.isFetching}
        >
          {articleQuery.isFetching ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RotateCw />
          )}
          재시도 (refetch)
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ARTICLE_KEY })
          }
        >
          <RefreshCcw />
          캐시 무효화
        </Button>

        <Button
          size="sm"
          onClick={() => {
            if (!articleQuery.data) return
            likeMutation.mutate(articleQuery.data.likes)
          }}
          disabled={!articleQuery.data || likeMutation.isPending}
        >
          {likeMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Heart />
          )}
          좋아요 (mutation)
        </Button>
      </div>
    </div>
  )
}
