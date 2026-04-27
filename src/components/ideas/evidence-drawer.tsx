"use client";

import { ExternalLinkIcon, FileSearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sourceLabel } from "@/lib/format";

type Citation = {
  id: string;
  source: string;
  url: string;
  snippet: string;
  relevance: number;
};

export function EvidenceDrawer({
  title,
  citations,
}: {
  title: string;
  citations: Citation[];
}) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <FileSearchIcon data-icon="inline-start" />
        Evidence
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Evidence</SheetTitle>
          <SheetDescription>{title}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
          <div className="flex flex-col gap-3">
            {citations.map((citation) => (
              <article
                key={citation.id}
                className="rounded-lg border bg-background p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{sourceLabel(citation.source)}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {Math.round(citation.relevance * 100)}% match
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground/85">
                  {citation.snippet}
                </p>
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Open source
                  <ExternalLinkIcon data-icon="inline-end" />
                </a>
              </article>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
