import Link from "next/link";
import { ArrowRightIcon, GaugeIcon, HammerIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { EvidenceDrawer } from "@/components/ideas/evidence-drawer";
import { formatScore, sourceLabel } from "@/lib/format";
import type { ScoredIdea } from "@/lib/demo-store";

export function IdeaCard({ idea }: { idea: ScoredIdea }) {
  const sources = [...new Set(idea.citations.map((citation) => citation.source))].slice(0, 4);

  return (
    <Card className="group rounded-[28px] transition-transform duration-300 hover:-translate-y-1">
      <CardHeader>
        <CardTitle>
          <Link href={`/ideas/${idea.id}`} className="hover:text-primary hover:underline">
            {idea.title}
          </Link>
        </CardTitle>
        <CardDescription>{idea.oneLiner}</CardDescription>
        <CardAction>
          <div className="flex size-14 items-center justify-center rounded-[22px] bg-primary text-lg font-semibold text-primary-foreground shadow-[0_12px_28px_rgba(13,148,136,0.22)] transition-transform duration-300 group-hover:rotate-3">
            {formatScore(idea.score.total)}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-secondary/80">{idea.businessModel}</Badge>
          <Badge variant="outline">
            <GaugeIcon data-icon="inline-start" />
            Fit {idea.fitScore}
          </Badge>
          <Badge variant="outline">
            <HammerIcon data-icon="inline-start" />
            Difficulty {idea.buildDifficulty}
          </Badge>
          {sources.map((source) => (
            <Badge key={source} variant="outline">
              {sourceLabel(source)}
            </Badge>
          ))}
        </div>
        <div className="rounded-[24px] border border-white/70 bg-muted/60 p-4">
          <p className="text-sm leading-6 text-muted-foreground">{idea.insight}</p>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <EvidenceDrawer title={idea.title} citations={idea.citations} />
        <Button nativeButton={false} render={<Link href={`/ideas/${idea.id}`} />}>
          Open
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}
