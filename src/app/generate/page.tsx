import { GenerateForm } from "@/components/generate/generate-form";

export default function GeneratePage() {
  return (
    <>
      <header>
        <h1 className="font-heading text-3xl font-semibold">Generate ideas</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Enter a niche, founder context, budget, and preferred business type. The
          local MVP runs the full research-to-ideas pipeline in mock mode.
        </p>
      </header>
      <GenerateForm />
    </>
  );
}
