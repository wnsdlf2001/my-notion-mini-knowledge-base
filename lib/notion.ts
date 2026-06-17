import { unstable_cache } from "next/cache";
import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * Notion 데이터 캐시 태그. 발행/수정 시 `/api/revalidate`에서
 * `revalidateTag(NOTION_CACHE_TAG)`로 즉시 무효화한다.
 */
export const NOTION_CACHE_TAG = "notion-pages";
const CACHE_REVALIDATE_SECONDS = 3600; // 시간 기반 폴백 (1시간)

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

/** 인라인 서식 세그먼트 (굵게/기울임/취소선/인라인코드/링크) */
export interface WikiRichText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  href?: string;
}

export interface WikiBlock {
  id: string;
  type: string;
  /** plain-text (ToC 앵커·검색·메타용). richText가 없을 때의 폴백이기도 함 */
  content: string;
  /** 인라인 서식 렌더링용 세그먼트. 텍스트 블록에 존재 */
  richText?: WikiRichText[];
  level?: number;
  language?: string;
  /** image 블록의 소스 URL */
  url?: string;
  /** image 블록의 캡션 */
  caption?: string;
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

/** Notion rich_text 배열을 인라인 서식 세그먼트로 변환 (빈 값은 생략해 페이로드 절약) */
function parseRichText(richTexts: RichTextItemResponse[]): WikiRichText[] {
  return richTexts.map((rt) => {
    const seg: WikiRichText = { text: rt.plain_text };
    if (rt.annotations.bold) seg.bold = true;
    if (rt.annotations.italic) seg.italic = true;
    if (rt.annotations.strikethrough) seg.strikethrough = true;
    if (rt.annotations.code) seg.code = true;
    if (rt.href) seg.href = rt.href;
    return seg;
  });
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
async function fetchPublishedPages(): Promise<WikiPage[]> {
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
async function fetchPageById(id: string): Promise<{
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

// ─────────────────────────────────────────────
// 캐시 래퍼 (unstable_cache)
// Notion 호출 결과를 태그 기반으로 캐싱한다. rate limit 완화 + 응답 속도 개선.
// 시간 기반(revalidate)으로 자동 만료되고, 발행/수정 시 revalidateTag로 즉시 갱신된다.
// ─────────────────────────────────────────────

/**
 * Status === "발행됨" 페이지 목록 (캐시됨).
 */
export const getPublishedPages = unstable_cache(
  fetchPublishedPages,
  ["published-pages"],
  { tags: [NOTION_CACHE_TAG], revalidate: CACHE_REVALIDATE_SECONDS }
);

/**
 * 단일 페이지 메타데이터 + 블록 (id별 캐시됨).
 */
export const getPageById = unstable_cache(
  fetchPageById,
  ["page-by-id"],
  { tags: [NOTION_CACHE_TAG], revalidate: CACHE_REVALIDATE_SECONDS }
);

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
        richText: parseRichText(block.paragraph.rich_text),
      };
    case "heading_1":
      return {
        ...base,
        content: extractPlainText(block.heading_1.rich_text),
        richText: parseRichText(block.heading_1.rich_text),
        level: 1,
      };
    case "heading_2":
      return {
        ...base,
        content: extractPlainText(block.heading_2.rich_text),
        richText: parseRichText(block.heading_2.rich_text),
        level: 2,
      };
    case "heading_3":
      return {
        ...base,
        content: extractPlainText(block.heading_3.rich_text),
        richText: parseRichText(block.heading_3.rich_text),
        level: 3,
      };
    case "bulleted_list_item":
      return {
        ...base,
        content: extractPlainText(block.bulleted_list_item.rich_text),
        richText: parseRichText(block.bulleted_list_item.rich_text),
      };
    case "numbered_list_item":
      return {
        ...base,
        content: extractPlainText(block.numbered_list_item.rich_text),
        richText: parseRichText(block.numbered_list_item.rich_text),
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
        richText: parseRichText(block.quote.rich_text),
      };
    case "image": {
      const img = block.image;
      const url = img.type === "external" ? img.external.url : img.file.url;
      const caption = extractPlainText(img.caption);
      return { ...base, content: caption, url, caption };
    }
    case "divider":
      return { ...base, content: "" };
    default:
      return { ...base, content: "" };
  }
}
