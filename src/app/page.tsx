import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CircleDollarSignIcon,
  Layers3Icon,
  LightbulbIcon,
  PaletteIcon,
  SparklesIcon,
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
import { IdeaCard } from "@/components/ideas/idea-card";
import { IdeaTheater } from "@/components/visuals/idea-theater";
import { getDashboardSnapshot } from "@/lib/demo-store";
import { formatDate } from "@/lib/format";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();
  const latestRun = snapshot.latestRun;
  const topIdea = snapshot.ideas[0];

  return (
    <>
      <section className="grid items-stretch gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-panel relative overflow-hidden rounded-[34px] border border-border/70 p-7 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-36 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_16%,transparent),transparent_68%)]" />
          <div className="relative flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit bg-white/80 text-foreground shadow-sm">
              <SparklesIcon data-icon="inline-start" />
              Ideenatelier
            </Badge>
            <div className="max-w-4xl">
              <h1 className="font-heading text-4xl font-semibold leading-[1.03] sm:text-6xl">
                Aus einem Thema wird ein Startpunkt.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                SignalIdeas fuehlt sich wie ein kreativer Arbeitsraum an: Thema eingeben,
                Ideen bekommen, Favoriten sammeln und gemeinsam weiterbauen.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[26px] border border-white/70 bg-white/75 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <LightbulbIcon className="size-4 text-accent" />
                  Lieblingsfund
                </div>
                <div className="mt-2 font-heading text-lg font-semibold">{topIdea.title}</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{topIdea.audience}</p>
              </div>
              <div className="rounded-[26px] border border-white/70 bg-foreground p-5 text-background shadow-[0_16px_34px_rgba(15,23,42,0.16)]">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-background/65">
                  <PaletteIcon className="size-4 text-accent" />
                  Kreativmodus
                </div>
                <p className="mt-3 font-heading text-2xl font-semibold leading-tight">
                  Kein endloses Brainstorming. Lieber zehn greifbare Richtungen.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button nativeButton={false} size="lg" render={<Link href="/generate" />}>
                Neue Ideen entdecken
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button nativeButton={false} size="lg" variant="outline" render={<Link href="/execution" />}>
                Team-Board oeffnen
              </Button>
            </div>
          </div>
        </div>

        <IdeaTheater topIdea={topIdea} signalCount={snapshot.signalCount} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[28px]">
          <CardHeader>
            <CardDescription>Heute im Studio</CardDescription>
            <CardTitle className="text-4xl">{snapshot.ideas.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Ideen liegen bereit, jede mit erstem Angebot, MVP und Validierungsschritt.
          </CardContent>
        </Card>
        <Card className="rounded-[28px]">
          <CardHeader>
            <CardDescription>Frische Impulse</CardDescription>
            <CardTitle className="text-4xl">{snapshot.signalCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Kleine Hinweise aus Thema, Zielgruppe und Marktgefuehl werden zu Ideenmaterial.
          </CardContent>
        </Card>
        <Card className="rounded-[28px]">
          <CardHeader>
            <CardDescription>Team-Spur</CardDescription>
            <CardTitle className="flex items-center gap-2 text-4xl">
              <Layers3Icon className="size-8 text-primary" />
              Live
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Aus Favoriten werden Aufgaben mit Owner, Status, Fortschritt und naechstem Schritt.
          </CardContent>
        </Card>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="grid gap-4">
          <Card className="rounded-[24px]">
            <CardHeader>
              <CardDescription>Letzter Lauf</CardDescription>
              <CardTitle>{latestRun.topic}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                <span>Modus</span>
                <span className="font-mono text-foreground">{latestRun.mode}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                <span>Ideen</span>
                <span className="font-mono text-foreground">{latestRun.ideaIds.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2">
                <span>Erstellt</span>
                <span className="font-mono text-foreground">{formatDate(latestRun.completedAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px]">
            <CardHeader>
              <CardDescription>Naechster Funke</CardDescription>
              <CardTitle>Teste die staerkste Idee klein und sichtbar.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                {topIdea.title} hat gerade den besten Mix aus Zielgruppe, Machbarkeit und erstem Angebot.
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

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Ideen, die kribbeln</h2>
              <p className="text-sm text-muted-foreground">
                Such dir eine Richtung aus, die du diese Woche wirklich ausprobieren willst.
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
          <h2 className="font-heading text-2xl font-semibold">Woraus die Ideen entstehen</h2>
          <p className="text-sm text-muted-foreground">
            Nicht trocken analysiert, sondern als Ausgangspunkte fuer neue Angebote.
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
                    Kaufmoment
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
