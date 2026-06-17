import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/site"
import { getPublishedPages } from "@/lib/notion"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const pages = await getPublishedPages()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/wiki`, changeFrequency: "daily", priority: 0.8 },
  ]

  const detailRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteUrl}/wiki/${page.id}`,
    lastModified: page.lastUpdated ? new Date(page.lastUpdated) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...detailRoutes]
}
