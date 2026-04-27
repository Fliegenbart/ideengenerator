import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  GaugeIcon,
  ShieldAlertIcon,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { EvidenceDrawer } from "@/components/ideas/evidence-drawer";
import { RefinePanel } from "@/components/ideas/refine-panel";
import { getIdea } from "@/lib/demo-store";
import { sourceLabel } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item} className="rounded-lg border bg-card p-3 text-sm leading-6">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function IdeaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const idea = await getIdea(id);

  if (!idea) {
    notFound();
  }

  return (
    <>
      <div>
        <Button nativeButton={false} variant="ghost" size="sm" render={<Link href="/ideas" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to ideas
        </Button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{idea.businessModel}</Badge>
                  <Badge variant="outline">Rank #{idea.scoreRank}</Badge>
                  <Badge variant="outline">Fit {idea.fitScore}</Badge>
                </div>
                <h1 className="mt-4 max-w-4xl font-heading text-3xl font-semibold">
                  {idea.title}
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                  {idea.oneLiner}
                </p>
              </div>
              <div className="flex size-16 items-center justify-center rounded-lg bg-primary text-2xl font-semibold text-primary-foreground">
                {idea.score.total}
              </div>
            </div>
            <Separator className="my-5" />
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GaugeIcon data-icon="inline-start" />
                  Difficulty
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{idea.buildDifficulty}/100</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CircleDollarSignIcon data-icon="inline-start" />
                  Monetization
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{idea.monetization[0]}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldAlertIcon data-icon="inline-start" />
                  Main risk
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{idea.risks[0]}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Problem</CardTitle>
                <CardDescription>{idea.audience}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {idea.problem}
              </CardContent>
            </Card>
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Solution</CardTitle>
                <CardDescription>{idea.whyNow}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {idea.solution}
              </CardContent>
            </Card>
          </div>

          <ListBlock title="MVP scope" items={idea.mvp} />
          <ListBlock title="GTM channels" items={idea.gtm} />
          <ListBlock title="Competitors and alternatives" items={idea.competitors} />
          <ListBlock title="Validation experiments" items={idea.validationPlan} />
          <ListBlock title="Risks" items={idea.risks} />
          <ListBlock title="First 7-day execution plan" items={idea.executionPlan7Day ?? []} />
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Score breakdown</CardTitle>
              <CardDescription>{idea.score.summary}</CardDescription>
              <CardAction>
                <EvidenceDrawer title={idea.title} citations={idea.citations} />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {idea.score.components.map((component) => (
                <div key={component.name} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{component.name}</span>
                    <Badge variant="secondary">{component.value}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {component.explanation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Evidence sources</CardTitle>
              <CardDescription>{idea.signals.length} normalized source signals</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {idea.signals.slice(0, 6).map((signal) => (
                <a
                  key={signal.id}
                  href={signal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border p-3 text-sm hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{sourceLabel(signal.source)}</Badge>
                    <CheckCircle2Icon data-icon="inline-start" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-muted-foreground">{signal.title}</p>
                </a>
              ))}
            </CardContent>
          </Card>

          <RefinePanel ideaId={idea.id} />
        </aside>
      </section>
    </>
  );
}
