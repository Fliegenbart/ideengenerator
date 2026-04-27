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
- Isolated Last30Days adapter boundary

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
LAST30DAYS_ENABLED=false
LAST30DAYS_COMMAND=""
LAST30DAYS_API_URL=""
```

## Last30Days Integration

The integration is isolated in `src/services/last30days.ts`.

When `LAST30DAYS_ENABLED=false`, SignalIdeas uses `MockResearchAdapter`.

When `LAST30DAYS_ENABLED=true`, the service tries:

1. `LAST30DAYS_API_URL`: POSTs `{ topic, options }` to an API endpoint.
2. `LAST30DAYS_COMMAND`: runs a shell command with the topic argument and passes options through `LAST30DAYS_OPTIONS`.
3. Mock fallback if neither is configured.

The expected external result is JSON with a `signals` array matching the normalized Signal shape from `src/lib/research/types.ts`.

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
- Configure Last30Days via API or command if available.
- Add real OpenAI-compatible provider credentials when replacing deterministic local generators.
- On Vercel, set environment variables in the project settings before using database-backed mode.
