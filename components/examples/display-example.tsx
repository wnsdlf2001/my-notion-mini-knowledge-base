"use client"

import * as React from "react"
import { Check, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const variants = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const

export function DisplayExample() {
  const [loading, setLoading] = React.useState(false)

  return (
    <div className="grid gap-6">
      {/* Badges */}
      <div>
        <h3 className="text-sm font-medium mb-2">Badge variants</h3>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
          <Badge>
            <Check />
            완료
          </Badge>
          <Badge variant="secondary">
            <Star />
            추천
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Avatars */}
      <div>
        <h3 className="text-sm font-medium mb-2">Avatar 크기 · 그룹</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar size="sm">
            <AvatarImage src="https://i.pravatar.cc/64?img=1" alt="sm" />
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/64?img=2" alt="default" />
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarImage src="https://i.pravatar.cc/64?img=3" alt="lg" />
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>

          <AvatarGroup>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=4" alt="" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=5" alt="" />
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=6" alt="" />
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+5</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </div>

      <Separator />

      {/* Card + Separator vertical */}
      <div>
        <h3 className="text-sm font-medium mb-2">
          Card (CardFooter 자동 border-t) · 수직 Separator
        </h3>
        <Card>
          <CardHeader>
            <CardTitle>월간 리포트</CardTitle>
            <CardDescription>2026년 5월 요약</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-10 items-center gap-4 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">방문</div>
                <div className="font-medium">12,847</div>
              </div>
              <Separator orientation="vertical" />
              <div>
                <div className="text-muted-foreground text-xs">가입</div>
                <div className="font-medium">324</div>
              </div>
              <Separator orientation="vertical" />
              <div>
                <div className="text-muted-foreground text-xs">전환율</div>
                <div className="font-medium">2.52%</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="link" size="sm">
              전체 리포트 보기 →
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Separator />

      {/* Skeleton */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Skeleton 로딩 상태</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLoading((v) => !v)}
          >
            {loading ? "콘텐츠 보기" : "로딩 시뮬레이션"}
          </Button>
        </div>
        {loading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="grid gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=12" alt="" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">홍길동</div>
              <div className="text-muted-foreground text-xs">
                gildong@example.com
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
