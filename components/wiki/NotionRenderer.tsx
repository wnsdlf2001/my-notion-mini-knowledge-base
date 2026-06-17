import { cn } from "@/lib/utils"
import type { WikiBlock } from "@/lib/notion"

interface NotionRendererProps {
  blocks: WikiBlock[]
  className?: string
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
          {block.content}
        </h1>
      )
    case "heading_2":
      return (
        <h2
          id={`h-${block.id}`}
          className="mt-6 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight"
        >
          {block.content}
        </h2>
      )
    case "heading_3":
      return (
        <h3
          id={`h-${block.id}`}
          className="mt-5 mb-2 scroll-mt-20 text-lg font-medium"
        >
          {block.content}
        </h3>
      )
    case "paragraph":
      if (!block.content.trim()) return <br />
      return (
        <p className="mb-4 leading-7 text-foreground/90">{block.content}</p>
      )
    case "bulleted_list_item":
      return (
        <li className="mb-1 ml-4 list-disc leading-7 text-foreground/90">
          {block.content}
        </li>
      )
    case "numbered_list_item":
      return (
        <li className="mb-1 ml-4 list-decimal leading-7 text-foreground/90">
          {block.content}
        </li>
      )
    case "code":
      return (
        <CodeBlock content={block.content} language={block.language} />
      )
    case "quote":
      return (
        <blockquote className="my-4 border-l-4 border-border pl-4 text-muted-foreground italic">
          {block.content}
        </blockquote>
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
