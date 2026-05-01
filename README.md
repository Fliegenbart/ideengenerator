# SignalIdeas

AI-powered startup idea generation and execution tracking.

SignalIdeas turns a topic, target audience, skills, and budget into structured startup ideas, scores them, and lets a team track execution progress.

## What Works In This MVP

- Founder profile with skills, interests, budget, hours, business model, and risk tolerance
- OpenAI-powered idea generation when `OPENAI_API_KEY` is configured
- Mock idea generation for demos and local development when no API key is configured
- Built-in sample niches for:
  - AI video tools
  - creator economy
  - solo founder productivity
  - B2B compliance
  - developer tools
  - local service businesses
- Normalized signal model so AI-generated or source-based evidence can use the same UI
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
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
AI_IDEA_ENGINE="openai"
SIGNAL_RESEARCH_MODE=mock
GITHUB_TOKEN=""
```

## AI Idea Engine

SignalIdeas does not require Last30Days.

The simplest production setup is:

```bash
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"
AI_IDEA_ENGINE="openai"
SIGNAL_RESEARCH_MODE=mock
```

With this setup, every generate request asks OpenAI to create a complete idea run: demand-style signals, problem clusters, startup ideas, MVP scope, monetization, GTM, risks, and a 7-day plan.

If `OPENAI_API_KEY` is missing, the app automatically falls back to local mock ideas so the product still works.

`SIGNAL_RESEARCH_MODE=live` is optional. It uses Hacker News, GitHub Issues, Reddit, and web/review fallback adapters. For your current goal, OpenAI mode plus mock fallback is simpler.

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
- Set `OPENAI_API_KEY` for real AI-generated ideas.
- Keep `SIGNAL_RESEARCH_MODE=mock` unless you explicitly want public source adapters later.
- On Vercel, set environment variables in the project settings before using database-backed mode.
