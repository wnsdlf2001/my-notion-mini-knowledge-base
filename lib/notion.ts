import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

// ─────────────────────────────────────────────
// TypeScript 타입 정의
// ─────────────────────────────────────────────

export type Difficulty = "상" | "중" | "하";
export type Status = "발행됨" | "초안" | "보관됨";

export interface WikiPage {
  id: string;
  title: string;
  topic: string;
  difficulty: Difficulty | null;
  lastUpdated: string | null;
  status: Status | null;
}

export interface WikiBlock {
  id: string;
  type: string;
  content: string;
  level?: number;
  language?: string;
}

// ─────────────────────────────────────────────
// Notion 클라이언트 초기화
// ─────────────────────────────────────────────

function getNotionClient(): Client | null {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.warn(
      "[notion] NOTION_TOKEN 환경변수가 설정되지 않았습니다. 빈 데이터를 반환합니다."
    );
    return null;
  }
  return new Client({ auth: token });
}

// ─────────────────────────────────────────────
// 헬퍼 유틸
// ─────────────────────────────────────────────

function extractPlainText(richTexts: RichTextItemResponse[]): string {
  return richTexts.map((rt) => rt.plain_text).join("");
}

function parsePageProperties(page: PageObjectResponse): WikiPage {
  const props = page.properties;

  // Title
  const titleProp = props["Title"];
  const title =
    titleProp?.type === "title"
      ? extractPlainText(titleProp.title)
      : "제목 없음";

  // Topic
  const topicProp = props["Topic"];
  const topic =
    topicProp?.type === "select" ? (topicProp.select?.name ?? "기타") : "기타";

  // Difficulty
  const difficultyProp = props["Difficulty"];
  const difficulty =
    difficultyProp?.type === "select"
      ? (difficultyProp.select?.name as Difficulty | null) ?? null
      : null;

  // LastUpdated
  const lastUpdatedProp = props["LastUpdated"];
  const lastUpdated =
    lastUpdatedProp?.type === "date"
      ? (lastUpdatedProp.date?.start ?? null)
      : null;

  // Status
  const statusProp = props["Status"];
  const status =
    statusProp?.type === "select"
      ? (statusProp.select?.name as Status | null) ?? null
      : null;

  return { id: page.id, title, topic, difficulty, lastUpdated, status };
}

// ─────────────────────────────────────────────
// 공개 API 함수
// ─────────────────────────────────────────────

/**
 * Status === "발행됨" 인 모든 페이지를 반환합니다.
 * 환경변수 미설정 시 빈 배열을 반환합니다.
 */
export async function getPublishedPages(): Promise<WikiPage[]> {
  const notion = getNotionClient();
  if (!notion) return [];

  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    console.warn(
      "[notion] NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다. 빈 데이터를 반환합니다."
    );
    return [];
  }

  try {
    const response = await notion.dataSources.query({
      data_source_id: databaseId,
      filter: {
        property: "Status",
        select: {
          equals: "발행됨",
        },
      },
      sorts: [
        {
          property: "LastUpdated",
          direction: "descending",
        },
      ],
    });

    const pages: WikiPage[] = [];
    for (const result of response.results) {
      if (result.object === "page" && "properties" in result) {
        pages.push(parsePageProperties(result as PageObjectResponse));
      }
    }
    return pages;
  } catch (error) {
    console.error("[notion] getPublishedPages 오류:", error);
    return [];
  }
}

/**
 * 단일 페이지의 메타데이터와 블록 목록을 반환합니다.
 * 환경변수 미설정 시 null과 빈 배열을 반환합니다.
 */
export async function getPageById(id: string): Promise<{
  page: WikiPage | null;
  blocks: WikiBlock[];
}> {
  const notion = getNotionClient();
  if (!notion) return { page: null, blocks: [] };

  try {
    // 페이지 메타데이터 조회
    const pageResponse = await notion.pages.retrieve({ page_id: id });
    const page =
      pageResponse.object === "page" && "properties" in pageResponse
        ? parsePageProperties(pageResponse as PageObjectResponse)
        : null;

    // 블록 목록 조회
    const blocksResponse = await notion.blocks.children.list({
      block_id: id,
      page_size: 100,
    });

    const blocks: WikiBlock[] = blocksResponse.results
      .filter(
        (block): block is BlockObjectResponse => block.object === "block"
      )
      .map((block) => parseBlock(block));

    return { page, blocks };
  } catch (error) {
    console.error("[notion] getPageById 오류:", error);
    return { page: null, blocks: [] };
  }
}

/**
 * WikiPage 배열을 토픽별 Map으로 그룹화하여 반환합니다.
 */
export function groupByTopic(pages: WikiPage[]): Map<string, WikiPage[]> {
  const map = new Map<string, WikiPage[]>();
  for (const page of pages) {
    const topic = page.topic || "기타";
    const existing = map.get(topic) ?? [];
    map.set(topic, [...existing, page]);
  }
  return map;
}

// ─────────────────────────────────────────────
// 블록 파싱 헬퍼
// ─────────────────────────────────────────────

function parseBlock(block: BlockObjectResponse): WikiBlock {
  const base = { id: block.id, type: block.type };

  switch (block.type) {
    case "paragraph":
      return {
        ...base,
        content: extractPlainText(block.paragraph.rich_text),
      };
    case "heading_1":
      return {
        ...base,
        content: extractPlainText(block.heading_1.rich_text),
        level: 1,
      };
    case "heading_2":
      return {
        ...base,
        content: extractPlainText(block.heading_2.rich_text),
        level: 2,
      };
    case "heading_3":
      return {
        ...base,
        content: extractPlainText(block.heading_3.rich_text),
        level: 3,
      };
    case "bulleted_list_item":
      return {
        ...base,
        content: extractPlainText(block.bulleted_list_item.rich_text),
      };
    case "numbered_list_item":
      return {
        ...base,
        content: extractPlainText(block.numbered_list_item.rich_text),
      };
    case "code":
      return {
        ...base,
        content: extractPlainText(block.code.rich_text),
        language: block.code.language,
      };
    case "quote":
      return {
        ...base,
        content: extractPlainText(block.quote.rich_text),
      };
    case "divider":
      return { ...base, content: "" };
    default:
      return { ...base, content: "" };
  }
}
