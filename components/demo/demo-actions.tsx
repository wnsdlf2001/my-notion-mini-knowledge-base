"use client"

import * as React from "react"
import { Bell, Loader2, Sparkles } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

async function fetchPing(): Promise<{ ok: true; at: string }> {
  await new Promise((r) => setTimeout(r, 600))
  return { ok: true, at: new Date().toISOString() }
}

export function DemoActions() {
  const ping = useQuery({ queryKey: ["ping"], queryFn: fetchPing })

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          toast.success("스타터킷이 정상 동작합니다", {
            description: "Sonner 토스트가 적용되었습니다.",
          })
        }
      >
        <Bell />
        토스트 띄우기
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Sparkles />
            다이얼로그 열기
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>shadcn Dialog 예시</DialogTitle>
            <DialogDescription>
              Input/Label/Button 등 핵심 컴포넌트가 함께 동작합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Label htmlFor="demo-name">이름</Label>
            <Input id="demo-name" placeholder="홍길동" />
          </div>
          <DialogFooter>
            <Button
              onClick={() => toast.info("저장됨 (데모)")}
              type="button"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="secondary" disabled={ping.isFetching}>
        {ping.isFetching ? <Loader2 className="animate-spin" /> : null}
        {ping.isFetching
          ? "Query 호출 중"
          : ping.data
            ? `Query OK · ${new Date(ping.data.at).toLocaleTimeString()}`
            : "Query 대기"}
      </Button>
    </div>
  )
}
