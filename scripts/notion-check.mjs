// Notion 연결 검증 + data source ID 안내 스크립트
// 사용법: npm run notion:check
// .env.local 의 NOTION_TOKEN / NOTION_DATABASE_ID 를 읽어
// 1) 값이 database ID면 그 안의 data source ID를 알려주고
// 2) 발행됨(Status=발행됨) 문서를 실제로 조회해 콘솔에 출력합니다.

import { readFileSync } from "node:fs";
import { Client } from "@notionhq/client";

// .env.local 수동 파싱 (Next.js가 아닌 단독 node 실행이므로)
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    console.error("❌ .env.local 파일을 읽을 수 없습니다.");
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const token = env.NOTION_TOKEN;
const idValue = env.NOTION_DATABASE_ID;

if (!token) {
  console.error("❌ NOTION_TOKEN 이 비어 있습니다. .env.local 을 확인하세요.");
  process.exit(1);
}
if (!idValue) {
  console.error("❌ NOTION_DATABASE_ID 가 비어 있습니다. .env.local 을 확인하세요.");
  process.exit(1);
}

const notion = new Client({ auth: token });

async function resolveDataSourceId() {
  // 값이 database ID인 경우 → data source 목록을 조회
  try {
    const db = await notion.databases.retrieve({ database_id: idValue });
    const sources = db.data_sources ?? [];
    if (sources.length > 0) {
      console.log("✅ database ID로 인식했습니다. 포함된 data source:");
      for (const s of sources) console.log(`   - ${s.name || "(이름 없음)"}: ${s.id}`);
      const chosen = sources[0].id;
      if (chosen !== idValue) {
        console.log("");
        console.log("👉 .env.local 의 NOTION_DATABASE_ID 를 아래 값으로 바꾸세요:");
        console.log(`   NOTION_DATABASE_ID=${chosen}`);
        console.log("");
      }
      return chosen;
    }
  } catch {
    // database가 아니면(이미 data source ID이면) 그대로 사용 시도
  }
  return idValue;
}

async function main() {
  console.log("🔑 토큰 길이:", token.length, "/ ID:", idValue);
  const dataSourceId = await resolveDataSourceId();

  console.log("\n📡 발행됨 문서 조회 중...\n");
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property: "Status", select: { equals: "발행됨" } },
    sorts: [{ property: "LastUpdated", direction: "descending" }],
  });

  console.log(`✅ 발행됨 문서 ${res.results.length}건:`);
  for (const page of res.results) {
    const p = page.properties ?? {};
    const title = p.Title?.title?.map((t) => t.plain_text).join("") || "(제목 없음)";
    const topic = p.Topic?.select?.name ?? "-";
    const diff = p.Difficulty?.select?.name ?? "-";
    console.log(`   - [${topic}/${diff}] ${title}  (id: ${page.id})`);
  }
  if (res.results.length === 0) {
    console.log("   ⚠️ 0건입니다. Status='발행됨' 문서가 있는지, 통합이 DB에 연결됐는지 확인하세요.");
  }
}

main().catch((err) => {
  console.error("\n❌ 오류:", err.body ?? err.message ?? err);
  console.error("\n점검: ① 토큰이 맞는지 ② DB '연결(Connections)'에 통합을 추가했는지 ③ 속성 이름(Status/Topic/Difficulty/LastUpdated/Title)이 정확한지");
  process.exit(1);
});
