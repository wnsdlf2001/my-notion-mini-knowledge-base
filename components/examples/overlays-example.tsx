"use client"

import * as React from "react"
import {
  Ellipsis,
  Info,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react"
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
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function OverlaysExample() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">확인 다이얼로그</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 삭제하시겠어요?</DialogTitle>
            <DialogDescription>
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => toast.success("삭제되었습니다")}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">우측 패널 열기</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>상세 설정</SheetTitle>
            <SheetDescription>
              사이드 패널은 필터·상세 보기·간단한 폼에 적합합니다.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 text-sm text-muted-foreground">
            여기에 임의의 콘텐츠를 배치할 수 있습니다.
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button>닫기</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* DropdownMenu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            액션 메뉴
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>항목 작업</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => toast.info("편집")}>
            <Pencil />
            편집
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("공유")}>
            <Share2 />
            공유
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => toast.success("삭제됨")}
          >
            <Trash2 />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="도움말">
            <Info />
          </Button>
        </TooltipTrigger>
        <TooltipContent>이 영역에 마우스를 올리면 표시됩니다</TooltipContent>
      </Tooltip>
    </div>
  )
}
