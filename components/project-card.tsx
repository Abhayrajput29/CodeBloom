"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp, Bookmark, ExternalLink, MessageCircle, MoreHorizontal, Sparkles } from "lucide-react";
import { useCommunity } from "@/components/community-provider";
import type { Project } from "@/lib/demo-data";
import { safeHttpsUrl } from "@/lib/urls";

const artDetails: Record<Project["art"], { label: string; mark: string }> = {
  garden: { label: "signal garden / inbox", mark: "◌" },
  ledger: { label: "ledger leaf / overview", mark: "↗" },
  terminal: { label: "patchwork / release notes", mark: "~/" },
  atlas: { label: "little atlas / saved places", mark: "⌖" },
  orbit: { label: "orbit notes / graph view", mark: "◎" },
  studio: { label: "tiny studio / components", mark: "▦" },
};

export function ProjectArtwork({ project }: { project: Project }) {
  return <div className={`project-art art-${project.art}`} aria-label={`${project.name} illustrative preview`} role="img">
    <div className="art-window"><div className="art-window-top"><span /><span /><span /><small>{artDetails[project.art].label}</small></div><div className="art-window-content"><span className="art-mark">{artDetails[project.art].mark}</span><div className="art-lines"><i /><i /><i /></div><div className="art-mini-grid"><b /><b /><b /><b /></div></div></div>
    <span className="art-index">CB / {project.art.slice(0, 3).toUpperCase()}</span>
  </div>;
}

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const [vote, setVote] = useState<0 | 1 | -1>(0);
  const [notice, setNotice] = useState("");
  const { bookmarked, toggleBookmark } = useCommunity();
  const saved = bookmarked.includes(project.slug);
  const score = project.votes + vote;
  const demoUrl = project.demo ? safeHttpsUrl(project.demo) : null;

  function changeVote(next: 1 | -1) {
    setVote((current) => (current === next ? 0 : next));
    setNotice(vote === next ? "Preview vote removed. It has not been sent to a server." : "Preview vote applied in this browser only.");
  }

  return <article className={`project-card${featured ? " project-card-featured" : ""}`}>
    <ProjectArtwork project={project} />
    <div className="project-card-body">
      <div className="project-title-row"><div className={`avatar avatar-${project.avatarTone}`}>{project.initials}</div><div className="project-title-copy"><Link className="project-title" href={`/projects/${project.slug}`}>{project.name}</Link><span className="project-author">by <Link href={`/u/${project.handle}`}>{project.author}</Link> <span className="dot-separator">·</span> {project.time}</span></div><button className="icon-button subtle" type="button" aria-label={`More options for ${project.name}`} title="More options" onClick={() => setNotice("Additional project actions are planned; no content was changed.")}><MoreHorizontal size={19} /></button></div>
      <p className="project-tagline">{project.tagline}</p><p className="project-description">{project.description}</p>
      <div className="project-meta-line"><span className={`status-pill status-${project.statusTone}`}><i />{project.status}</span><span className="repo-label"><span className="repo-dot">◉</span>{project.repo}</span></div>
      <div className="project-tags" aria-label="Technologies">{project.tags.map((tag) => <span className="tag-chip" key={tag}>{tag}</span>)}</div>
      <div className="project-card-footer"><div className="engagement-actions"><div className="vote-control" aria-label={`Preview voting controls for ${project.name}`}><button type="button" aria-label={`Upvote ${project.name} in this preview`} aria-pressed={vote === 1} className={vote === 1 ? "vote-active" : ""} onClick={() => changeVote(1)}><ArrowUp size={15} /></button><span aria-live="polite">{score}</span><button type="button" aria-label={`Downvote ${project.name} in this preview`} aria-pressed={vote === -1} className={vote === -1 ? "vote-active vote-down-active" : ""} onClick={() => changeVote(-1)}><ArrowDown size={15} /></button></div><Link className="engagement-link" href={`/projects/${project.slug}#discussion`} aria-label={`${project.comments} preview comments on ${project.name}`}><MessageCircle size={15} /><span>{project.comments}</span></Link></div><div className="card-links">{demoUrl && <a className="text-link" href={demoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} demo (opens in a new tab)`}>Live demo <ExternalLink size={13} /></a>}<button type="button" className={`icon-button bookmark-button${saved ? " is-saved" : ""}`} aria-label={saved ? `Remove ${project.name} from preview bookmarks` : `Bookmark ${project.name} in this preview`} aria-pressed={saved} onClick={() => { toggleBookmark(project.slug); setNotice(saved ? "Removed from preview bookmarks." : "Saved to preview bookmarks on this device."); }}><Bookmark size={17} fill={saved ? "currentColor" : "none"} /></button></div></div>
      <span className="sr-only" aria-live="polite">{notice}</span>
    </div>
  </article>;
}

export function FeaturedProject({ project }: { project: Project }) {
  return <div className="featured-project"><div className="featured-copy"><span className="eyebrow"><Sparkles size={13} /> COMMUNITY PICK · PREVIEW</span><Link className="featured-title" href={`/projects/${project.slug}`}>{project.name}<span> ↗</span></Link><p>{project.tagline}</p><div className="featured-byline"><div className={`avatar avatar-${project.avatarTone}`}>{project.initials}</div><span>Built by <Link href={`/u/${project.handle}`}>{project.author}</Link></span></div><div className="featured-stats"><span><ArrowUp size={14} /> {project.votes} preview appreciations</span><span><MessageCircle size={14} /> {project.comments} discussions</span></div><Link className="button button-light" href={`/projects/${project.slug}`}>Explore project <ExternalLink size={14} /></Link></div><ProjectArtwork project={project} /></div>;
}
