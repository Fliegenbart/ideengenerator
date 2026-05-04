import {
  LightbulbIcon,
  MapIcon,
  MessageSquareQuoteIcon,
  PenLineIcon,
  RocketIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { ScoredIdea } from "@/lib/demo-store";

type IdeaTheaterProps = {
  topIdea: ScoredIdea;
  signalCount: number;
};

const cueCards = [
  {
    icon: MessageSquareQuoteIcon,
    label: "Gefunden",
    text: "Wiederholte Wuensche und kleine Frust-Momente werden zu Rohmaterial.",
  },
  {
    icon: PenLineIcon,
    label: "Geformt",
    text: "Aus dem Thema entsteht eine Idee mit MVP, Preislogik und erstem Angebot.",
  },
  {
    icon: RocketIcon,
    label: "Gestartet",
    text: "Die beste Idee wandert direkt in eine umsetzbare Team-Spur.",
  },
];

export function IdeaTheater({ topIdea, signalCount }: IdeaTheaterProps) {
  return (
    <div className="paper-stage relative min-h-[560px] overflow-hidden rounded-[34px] border border-white/70 p-5 shadow-[0_28px_80px_rgba(30,41,59,0.12)] sm:p-6">
      <div className="absolute inset-x-0 top-8 overflow-hidden border-y border-foreground/10 bg-white/35 py-2">
        <div className="signal-ribbon flex w-[200%] gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {Array.from({ length: 2 }).map((_, group) => (
            <div key={group} className="flex min-w-1/2 gap-3">
              <span>Problem</span>
              <span className="text-primary">Idea</span>
              <span>Offer</span>
              <span className="text-accent">Prototype</span>
              <span>Team</span>
              <span>Launch</span>
              <span>Problem</span>
              <span className="text-primary">Idea</span>
              <span>Offer</span>
              <span className="text-accent">Prototype</span>
            </div>
          ))}
        </div>
      </div>

      <svg
        aria-hidden="true"
        className="absolute inset-x-6 top-24 h-36 w-[calc(100%-3rem)] text-primary/45"
        viewBox="0 0 620 160"
        fill="none"
      >
        <path
          className="spark-line"
          d="M20 112 C120 18 180 146 282 72 C384 -2 430 130 596 38"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative mt-20 grid gap-4">
        <div
          className="idea-postcard ml-auto max-w-[20rem] rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_22px_55px_rgba(15,23,42,0.14)]"
          style={{ "--tilt": "3deg" } as CSSProperties}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <SparklesIcon className="size-4 text-accent" />
            Ideenfund
          </div>
          <h3 className="mt-4 font-heading text-2xl font-semibold leading-tight">{topIdea.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{topIdea.oneLiner}</p>
        </div>

        <div
          className="idea-postcard max-w-[16rem] rounded-[28px] border border-white/80 bg-foreground p-5 text-background shadow-[0_22px_55px_rgba(15,23,42,0.2)]"
          style={{ "--tilt": "-4deg" } as CSSProperties}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-background/65">
            <LightbulbIcon className="size-4 text-accent" />
            Inspiration
          </div>
          <div className="mt-5 font-heading text-5xl font-semibold">{topIdea.score.total}</div>
          <p className="mt-2 text-sm leading-6 text-background/75">Score fuer das erste Experiment.</p>
        </div>

        <div
          className="idea-postcard ml-auto max-w-[18rem] rounded-[28px] border border-white/80 bg-accent p-5 text-accent-foreground shadow-[0_22px_55px_rgba(194,82,35,0.2)]"
          style={{ "--tilt": "5deg" } as CSSProperties}
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-accent-foreground/75">
            <UsersIcon className="size-4" />
            Gemeinsam
          </div>
          <p className="mt-5 font-heading text-2xl font-semibold leading-tight">
            Von Idee zu Umsetzung, ohne dass sie im Notizbuch verschwindet.
          </p>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
        {cueCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className="rounded-2xl border border-white/70 bg-white/70 p-3 backdrop-blur">
              <div className="flex items-center gap-2 font-heading text-sm font-semibold">
                <Icon className="size-4 text-primary" />
                {card.label}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{card.text}</p>
            </div>
          );
        })}
      </div>

      <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
        {signalCount} Impulse
      </div>
      <div className="absolute bottom-32 right-6 hidden items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-2 text-xs text-muted-foreground shadow-sm sm:flex">
        <MapIcon className="size-4 text-primary" />
        Idee, Plan, Team
      </div>
    </div>
  );
}
