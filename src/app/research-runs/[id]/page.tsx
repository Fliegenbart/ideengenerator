import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { getResearchRun } from "@/lib/demo-store";
import { formatDate, sourceLabel } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResearchRunDetailPage({ params }: PageProps) {
  const { id } = await params;
  const run = await getResearchRun(id);

  if (!run) {
    notFound();
  }

  return (
    <>
      <div>
        <Button nativeButton={false} variant="ghost" size="sm" render={<Link href="/research-runs" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to runs
        </Button>
      </div>
      <section className="rounded-lg border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary">{run.mode}</Badge>
            <h1 className="mt-3 font-heading text-3xl font-semibold">{run.topic}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Completed {formatDate(run.completedAt)} with {run.signals.length} signals,
              {run.clusters.length} problem clusters, and {run.ideas.length} ideas.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/ideas" />}>
            View ranked ideas
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
        <div className="mt-6">
          <Progress value={run.progress}>
            <ProgressLabel>Research pipeline</ProgressLabel>
            <ProgressValue value={run.progress} />
          </Progress>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {run.clusters.map((cluster) => (
          <Card key={cluster.id} className="rounded-lg">
            <CardHeader>
              <CardTitle>{cluster.label}</CardTitle>
              <CardDescription>{cluster.audience}</CardDescription>
              <CardAction>
                <Badge variant="outline">{cluster.signalCount}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              {cluster.problem}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Source mix</CardTitle>
            <CardDescription>Where the mock signals came from</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {[...new Set(run.signals.map((signal) => signal.source))].map((source) => (
              <Badge key={source} variant="outline">
                {sourceLabel(source)}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {run.ideas.slice(0, 4).map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </section>
    </>
  );
}
