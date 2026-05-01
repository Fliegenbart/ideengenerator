import { GenerateForm } from "@/components/generate/generate-form";

export default function GeneratePage() {
  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-panel rounded-[28px] border border-border/70 p-7 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Generate</p>
            <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight">
              Lass dir aus einem Thema direkt neue Geschaefts-Ideen zusammenbauen.
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Du gibst Thema, Zielgruppe, Faehigkeiten und Budget ein. Danach erzeugt SignalIdeas einen
              kompletten Ideenlauf mit Score, MVP, Monetarisierung und einem ersten Umsetzungsplan.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-muted/65 p-4">
              <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">1</div>
              <div className="mt-2 font-medium">Thema festlegen</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Suche nach einer Nische oder einem Problemfeld.</p>
            </div>
            <div className="rounded-2xl bg-muted/65 p-4">
              <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">2</div>
              <div className="mt-2 font-medium">Kontext ergaenzen</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Deine Skills und dein Budget machen die Vorschlaege realistischer.</p>
            </div>
            <div className="rounded-2xl bg-muted/65 p-4">
              <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">3</div>
              <div className="mt-2 font-medium">Ideen bewerten</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Oeffne die besten Ideen und schiebe sie danach in die Umsetzung.</p>
            </div>
          </div>
        </div>
        <GenerateForm />
      </section>
    </>
  );
}
