"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { projects as seedProjects, type Project } from "@/lib/demo-data";

type CommunityContextValue = {
  projects: Project[];
  bookmarked: string[];
  publish: (input: Pick<Project, "name" | "tagline" | "description" | "tags" | "repo">) => void;
  toggleBookmark: (slug: string) => void;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);
const storageKey = "codebloom-community-v1";

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (!saved) return;
        const parsed = JSON.parse(saved) as { projects?: Project[]; bookmarked?: string[] };
        if (Array.isArray(parsed.projects)) setProjects(parsed.projects);
        if (Array.isArray(parsed.bookmarked)) setBookmarked(parsed.bookmarked);
      } catch { /* A malformed preview cache should never break the app. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { window.localStorage.setItem(storageKey, JSON.stringify({ projects, bookmarked })); } catch { /* Storage is optional. */ }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [projects, bookmarked]);

  const value = useMemo<CommunityContextValue>(() => ({
    projects,
    bookmarked,
    publish(input) {
      const slug = `${input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
      setProjects((current) => [{
        ...input, slug, author: "You", handle: "you", initials: "YO", avatarTone: "plum",
        status: "Just launched", statusTone: "green", votes: 0, comments: 0, time: "just now", art: "garden",
      }, ...current]);
    },
    toggleBookmark(slug) { setBookmarked((current) => current.includes(slug) ? current.filter((id) => id !== slug) : [...current, slug]); },
  }), [bookmarked, projects]);

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) throw new Error("useCommunity must be used inside CommunityProvider");
  return context;
}
