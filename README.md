# SignalIdeas

AI-powered startup idea generation from recent real-world demand signals.

SignalIdeas researches a niche, normalizes market/community signals, clusters recurring problems, generates structured startup ideas, scores them, and lets you refine ideas into validation assets.

## What Works In This MVP

- Founder profile with skills, interests, budget, hours, business model, and risk tolerance
- Mock demand research for:
  - AI video tools
  - creator economy
  - solo founder productivity
  - B2B compliance
  - developer tools
  - local service businesses
- Normalized signal model across Reddit, Hacker News, YouTube, X/Twitter, GitHub, Polymarket, and web-style sources
- Problem clustering, idea generation, scoring, founder-fit ranking
- Evidence drawer with source snippets
- Idea detail pages with MVP scope, monetization, GTM, competitors, validation plan, risks, and 7-day plan
- Idea refinement actions for cheaper build, B2B, consumer, narrow niche, landing copy, MVP list, Reddit post, cold email, and ads
- Team execution page at `/execution` with owner, status, priority, progress, blockers, and next step tracking
- Own research adapter layer with mock mode plus optional live Reddit, Hacker News, GitHub, and web-style sources

## Local Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run dev
```

Open `http://localhost:3000`.

The app also works without a database in local mock mode because the UI and API use an in-memory demo store for the MVP.

## Environment Variables

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/signalideas"
SIGNAL_RESEARCH_MODE=mock
GITHUB_TOKEN=""
```

## Research Modes

SignalIdeas does not require Last30Days.

When `SIGNAL_RESEARCH_MODE=mock`, SignalIdeas uses realistic local sample signals. This is the recommended setting for demos and early production until persistence and API limits are configured.

When `SIGNAL_RESEARCH_MODE=live`, SignalIdeas uses its own research adapters:

- Hacker News via Algolia's public HN search API
- GitHub Issues via GitHub Search API
- Reddit via public Reddit JSON search
- Web/reviews through the local fallback adapter

If a live source fails or returns too little data, the composite adapter fills the run with mock signals so the product flow still completes. `GITHUB_TOKEN` is optional but recommended in live mode to improve GitHub API rate limits.

## Development Workflow

```bash
npm test
npm run lint
npm run build
```

Useful Prisma commands:

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

## Production Notes

- Replace the demo auth adapter in `src/lib/auth.ts` with Auth.js or Clerk session lookup.
- Replace the in-memory demo store with Prisma reads/writes for multi-user persistence.
- Connect Team, TeamMember, IdeaExecution, and ExecutionUpdate models to real auth roles before inviting external teammates.
- Configure a real PostgreSQL `DATABASE_URL`.
- Keep `SIGNAL_RESEARCH_MODE=mock` for predictable demos, or switch to `live` when you are ready to use public source APIs.
- Add real OpenAI-compatible provider credentials when replacing deterministic local generators.
- On Vercel, set environment variables in the project settings before using database-backed mode.
