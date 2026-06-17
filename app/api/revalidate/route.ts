import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

import { NOTION_CACHE_TAG } from "@/lib/notion"

/**
 * Notion 콘텐츠 발행/수정 시 캐시를 무효화하는 엔드포인트.
 *
 * 사용:
 * - Notion Webhook 또는 수동/Cron에서 POST 호출
 * - 인증: `?secret=` 쿼리 또는 `x-revalidate-secret` 헤더가 NOTION_REVALIDATE_SECRET과 일치
 *
 * 참고(향후 강화): 운영 환경에서는 Notion이 보내는 `X-Notion-Signature`(HMAC)
 * 검증으로 대체/보강하는 것이 안전하다.
 */
export async function POST(request: NextRequest) {
  // Notion Webhook 최초 구독 시 보내는 검증 핸드셰이크 처리.
  // { verification_token } 을 200으로 응답해 주면 구독이 활성화된다.
  let body: unknown = null
  try {
    body = await request.json()
  } catch {
    // body 없음 — 무시
  }
  if (
    body &&
    typeof body === "object" &&
    "verification_token" in body
  ) {
    const token = (body as { verification_token: string }).verification_token
    console.log("[revalidate] Notion verification_token:", token)
    return NextResponse.json({ verification_token: token })
  }

  // 시크릿 검증
  const secret =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("x-revalidate-secret")

  if (
    !process.env.NOTION_REVALIDATE_SECRET ||
    secret !== process.env.NOTION_REVALIDATE_SECRET
  ) {
    return NextResponse.json(
      { revalidated: false, error: "유효하지 않은 시크릿" },
      { status: 401 }
    )
  }

  // 두 번째 인자는 stale-while-revalidate 윈도우 프로파일. 'max'는 가장 긴 윈도우로
  // 갱신 중에도 기존 콘텐츠를 즉시 제공하고 백그라운드에서 새로 고친다.
  revalidateTag(NOTION_CACHE_TAG, "max")
  return NextResponse.json({ revalidated: true, tag: NOTION_CACHE_TAG, now: Date.now() })
}
