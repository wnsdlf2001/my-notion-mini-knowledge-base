import { BookOpen } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBar } from "@/components/wiki/SearchBar";
import { TopicGrid } from "@/components/wiki/TopicGrid";
import { getPublishedPages, groupByTopic } from "@/lib/notion";

export default async function HomePage() {
  const pages = await getPublishedPages();
  const topicMap = groupByTopic(pages);
  const topics = Array.from(topicMap.entries()).map(([topic, items]) => ({
    topic,
    count: items.length,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5" />
          <span className="text-base font-semibold">Mini Knowledge Base</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <section className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            나만의 미니 위키
          </h1>
          <p className="text-muted-foreground mx-auto max-w-xl text-lg">
            Notion으로 관리하는 개인 기술 위키 및 FAQ 가이드북
          </p>
          <div className="mx-auto max-w-xl pt-4">
            <SearchBar
              navigateOnSearch
              placeholder="검색어를 입력하고 Enter를 누르세요..."
            />
          </div>
        </section>

        {topics.length > 0 && (
          <section className="mt-16 space-y-6">
            <h2 className="text-xl font-semibold">주요 토픽</h2>
            <TopicGrid topics={topics} />
          </section>
        )}

        {topics.length === 0 && (
          <section className="mt-16 text-center">
            <p className="text-muted-foreground text-sm">
              발행된 문서가 없습니다. Notion 데이터베이스에 문서를 추가하고
              Status를 &quot;발행됨&quot;으로 설정해 주세요.
            </p>
          </section>
        )}
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        Powered by Notion API · Built with Next.js
      </footer>
    </div>
  );
}
