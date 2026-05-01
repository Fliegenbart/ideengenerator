import Link from "next/link";
import {
  ArrowRightIcon,
  CircleDollarSignIcon,
  ClockIcon,
  DatabaseZapIcon,
  LightbulbIcon,
  RadioTowerIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { IdeaCard } from "@/components/ideas/idea-card";
import { getDashboardSnapshot } from "@/lib/demo-store";
import { formatDate } from "@/lib/format";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();
  const latestRun = snapshot.latestRun;

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col justify-center gap-5 rounded-lg border bg-card p-6">
          <Badge variant="secondary" className="w-fit">
            <RadioTowerIcon data-icon="inline-start" />
            Recent demand engine
          </Badge>
          <div>
            <h1 className="max-w-3xl font-heading text-3xl font-semibold tracking-normal sm:text-4xl">
              Generate startup ideas from real demand signals, not blank-page brainstorming.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              SignalIdeas collects recent complaints, questions, comparisons, issues,
              reviews, and workaround chatter, then clusters problems into scored MVP ideas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/generate" />}>
              Start research
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button nativeButton={false} variant="outline" render={<Link href="/ideas" />}>
              View ideas
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>{snapshot.signalCount}</CardTitle>
              <CardDescription>Normalized signals</CardDescription>
            </CardHeader>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>{snapshot.ideas.length} top</CardTitle>
              <CardDescription>Ranked ideas in focus</CardDescription>
            </CardHeader>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>{snapshot.researchRunCount}</CardTitle>
              <CardDescription>Research run in this demo</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Research progress</CardTitle>
            <CardDescription>
              Latest run: {latestRun.topic} · {formatDate(latestRun.completedAt)}
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">{latestRun.mode}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Progress value={latestRun.progress}>
              <ProgressLabel>Signal collection, clustering, scoring</ProgressLabel>
              <ProgressValue value={latestRun.progress} />
            </Progress>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-2">
                <DatabaseZapIcon data-icon="inline-start" />
                {latestRun.signalIds.length} signals collected
              </div>
              <div className="flex items-center gap-2">
                <LightbulbIcon data-icon="inline-start" />
                {latestRun.ideaIds.length} ideas generated
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon data-icon="inline-start" />
                Completed in mock mode
              </div>
            </div>
            <Button nativeButton={false} variant="outline" render={<Link href={`/research-runs/${latestRun.id}`} />}>
              Open run
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-semibold">Highest-ranked ideas</h2>
              <p className="text-sm text-muted-foreground">
                Ranked by market signal strength and founder fit.
              </p>
            </div>
            <Button nativeButton={false} variant="outline" render={<Link href="/ideas" />}>
              All ideas
            </Button>
          </div>
          <div className="grid gap-3">
            {snapshot.ideas.slice(0, 3).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">Problem clusters</h2>
          <p className="text-sm text-muted-foreground">
            Recurring pains found across sources.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.clusters.map((cluster) => (
            <Card key={cluster.id} className="rounded-lg">
              <CardHeader>
                <CardTitle>{cluster.label}</CardTitle>
                <CardDescription>{cluster.audience}</CardDescription>
                <CardAction>
                  <Badge variant="outline">{cluster.signalCount} signals</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm leading-6 text-muted-foreground">{cluster.problem}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <CircleDollarSignIcon data-icon="inline-start" />
                    WTP {Math.round(cluster.willingnessToPay * 100)}
                  </Badge>
                  <Badge variant="outline">Pain {Math.round(cluster.painIntensity * 100)}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
