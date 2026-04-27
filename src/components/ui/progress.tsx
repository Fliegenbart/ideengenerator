"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function clamp(value: number | null | undefined) {
  return Math.max(0, Math.min(100, Number(value ?? 0)));
}

function Progress({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<"div"> & { value?: number | null }) {
  const safeValue = clamp(value);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator style={{ width: `${safeValue}%` }} />
      </ProgressTrack>
    </div>
  );
}

function ProgressTrack({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  );
}

function ProgressIndicator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="progress-indicator"
      className={cn("h-full rounded-full bg-primary transition-all", className)}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

function ProgressValue({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & { value?: number | null }) {
  return (
    <div
      className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)}
      data-slot="progress-value"
      {...props}
    >
      {clamp(value)}%
    </div>
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
};
