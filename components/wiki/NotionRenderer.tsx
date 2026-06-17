import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import type { WikiBlock } from "@/lib/notion"

interface NotionRendererProps {
  blocks: WikiBlock[]
  className?: string
}

/**
 * 인라인 서식 세그먼트(굵게/기울임/취소선/인라인코드/링크)를 렌더링한다.
 * richText가 없으면 plain-text(content)로 폴백한다.
 */
function RichText({ block }: { block: WikiBlock }) {
  if (!block.richText || block.richText.length === 0) {
    return <>{block.content}</>
  }
  return (
    <>
      {block.richText.map((seg, i) => {
        let node: React.ReactNode = seg.text
        if (seg.code)
          node = (
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-[0.9em]">
              {node}
            </code>
          )
        if (seg.bold) node = <strong>{node}</strong>
        if (seg.italic) node = <em>{node}</em>
        if (seg.strikethrough) node = <s>{node}</s>
        if (seg.href)
          node = (
            <a
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              {node}
            </a>
          )
        return <React.Fragment key={i}>{node}</React.Fragment>
      })}
    </>
  )
}

function CodeBlock({
  content,
  language,
}: {
  content: string
  language?: string
}) {
  return (
    <div className="group relative my-4">
      {language && (
        <span className="absolute top-2 right-3 text-xs text-muted-foreground opacity-70">
          {language}
        </span>
      )}
      <pre
        className={cn(
          "overflow-x-auto rounded-lg bg-muted px-4 py-3 text-sm",
          language && "pt-7"
        )}
      >
        <code>{content}</code>
      </pre>
    </div>
  )
}

function BlockRenderer({ block }: { block: WikiBlock }) {
  switch (block.type) {
    case "heading_1":
      return (
        <h1
          id={`h-${block.id}`}
          className="mt-8 mb-4 scroll-mt-20 text-2xl font-bold tracking-tight first:mt-0"
        >
          <RichText block={block} />
        </h1>
      )
    case "heading_2":
      return (
        <h2
          id={`h-${block.id}`}
          className="mt-6 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight"
        >
          <RichText block={block} />
        </h2>
      )
    case "heading_3":
      return (
        <h3
          id={`h-${block.id}`}
          className="mt-5 mb-2 scroll-mt-20 text-lg font-medium"
        >
          <RichText block={block} />
        </h3>
      )
    case "paragraph":
      if (!block.content.trim()) return <br />
      return (
        <p className="mb-4 leading-7 text-foreground/90">
          <RichText block={block} />
        </p>
      )
    case "bulleted_list_item":
      return (
        <li className="mb-1 ml-4 list-disc leading-7 text-foreground/90">
          <RichText block={block} />
        </li>
      )
    case "numbered_list_item":
      return (
        <li className="mb-1 ml-4 list-decimal leading-7 text-foreground/90">
          <RichText block={block} />
        </li>
      )
    case "code":
      return (
        <CodeBlock content={block.content} language={block.language} />
      )
    case "quote":
      return (
        <blockquote className="my-4 border-l-4 border-border pl-4 text-muted-foreground italic">
          <RichText block={block} />
        </blockquote>
      )
    case "image":
      if (!block.url) return null
      return (
        <figure className="my-6">
          <Image
            src={block.url}
            alt={block.caption || "본문 이미지"}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto w-full rounded-lg border"
          />
          {block.caption && (
            <figcaption className="text-muted-foreground mt-2 text-center text-xs">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    case "divider":
      return <hr className="my-6 border-border" />
    default:
      return null
  }
}

/**
 * Notion 블록 배열을 HTML로 렌더링합니다.
 * 인접한 list_item 블록은 자동으로 ul/ol로 묶습니다.
 */
export function NotionRenderer({ blocks, className }: NotionRendererProps) {
  if (blocks.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">내용이 없습니다.</p>
    )
  }

  // 인접 리스트 아이템을 그룹화하여 렌더링
  const rendered: React.ReactNode[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    if (block.type === "bulleted_list_item") {
      const items: WikiBlock[] = []
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        items.push(blocks[i])
        i++
      }
      rendered.push(
        <ul key={`ul-${items[0].id}`} className="my-4 space-y-1 pl-2">
          {items.map((b) => (
            <BlockRenderer key={b.id} block={b} />
          ))}
        </ul>
      )
      continue
    }

    if (block.type === "numbered_list_item") {
      const items: WikiBlock[] = []
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        items.push(blocks[i])
        i++
      }
      rendered.push(
        <ol key={`ol-${items[0].id}`} className="my-4 space-y-1 pl-2">
          {items.map((b) => (
            <BlockRenderer key={b.id} block={b} />
          ))}
        </ol>
      )
      continue
    }

    rendered.push(<BlockRenderer key={block.id} block={block} />)
    i++
  }

  return (
    <article
      data-slot="notion-renderer"
      className={cn("prose-sm max-w-none", className)}
    >
      {rendered}
    </article>
  )
}
