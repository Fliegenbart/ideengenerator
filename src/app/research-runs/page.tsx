import Link from "next/link";
import { ArrowRightIcon, DatabaseZapIcon } from "lucide-react";
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
import { listResearchRuns } from "@/lib/demo-store";
import { formatDate } from "@/lib/format";

export default async function ResearchRunsPage() {
  const runs = await listResearchRuns();

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Research runs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Recent demand research jobs and their generated idea sets.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/generate" />}>
          New run
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </header>
      <div className="grid gap-4">
        {runs.map((run) => (
          <Card key={run.id} className="rounded-lg">
            <CardHeader>
              <CardTitle>{run.topic}</CardTitle>
              <CardDescription>
                {run.signalIds.length} signals · {run.ideaIds.length} ideas · {formatDate(run.completedAt)}
              </CardDescription>
              <CardAction>
                <Badge variant="secondary">{run.status}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Progress value={run.progress}>
                <ProgressLabel>
                  <DatabaseZapIcon data-icon="inline-start" />
                  Pipeline progress
                </ProgressLabel>
                <ProgressValue value={run.progress} />
              </Progress>
              <Button nativeButton={false} variant="outline" render={<Link href={`/research-runs/${run.id}`} />}>
                Open run
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
