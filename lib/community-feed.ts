import type { Project } from "@/lib/demo-data";

export const previewFeedModes = ["For you", "Hot", "New", "Top", "Rising", "Following"] as const;
export type PreviewFeedMode = (typeof previewFeedModes)[number];

function ageInHours(value: string): number {
  const normalized = value.trim().toLowerCase();
  if (normalized === "just now" || normalized === "now") return 0;
  const match = normalized.match(/^(\d+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days)\s+ago$/);
  if (!match) return Number.POSITIVE_INFINITY;
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit.startsWith("m")) return amount / 60;
  if (unit.startsWith("d")) return amount * 24;
  return amount;
}

function byStableScore(projects: Project[], score: (project: Project) => number): Project[] {
  return projects
    .map((project, index) => ({ project, index, score: score(project) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ project }) => project);
}

/** Preview-only feed ordering over fixture/browser-local data. Server ranking is a later phase. */
export function getPreviewFeed(projects: Project[], mode: PreviewFeedMode, query = ""): Project[] {
  const normalizedQuery = query.trim().toLowerCase();
  const matching = normalizedQuery
    ? projects.filter((project) => [project.name, project.tagline, project.description, project.author, project.handle, project.repo, ...project.tags].join(" ").toLowerCase().includes(normalizedQuery))
    : [...projects];

  switch (mode) {
    case "New":
      return matching
        .map((project, index) => ({ project, index, age: ageInHours(project.time) }))
        .sort((a, b) => a.age - b.age || a.index - b.index)
        .map(({ project }) => project);
    case "Top":
      return byStableScore(matching, (project) => project.votes);
    case "Hot":
      return byStableScore(matching, (project) => (project.votes + project.comments * 2) / Math.pow(ageInHours(project.time) + 2, 1.25));
    case "Rising":
      return byStableScore(matching, (project) => (project.votes + project.comments * 4) / Math.pow(ageInHours(project.time) + 1, 1.5));
    case "Following":
      // There is no authenticated follow graph in this preview; do not fabricate one.
      return [];
    case "For you":
    default:
      return matching;
  }
}
