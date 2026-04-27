# SignalIdeas MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable local MVP for SignalIdeas that researches mock demand signals, clusters problems, generates and scores startup ideas, and lets users inspect and refine them.

**Architecture:** Next.js App Router hosts the product UI and API routes. Domain logic lives in `src/lib` behind small interfaces so mock mode works locally and Last30Days can be enabled later. Prisma models persist users, profiles, research runs, normalized signals, clusters, ideas, scores, refinements, and citations.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Prisma PostgreSQL schema, Zod, Vitest, simple in-process queue abstraction, OpenAI-compatible LLM abstraction.

---

### Task 1: Scaffold

**Files:**
- Create: Next.js app files under `src/app`
- Create: `components.json`
- Create: `prisma/schema.prisma`
- Create: `src/lib/**`
- Create: `src/components/**`

- [ ] Run `npx create-next-app@latest . --yes --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm`.
- [ ] Initialize shadcn with defaults and add UI primitives used by the dashboard.
- [ ] Install Prisma, Zod, Vitest, lucide-react, next-auth-compatible dependencies, and helpers.
- [ ] Fix Tailwind/Geist font variables after shadcn initialization.

### Task 2: Domain Tests First

**Files:**
- Create: `src/lib/research/*.test.ts`
- Create: `src/lib/processing/*.test.ts`
- Create: `src/lib/ideas/*.test.ts`
- Create: `src/lib/scoring/*.test.ts`
- Create: `src/lib/founder-fit/*.test.ts`
- Create: `src/app/api/**/route.test.ts`

- [ ] Add failing tests for signal normalization and mock adapter output.
- [ ] Add failing tests for clustering input/output validation.
- [ ] Add failing tests for scoring components and final 0-100 score.
- [ ] Add failing tests for founder-fit ranking.
- [ ] Add failing tests for API validation on bad requests.

### Task 3: Core Implementation

**Files:**
- Create: `src/lib/research/types.ts`
- Create: `src/lib/research/mock-adapter.ts`
- Create: `src/lib/research/last30days-adapter.ts`
- Create: `src/lib/research/placeholders.ts`
- Create: `src/services/last30days.ts`
- Create: `src/lib/processing/signals.ts`
- Create: `src/lib/processing/clustering.ts`
- Create: `src/lib/ideas/generator.ts`
- Create: `src/lib/scoring/scoring-engine.ts`
- Create: `src/lib/founder-fit/founder-fit.ts`
- Create: `src/lib/llm/**`
- Create: `src/lib/queue/simple-queue.ts`

- [ ] Implement normalized `Signal` and `ResearchAdapter` contracts.
- [ ] Implement realistic mock research for the six requested niches.
- [ ] Implement deduplication, pain extraction, jobs-to-be-done, user segment extraction, workaround hints, WTP hints, urgency, frequency, and problem clustering.
- [ ] Implement deterministic idea generation that creates at least 10 ideas from clusters.
- [ ] Implement scoring with separate components and explanations.
- [ ] Implement founder-fit ranking using skills, budget, business model, hours, and risk tolerance.
- [ ] Implement Last30Days service boundary with env-controlled shell/API integration and mock fallback.

### Task 4: Persistence And API

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`
- Create: `src/lib/demo-store.ts`
- Create: `src/app/api/research-runs/route.ts`
- Create: `src/app/api/research-runs/[id]/route.ts`
- Create: `src/app/api/ideas/route.ts`
- Create: `src/app/api/ideas/[id]/route.ts`
- Create: `src/app/api/ideas/[id]/refine/route.ts`
- Create: `src/app/api/founder-profile/route.ts`
- Create: `src/app/api/ideas/[id]/bookmark/route.ts`

- [ ] Add Prisma models requested in the spec.
- [ ] Add seed data for AI video tools, creator economy, solo founder productivity, B2B compliance, developer tools, and local service businesses.
- [ ] Use Zod validation in API routes.
- [ ] Keep local demo mode runnable without a live database by using deterministic in-memory generation for the UI and tests.

### Task 5: UI

**Files:**
- Create: `src/components/app-shell.tsx`
- Create: `src/components/generate/generate-form.tsx`
- Create: `src/components/ideas/idea-card.tsx`
- Create: `src/components/ideas/evidence-drawer.tsx`
- Create: `src/components/ideas/refine-panel.tsx`
- Create: route pages for `/`, `/generate`, `/ideas`, `/ideas/[id]`, `/research-runs/[id]`, `/settings`

- [ ] Build the main dashboard as the first screen.
- [ ] Build generate flow with niche, audience, skills, budget, business type, hours, and risk tolerance.
- [ ] Build filters by niche, score, difficulty, business model, and source.
- [ ] Build idea detail with evidence, MVP scope, monetization, GTM, competitors, validation experiments, risks, and 7-day plan.
- [ ] Build refine actions for cheaper build, B2B, consumer, narrow niche, landing page copy, MVP list, Reddit post, cold email, and ads.
- [ ] Add loading skeletons, empty states, progress state, and responsive mobile layout.

### Task 6: Documentation And Verification

**Files:**
- Create/Modify: `README.md`

- [ ] Document setup, env vars, Last30Days mode, mock mode, migrations, seed, dev workflow, and production notes.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start `npm run dev` and verify the core flow in a browser.
