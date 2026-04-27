"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangleIcon, ExternalLinkIcon, SaveIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ExecutionItemRecord,
  ExecutionPriority,
  ExecutionStatus,
  TeamRecord,
} from "@/lib/demo-store";
import { cn } from "@/lib/utils";

const statusLabels: Record<ExecutionStatus, string> = {
  backlog: "Backlog",
  validating: "Validierung",
  building: "Bau",
  launched: "Live",
  paused: "Pausiert",
};

const priorityLabels: Record<ExecutionPriority, string> = {
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
};

type ExecutionTableProps = {
  team: TeamRecord;
  executionItems: ExecutionItemRecord[];
};

export function ExecutionTable({ team, executionItems }: ExecutionTableProps) {
  const [items, setItems] = useState(executionItems);
  const [savingId, setSavingId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const active = items.filter((item) => item.status === "validating" || item.status === "building").length;
    const blocked = items.filter((item) => item.blockers.length > 0).length;
    const averageProgress = Math.round(
      items.reduce((sum, item) => sum + item.progress, 0) / Math.max(items.length, 1)
    );

    return { active, blocked, averageProgress };
  }, [items]);

  async function updateItem(id: string, patch: Partial<ExecutionItemRecord> & { ownerId?: string }) {
    setSavingId(id);
    const previous = items;
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const owner = patch.ownerId
          ? team.members.find((member) => member.id === patch.ownerId) ?? item.owner
          : item.owner;

        return {
          ...item,
          ...patch,
          owner,
          updatedAt: new Date(),
        };
      })
    );

    const response = await fetch(`/api/execution/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: patch.status,
        priority: patch.priority,
        progress: patch.progress,
        ownerId: patch.ownerId,
        nextStep: patch.nextStep,
        blockers: patch.blockers,
      }),
    });

    if (!response.ok) {
      setItems(previous);
    }

    setSavingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-semibold">{items.length}</div>
          <div className="text-sm text-muted-foreground">Ideen in Umsetzung</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-semibold">{summary.active}</div>
          <div className="text-sm text-muted-foreground">Aktiv in Arbeit</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-semibold">{summary.averageProgress}%</div>
          <div className="text-sm text-muted-foreground">Durchschnittlicher Fortschritt</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <UsersIcon data-icon="inline-start" />
            {team.members.length}
          </div>
          <div className="text-sm text-muted-foreground">Teammitglieder mit Zugriff</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold">Umsetzungs-Tabelle</h2>
            <p className="text-sm text-muted-foreground">
              Team: {team.name}. Änderungen werden im MVP in der Demo-API gespeichert.
            </p>
          </div>
          <AvatarGroup>
            {team.members.map((member) => (
              <Avatar key={member.id} title={`${member.name} · ${member.role}`}>
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-72">Idee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Mitwirkende</TableHead>
              <TableHead>Priorität</TableHead>
              <TableHead className="min-w-48">Fortschritt</TableHead>
              <TableHead className="min-w-80">Nächster Schritt</TableHead>
              <TableHead>Blocker</TableHead>
              <TableHead>Fällig</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="whitespace-normal">
                  <div className="flex max-w-md flex-col gap-1">
                    <Link
                      href={`/ideas/${item.ideaId}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {item.ideaTitle}
                      <ExternalLinkIcon className="ml-1 inline size-3" />
                    </Link>
                    <span className="text-xs leading-5 text-muted-foreground">{item.ideaOneLiner}</span>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Score {item.score}</Badge>
                      <Badge variant="outline">{item.businessModel}</Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <select
                    className="h-8 rounded-lg border bg-background px-2 text-sm"
                    value={item.status}
                    onChange={(event) =>
                      updateItem(item.id, { status: event.target.value as ExecutionStatus })
                    }
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <AvatarGroup>
                    {item.collaborators.map((member) => (
                      <Avatar key={member.id} size="sm" title={`${member.name} · ${member.role}`}>
                        <AvatarFallback>{member.initials}</AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </TableCell>
                <TableCell>
                  <select
                    className="h-8 rounded-lg border bg-background px-2 text-sm"
                    value={item.owner.id}
                    onChange={(event) => updateItem(item.id, { ownerId: event.target.value })}
                  >
                    {team.members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <select
                    className="h-8 rounded-lg border bg-background px-2 text-sm"
                    value={item.priority}
                    onChange={(event) =>
                      updateItem(item.id, { priority: event.target.value as ExecutionPriority })
                    }
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <div className="flex min-w-44 flex-col gap-2">
                    <Progress value={item.progress}>
                      <ProgressLabel className="text-xs">{item.stage}</ProgressLabel>
                      <ProgressValue value={item.progress} />
                    </Progress>
                    <input
                      aria-label={`Fortschritt fuer ${item.ideaTitle}`}
                      className="w-full accent-primary"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={item.progress}
                      onChange={(event) =>
                        updateItem(item.id, { progress: Number(event.target.value) })
                      }
                    />
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <textarea
                    className="min-h-20 w-full min-w-72 rounded-lg border bg-background p-2 text-sm leading-5"
                    value={item.nextStep}
                    onChange={(event) => {
                      const nextStep = event.target.value;
                      setItems((current) =>
                        current.map((candidate) =>
                          candidate.id === item.id ? { ...candidate, nextStep } : candidate
                        )
                      );
                    }}
                    onBlur={(event) => updateItem(item.id, { nextStep: event.target.value })}
                  />
                  {savingId === item.id ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <SaveIcon data-icon="inline-start" />
                      Speichert
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="flex max-w-44 flex-wrap gap-1">
                    {item.blockers.length > 0 ? (
                      item.blockers.map((blocker) => (
                        <Badge key={blocker} variant="destructive" className="h-auto whitespace-normal">
                          <AlertTriangleIcon data-icon="inline-start" />
                          {blocker}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">Keine</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm tabular-nums",
                      item.blockers.length > 0 && "font-medium text-destructive"
                    )}
                  >
                    {new Intl.DateTimeFormat("de-DE", {
                      month: "short",
                      day: "2-digit",
                    }).format(new Date(item.dueDate))}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
