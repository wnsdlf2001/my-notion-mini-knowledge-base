import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Notion 이미지 호스트. 업로드 파일은 S3 서명 URL(만료형),
    // 외부 이미지는 임베드 호스트에 따라 다름. 필요한 호스트를 여기에 추가한다.
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.notion.so" },
      { protocol: "https", hostname: "**.notion-static.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
