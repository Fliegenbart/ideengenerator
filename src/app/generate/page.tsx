import { GenerateForm } from "@/components/generate/generate-form";

export default function GeneratePage() {
  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="paper-stage relative overflow-hidden rounded-[34px] border border-border/70 p-7 sm:p-8">
          <div className="absolute right-8 top-8 hidden rotate-6 rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_22px_55px_rgba(15,23,42,0.12)] lg:block">
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Notiz</div>
            <div className="mt-3 max-w-48 font-heading text-xl font-semibold leading-tight">
              Was koennte daraus werden?
            </div>
          </div>
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Generate</p>
            <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight">
              Starte mit einem Thema. Lass Ideen daraus wachsen.
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Schreib auf, worueber du nachdenkst. SignalIdeas macht daraus konkrete Richtungen,
              kleine Experimente und erste Angebote, die sich nicht nach leerem Brainstorming anfuehlen.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[26px] bg-white/70 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
              <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">1</div>
              <div className="mt-2 font-heading font-semibold">Thema</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Eine Nische, ein Gefuehl, ein Markt, eine Zielgruppe.</p>
            </div>
            <div className="rounded-[26px] bg-foreground p-4 text-background shadow-[0_12px_28px_rgba(15,23,42,0.14)]">
              <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">2</div>
              <div className="mt-2 font-heading font-semibold">Du</div>
              <p className="mt-1 text-sm leading-6 text-background/75">Skills, Zeit und Budget halten die Ideen bodennah.</p>
            </div>
            <div className="rounded-[26px] bg-accent p-4 text-accent-foreground shadow-[0_12px_28px_rgba(194,82,35,0.14)]">
              <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">3</div>
              <div className="mt-2 font-heading font-semibold">Start</div>
              <p className="mt-1 text-sm leading-6 text-accent-foreground/80">Eine Idee wird erst spannend, wenn du sie testen kannst.</p>
            </div>
          </div>
        </div>
        <GenerateForm />
      </section>
    </>
  );
}
