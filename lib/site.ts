/**
 * 사이트 기본 URL.
 * 배포 시 NEXT_PUBLIC_SITE_URL 또는 Vercel이 주입하는 VERCEL_URL을 사용하고,
 * 로컬에서는 localhost로 폴백한다. (robots/sitemap의 절대 URL 생성에 사용)
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}
