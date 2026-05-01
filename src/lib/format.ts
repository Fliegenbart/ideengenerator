export function formatDate(date: Date | string | undefined) {
  if (!date) {
    return "n/a";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatScore(score: number) {
  return `${Math.round(score)}`;
}

export function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    reddit: "Reddit",
    hackernews: "HN",
    youtube: "YouTube",
    twitter: "X",
    github: "GitHub",
    polymarket: "Polymarket",
    web: "Web",
    reviews: "Reviews",
  };

  return labels[source] ?? source;
}
