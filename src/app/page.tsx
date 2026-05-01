import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CircleDollarSignIcon,
  ClockIcon,
  DatabaseZapIcon,
  Layers3Icon,
  LightbulbIcon,
  RadioTowerIcon,
  ScanSearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
  const topIdea = snapshot.ideas[0];

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-panel data-grid relative overflow-hidden rounded-[28px] border border-border/70 p-7 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary/14 via-transparent to-accent/12" />
          <div className="relative flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit bg-white/80 text-foreground shadow-sm">
              <RadioTowerIcon data-icon="inline-start" />
              Opportunity workbench
            </Badge>
            <div className="max-w-4xl">
              <h1 className="font-heading text-4xl font-semibold leading-tight sm:text-5xl">
                Finde Ideen, die nach echter Nachfrage aussehen und nicht nur nach Bauchgefuehl.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                SignalIdeas verdichtet Themen, Zielgruppen und Hinweise aus deinem Markt in konkrete Ideen,
                bewertet sie und gibt deinem Team direkt eine Umsetzungsansicht.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Top idea</div>
                <div className="mt-2 font-heading text-lg font-semibold">{topIdea.title}</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{topIdea.audience}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Research mode</div>
                <div className="mt-2 flex items-center gap-2 font-heading text-lg font-semibold">
                  <ScanSearchIcon className="size-4 text-primary" />
                  {latestRun.mode}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {latestRun.signalIds.length} Signale in dieser Runde
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Execution</div>
                <div className="mt-2 flex items-center gap-2 font-heading text-lg font-semibold">
                  <Layers3Icon className="size-4 text-accent" />
                  Team-ready
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Ideen direkt in Aufgaben und Owner ueberfuehren
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button nativeButton={false} size="lg" render={<Link href="/generate" />}>
                Ideen erzeugen
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button nativeButton={false} size="lg" variant="outline" render={<Link href="/execution" />}>
                Umsetzung ansehen
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <Card className="rounded-[24px]">
            <CardHeader>
              <CardDescription>Aktuelle Lage</CardDescription>
              <CardTitle className="text-3xl">{snapshot.signalCount}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                <span>Signale gesamt</span>
                <span className="font-mono text-foreground">{snapshot.signalCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                <span>Top-Ideen im Fokus</span>
                <span className="font-mono text-foreground">{snapshot.ideas.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                <span>Letzte Recherche</span>
                <span className="font-mono text-foreground">{formatDate(latestRun.completedAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px]">
            <CardHeader>
              <CardDescription>Naechster sinnvoller Schritt</CardDescription>
              <CardTitle>Arbeite mit der staerksten Idee weiter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                {topIdea.title} ist aktuell am staerksten, weil Score, Founder-Fit und klare Distribution zusammenpassen.
              </p>
              <div className="rounded-2xl border border-border/70 bg-muted/55 p-4">
                <div className="font-medium text-foreground">{topIdea.validationPlan[0]}</div>
                <p className="mt-1 text-sm text-muted-foreground">{topIdea.whyNow}</p>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Score {topIdea.score.total}
              </span>
              <Button nativeButton={false} variant="outline" render={<Link href={`/ideas/${topIdea.id}`} />}>
                Idee oeffnen
                <ArrowUpRightIcon data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="rounded-[24px]">
          <CardHeader>
            <CardTitle>Research progress</CardTitle>
            <CardDescription>
              Letzter Lauf: {latestRun.topic} · {formatDate(latestRun.completedAt)}
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
                {latestRun.signalIds.length} Signale gesammelt
              </div>
              <div className="flex items-center gap-2">
                <LightbulbIcon data-icon="inline-start" />
                {latestRun.ideaIds.length} Ideen generiert
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon data-icon="inline-start" />
                Bereit fuer Validierung und Team-Tracking
              </div>
            </div>
            <Button nativeButton={false} variant="outline" render={<Link href={`/research-runs/${latestRun.id}`} />}>
              Lauf oeffnen
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Staerkste Ideen</h2>
              <p className="text-sm text-muted-foreground">
                Priorisiert nach Nachfragebild, Founder-Fit und Umsetzbarkeit.
              </p>
            </div>
            <Button nativeButton={false} variant="outline" render={<Link href="/ideas" />}>
              Alle Ideen
            </Button>
          </div>
          <div className="grid gap-4">
            {snapshot.ideas.slice(0, 3).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Problem-Cluster</h2>
          <p className="text-sm text-muted-foreground">
            Das sind die wiederkehrenden Themen, aus denen deine Ideen entstehen.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.clusters.map((cluster) => (
            <Card key={cluster.id} className="rounded-[24px]">
              <CardHeader>
                <CardTitle>{cluster.label}</CardTitle>
                <CardDescription>{cluster.audience}</CardDescription>
                <CardAction>
                  <Badge variant="outline">{cluster.signalCount} Signale</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-6 text-muted-foreground">{cluster.problem}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-muted/65 p-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">WTP</div>
                    <div className="mt-1 font-heading text-lg font-semibold">
                      {Math.round(cluster.willingnessToPay * 100)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted/65 p-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Pain</div>
                    <div className="mt-1 font-heading text-lg font-semibold">
                      {Math.round(cluster.painIntensity * 100)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <CircleDollarSignIcon data-icon="inline-start" />
                    Budget signal
                  </Badge>
                  {(cluster.keywords ?? []).slice(0, 2).map((keyword) => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
