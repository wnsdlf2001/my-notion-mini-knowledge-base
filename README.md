# Mini Knowledge Base — 나만의 미니 위키

> Notion을 CMS로 활용한 개인 기술 위키 및 FAQ 가이드북 웹사이트

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8)](https://tailwindcss.com/)

---

## 프로젝트 소개

Notion 데이터베이스를 CMS로 사용하여 기술 문서와 FAQ를 웹에서 탐색할 수 있는 미니 위키입니다.
Notion에서 문서를 작성·관리하면 웹사이트에 자동으로 반영됩니다.

**주요 특징:**
- Notion `Status === "발행됨"` 문서만 웹에 노출
- 토픽(Frontend · Backend · CS · Life 등)별 아코디언 목록
- 제목 기반 실시간 키워드 검색
- 모바일 반응형 디자인

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | **Next.js 15** (App Router) |
| 언어 | **TypeScript 5** |
| CMS | **Notion API** (`@notionhq/client`) |
| 스타일 | **Tailwind CSS v4** + **shadcn/ui** |
| 아이콘 | **Lucide React** |
| 배포 | **Vercel** |

---

## 화면 구성

| 라우트 | 설명 |
|--------|------|
| `/` | 대형 검색바 + 주요 토픽 카드 그리드 |
| `/wiki` | 토픽별 그룹화된 아코디언 문서 목록 |
| `/wiki/[id]` | Notion 마크다운 본문 + 좌우 사이드바 |

---

## Notion 데이터베이스 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| `Title` | title | 문서/질문 제목 |
| `Topic` | select | 대분류 (Frontend, Backend, CS, Life …) |
| `Difficulty` | select | 난이도 (상, 중, 하) |
| `LastUpdated` | date | 최종 수정일 |
| `Status` | select | **발행됨** 상태만 노출 |

---

## 빠른 시작

### 1. 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/<your-username>/mini-knowledge-base.git
cd mini-knowledge-base
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local`을 열어 아래 두 값을 입력합니다:

```env
NOTION_TOKEN=secret_...
NOTION_DATABASE_ID=...
```

- `NOTION_TOKEN`: Notion 인테그레이션 시크릿 키 ([Notion Integrations](https://www.notion.so/my-integrations))
- `NOTION_DATABASE_ID`: 연결할 Notion 데이터베이스 ID (URL에서 추출)

### 3. 개발 서버 실행

```bash
npm run dev   # http://localhost:3000
```

### 4. 프로덕션 빌드

```bash
npm run build && npm start
```

---

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드된 앱 실행 |
| `npm run lint` | ESLint |

---

## 프로젝트 문서

- [PRD (Product Requirements Document)](docs/PRD.md)

---

## 라이선스

MIT
