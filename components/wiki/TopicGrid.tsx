import Link from "next/link"
import {
  Monitor,
  Server,
  Cpu,
  Heart,
  FileText,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TopicItem {
  topic: string
  count: number
}

interface TopicGridProps {
  topics: TopicItem[]
  className?: string
}

const TOPIC_ICONS: Record<string, React.ElementType> = {
  Frontend: Monitor,
  Backend: Server,
  CS: Cpu,
  Life: Heart,
}

const TOPIC_COLORS: Record<string, string> = {
  Frontend: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Backend: "bg-green-500/10 text-green-600 dark:text-green-400",
  CS: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Life: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
}

export function TopicGrid({ topics, className }: TopicGridProps) {
  if (topics.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        표시할 토픽이 없습니다.
      </p>
    )
  }

  return (
    <div
      data-slot="topic-grid"
      className={cn(
        "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {topics.map(({ topic, count }) => {
        const Icon = TOPIC_ICONS[topic] ?? FileText
        const colorClass = TOPIC_COLORS[topic] ?? "bg-muted text-muted-foreground"

        return (
          <Link
            key={topic}
            href={`/wiki?topic=${encodeURIComponent(topic)}`}
            className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
          >
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div
                  className={cn(
                    "mb-2 inline-flex size-10 items-center justify-center rounded-lg",
                    colorClass
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-sm">{topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{count}개 문서</Badge>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
