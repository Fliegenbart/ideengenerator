import Link from "next/link";
import { ArrowRightIcon, ClipboardListIcon } from "lucide-react";
import { ExecutionTable } from "@/components/execution/execution-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listExecutionItems } from "@/lib/demo-store";

export default async function ExecutionPage() {
  const { team, executionItems } = await listExecutionItems();

  return (
    <>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            <ClipboardListIcon data-icon="inline-start" />
            Team execution
          </Badge>
          <h1 className="font-heading text-3xl font-semibold">Ideen weiterverfolgen</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Hier sieht dein Team, welche Ideen noch offen sind, wer verantwortlich ist,
            was als Nächstes passiert und wie weit die Umsetzung ist.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/generate" />}>
          Neue Recherche starten
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </header>

      <ExecutionTable team={team} executionItems={executionItems} />
    </>
  );
}
