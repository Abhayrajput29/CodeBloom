"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft, ArrowUpRight, Bell, Bookmark, Check, Compass, LockKeyhole,
  LogIn, MessageCircle, Plus, Search, Send, Settings2, ShieldCheck, Sparkles, Users,
} from "lucide-react";
import { ProjectCard, FeaturedProject } from "@/components/project-card";
import { useCommunity } from "@/components/community-provider";
import { useTheme } from "@/components/theme-provider";
import { PageHeading, EmptyState } from "@/components/ui/page-state";
import { PreviewNote } from "@/components/ui/preview-note";
import { notifications, pendingRequests, projects as seedProjects } from "@/lib/demo-data";
import { getPreviewFeed, previewFeedModes, type PreviewFeedMode } from "@/lib/community-feed";
import { safeGitHubRepositoryUrl, safeHttpsUrl } from "@/lib/urls";

export function FeedView({ mode = "home", initialQuery = "" }: { mode?: "home" | "explore"; initialQuery?: string }) {
  const { projects } = useCommunity();
  const [filter, setFilter] = useState<PreviewFeedMode>("For you");
  const [query, setQuery] = useState(initialQuery);
  const visible = useMemo(() => getPreviewFeed(projects, filter, query), [projects, filter, query]);
  const title = mode === "explore" ? "Explore projects" : "The community garden";

  return <section className="feed-view">
    <PageHeading eyebrow={mode === "explore" ? "DISCOVER WHAT'S GROWING" : "GOOD WORK, SHARED OPENLY"} title={title} description={mode === "explore" ? "Find the tools, experiments, and open-source work people are building." : "Fresh projects and thoughtful work from developers building in public."} action={<Link href="/publish" className="button button-primary"><Plus size={16} /> Share a project</Link>} />
    {mode === "home" && projects[0] && <FeaturedProject project={projects[0]} />}
    <div className="feed-toolbar"><div className="tabs" role="group" aria-label="Sort the preview feed">{previewFeedModes.map((item) => <button type="button" key={item} className={filter === item ? "tab-active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>{mode === "explore" && <label className="inline-search"><Search size={15} aria-hidden="true" /><span className="sr-only">Search projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" /></label>}</div>
    {filter === "Following" ? <EmptyState icon={<Users size={24} />} title="Your following feed starts here" description="Following is not connected in this preview. Developer follows will appear here once accounts are implemented." action={<Link className="button button-outline" href="/explore"><Compass size={15} /> Explore projects</Link>} /> : visible.length ? <div className="feed-list" aria-live="polite">{visible.map((project, index) => <ProjectCard key={project.slug} project={project} featured={mode === "home" && index === 0} />)}</div> : <EmptyState icon={<Search size={24} />} title="No projects found" description="Try another project name, developer, or technology." action={query ? <button className="button button-outline" type="button" onClick={() => setQuery("")}>Clear search</button> : undefined} />}
    <PreviewNote>Feed order and sample projects are local preview data, not the production ranking or a live community feed.</PreviewNote>
  </section>;
}

export function PublishView() {
  const { publish } = useCommunity();
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const payload = {
      name,
      tagline: String(data.get("tagline") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      repositoryUrl: String(data.get("repo") ?? "").trim(),
      tags: String(data.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 5),
    };
    if (!name) return;
    setError("");
    setStatus("saving");

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const response = await fetch("/api/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
        const body = await response.json() as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Unable to publish this project. Check your sign-in and Supabase setup.");
      } else {
        publish({ ...payload, repo: payload.repositoryUrl });
      }
      form.reset();
      setStatus("saved");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  return <section className="form-page"><PageHeading eyebrow="BUILD IN PUBLIC" title="Share your project" description="Give people enough context to understand what you made and how they can explore it." />{status === "saved" && <p className="success-banner" role="status"><Check size={17} /> {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Project submitted. Its visibility follows your configured account and database policies." : "Project added to this browser preview only."}</p>}{error && <p className="error-banner" role="alert">{error}</p>}<form className="publish-form" onSubmit={submit}><label>Project name<input required name="name" maxLength={80} minLength={2} placeholder="Signal Garden" /></label><label>One-line description<input required name="tagline" maxLength={140} minLength={8} placeholder="A calmer way to understand notifications." /></label><label>What are you building?<textarea required name="description" maxLength={2000} minLength={20} placeholder="Share the problem, your approach, and what makes it useful." rows={6} /></label><div className="two-up"><label>GitHub repository<input required name="repo" type="url" pattern="https://github\.com/.*" title="Use an HTTPS github.com repository URL" placeholder="https://github.com/you/project" /></label><label>Topics<input required name="tags" placeholder="TypeScript, Next.js, Open source" /></label></div><p className="form-hint">Add up to five comma-separated topics. A GitHub repository URL is required.</p><div className="form-actions"><Link className="button button-outline" href="/">Cancel</Link><button className="button button-primary" type="submit" disabled={status === "saving"}>{status === "saving" ? <span className="spinner" aria-hidden="true" /> : <Send size={16} />}{status === "saving" ? "Publishing…" : "Publish project"}</button></div></form><PreviewNote>{process.env.NEXT_PUBLIC_SUPABASE_URL ? "This form requires an authenticated Supabase user and the reviewed project migration to be applied. A live publish has not been verified." : "Without Supabase configuration, projects are stored in this browser only and will not be visible to anyone else."}</PreviewNote></section>;
}

export function LoginView() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage(""); setBusy(true);
    const form = event.currentTarget;
    try {
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/browser");
      const data = new FormData(form);
      const { error: signInError } = await createSupabaseBrowserClient().auth.signInWithPassword({ email: String(data.get("email") ?? ""), password: String(data.get("password") ?? "") });
      if (signInError) throw new Error("We couldn't sign you in. Check your details and Supabase Auth configuration.");
      setMessage("Sign-in succeeded. Account and session flows are still being completed; refresh before using protected actions.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in is unavailable. Check the local Supabase configuration.");
    } finally { setBusy(false); }
  }

  return <section className="form-page auth-page"><PageHeading eyebrow="YOUR WORK, YOUR SPACE" title="Sign in" description="Use your CodeBloom account to save work and take part in the community." /><form className="publish-form" onSubmit={submit}><label>Email<input required name="email" type="email" autoComplete="email" /></label><label>Password<input required name="password" type="password" minLength={8} autoComplete="current-password" /></label>{error && <p className="error-banner" role="alert">{error}</p>}{message && <p className="success-banner" role="status"><Check size={17} /> {message}</p>}<button className="button button-primary" type="submit" disabled={busy}>{busy ? <span className="spinner" aria-hidden="true" /> : <LogIn size={16} />}{busy ? "Signing in…" : "Sign in"}</button><p className="auth-help"><LockKeyhole size={15} /> Sign-up, recovery, OAuth callbacks, and complete session handling are not part of this preview phase.</p></form><PreviewNote>A Supabase URL and publishable key alone do not complete account setup.</PreviewNote></section>;
}

export function ProjectDetail({ slug }: { slug: string }) {
  const { projects, bookmarked, toggleBookmark } = useCommunity();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return <EmptyState icon={<Compass size={24} />} title="Project not found" description="This project may have moved or is not included in this browser preview." action={<Link className="button button-primary" href="/explore">Explore projects</Link>} />;
  const repositoryUrl = safeGitHubRepositoryUrl(project.repo);
  const demoUrl = project.demo ? safeHttpsUrl(project.demo) : null;

  return <section className="detail-page"><Link className="back-link" href="/explore"><ArrowLeft size={14} /> Back to explore</Link><PageHeading eyebrow={`${project.status.toUpperCase()} · PREVIEW PROJECT`} title={project.name} description={project.tagline} action={<button className="button button-outline" type="button" onClick={() => toggleBookmark(project.slug)} aria-pressed={bookmarked.includes(project.slug)}><Bookmark size={16} fill={bookmarked.includes(project.slug) ? "currentColor" : "none"} /> {bookmarked.includes(project.slug) ? "Saved" : "Save project"}</button>} /><div className="detail-art"><FeaturedProject project={project} /></div><article className="detail-card"><div className="detail-author"><span className={`avatar avatar-${project.avatarTone}`}>{project.initials}</span><span>Built by <Link href={`/u/${project.handle}`}>{project.author}</Link><small>@{project.handle} · {project.time}</small></span><span className={`status-pill status-${project.statusTone}`}><i />{project.status}</span></div><p className="detail-description">{project.description}</p><dl><div><dt>Appreciations</dt><dd>{project.votes}</dd></div><div><dt>Conversations</dt><dd>{project.comments}</dd></div><div><dt>Topics</dt><dd>{project.tags.length}</dd></div></dl><div className="project-tags" aria-label="Project topics">{project.tags.map((tag) => <Link className="tag-chip" href={`/communities/${encodeURIComponent(tag.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`} key={tag}>#{tag}</Link>)}</div><div className="detail-links">{repositoryUrl ? <a className="button button-outline" href={repositoryUrl} target="_blank" rel="noopener noreferrer">View source <ArrowUpRight size={15} /></a> : <span className="text-muted">Repository link unavailable</span>}{demoUrl && <a className="text-link" href={demoUrl} target="_blank" rel="noopener noreferrer">Live demo <ArrowUpRight size={14} /></a>}</div></article><section className="discussion" id="discussion"><div className="section-title-row"><h2><MessageCircle size={19} /> Discussion</h2><span className="preview-tag">Preview</span></div><p>Project discussion will appear here when comments and server-side authorization are implemented. For now, explore the project and its source code.</p><Link className="button button-outline" href="/login"><LogIn size={15} /> Sign in to join later</Link></section><PreviewNote>Project content, totals, and activity on this page are illustrative local data.</PreviewNote></section>;
}

export function ProfileView({ handle }: { handle: string }) {
  const { projects } = useCommunity();
  const [notice, setNotice] = useState("");
  const authored = projects.filter((project) => project.handle.toLowerCase() === handle.toLowerCase());
  const profile = authored[0];
  if (!profile) return <EmptyState icon={<Users size={24} />} title="Developer not found" description="This profile is not included in the current preview." action={<Link className="button button-primary" href="/explore">Explore projects</Link>} />;
  return <section className="profile-page"><PageHeading eyebrow="DEVELOPER PROFILE · PREVIEW" title={profile.author} description={`@${profile.handle} · Building in public on CodeBloom.`} action={<button className="button button-outline" type="button" onClick={() => setNotice("Developer follows are not connected in this preview.")}>Follow developer</button>} />{notice && <p className="preview-feedback" role="status">{notice}</p>}<article className="detail-card profile-summary"><div className={`avatar avatar-large avatar-${profile.avatarTone}`}>{profile.initials}</div><div><h2>{profile.author}</h2><p>Sharing thoughtful software, open-source experiments, and lessons learned along the way.</p><span className="profile-stat"><strong>{authored.length}</strong> shared {authored.length === 1 ? "project" : "projects"}</span></div></article><h2 className="subheading">Projects by {profile.author}</h2><div className="feed-list">{authored.map((project) => <ProjectCard key={project.slug} project={project} />)}</div><PreviewNote>Profiles and follow relationships are sample data in this preview.</PreviewNote></section>;
}

const communityInfo: Record<string, { title: string; description: string; tags: string[] }> = {
  opensource: { title: "Open source", description: "Projects shared in the open, with room for people to learn, contribute, and build on what came before.", tags: ["open source"] },
  "open-source": { title: "Open source", description: "Projects shared in the open, with room for people to learn, contribute, and build on what came before.", tags: ["open source"] },
  "indie-makers": { title: "Indie makers", description: "Small teams and solo developers turning useful ideas into thoughtful software.", tags: ["community", "developer tools"] },
  "design-systems": { title: "Design systems", description: "The components, tokens, and tools that make interfaces feel consistent and considered.", tags: ["design systems", "css"] },
};

export function CommunityView({ slug }: { slug: string }) {
  const [notice, setNotice] = useState("");
  const info = communityInfo[slug];
  const related = info ? seedProjects.filter((project) => project.tags.some((tag) => info.tags.includes(tag.toLowerCase()))) : [];
  if (!info) return <EmptyState icon={<Users size={24} />} title="Community not found" description="That topic is not part of this local preview." action={<Link className="button button-primary" href="/communities">Browse communities</Link>} />;
  return <section><PageHeading eyebrow="TOPIC COMMUNITY · PREVIEW" title={info.title} description={info.description} action={<button className="button button-outline" type="button" onClick={() => setNotice("Community memberships are not connected in this preview.")}>Join community</button>} />{notice && <p className="preview-feedback" role="status">{notice}</p>}{related.length ? <div className="feed-list">{related.map((project) => <ProjectCard key={project.slug} project={project} />)}</div> : <EmptyState icon={<Sparkles size={24} />} title="A space for new work" description="No example projects are tagged here yet. Explore the full community feed to discover more." action={<Link className="button button-outline" href="/explore">Explore projects</Link>} />}<PreviewNote>Community memberships and counts are illustrative only.</PreviewNote></section>;
}

type ListItem = { title: string; body: string; foot?: string };
function ListPage({ title, eyebrow, description, icon, items }: { title: string; eyebrow: string; description: string; icon: ReactNode; items: ListItem[] }) {
  return <section><PageHeading title={title} eyebrow={eyebrow} description={description} /><div className="list-card">{items.map((item, index) => <article key={`${item.title}-${index}`}><span className="list-icon">{icon}</span><div><strong>{item.title}</strong><p>{item.body}</p>{item.foot && <small>{item.foot}</small>}</div></article>)}</div><PreviewNote>These examples are synthetic preview data, not live account activity.</PreviewNote></section>;
}

export function SimplePage({ kind }: { kind: "bookmarks" | "notifications" | "messages" | "communities" | "settings" }) {
  const { projects, bookmarked } = useCommunity();
  const { theme, toggleTheme } = useTheme();
  if (kind === "bookmarks") {
    const saved = projects.filter((project) => bookmarked.includes(project.slug));
    return <section><PageHeading eyebrow="YOUR COLLECTION" title="Bookmarks" description="Projects you saved to revisit later on this device." />{saved.length ? <div className="feed-list">{saved.map((project) => <ProjectCard project={project} key={project.slug} />)}</div> : <EmptyState icon={<Bookmark size={24} />} title="Nothing saved yet" description="Save a project while exploring and it will appear here." action={<Link href="/explore" className="button button-primary">Explore projects</Link>} />}<PreviewNote>Bookmarks currently stay in this browser and are not synced to an account.</PreviewNote></section>;
  }
  if (kind === "notifications") return <ListPage title="Activity" eyebrow="STAY IN THE LOOP" description="A quiet place for meaningful community updates." icon={<Bell size={20} />} items={notifications.map((item) => ({ title: `${item.name} ${item.action}`, body: item.subject ? `${item.subject} · ${item.time}` : item.time, foot: item.unread ? "Preview · unread" : "Preview" }))} />;
  if (kind === "messages") return <section><PageHeading title="Messages" eyebrow="PRIVATE CONVERSATIONS" description="Private conversations are unlocked only after a recipient accepts a request." /><div className="privacy-callout"><ShieldCheck size={20} /><div><strong>Private by design</strong><p>This preview does not open real conversations. Pending requests cannot exchange ordinary messages.</p></div></div><h2 className="subheading">Incoming requests · preview</h2><div className="list-card">{pendingRequests.map((request) => <article key={request.id}><span className={`avatar avatar-${request.tone}`}>{request.initials}</span><div><strong>{request.name} <span className="request-state">Pending</span></strong><p>{request.note}</p><small>{request.mutual} · {request.time}</small></div></article>)}</div><div className="locked-conversations"><LockKeyhole size={17} /><span>Accepted conversations will appear here after server-side authorization is implemented.</span></div><PreviewNote>Names and introductory messages above are invented preview fixtures, not real private messages.</PreviewNote></section>;
  if (kind === "communities") return <section><PageHeading title="Communities" eyebrow="FIND YOUR PEOPLE" description="Explore topic spaces for the tools and ideas you care about." /><div className="community-grid">{[{ slug: "opensource", title: "Open source", count: "2.4k", body: "Build in the open and share what you learn." }, { slug: "indie-makers", title: "Indie makers", count: "1.8k", body: "Small teams, independent products, practical lessons." }, { slug: "design-systems", title: "Design systems", count: "980", body: "Tokens, components, and thoughtful interfaces." }].map((community) => <Link className="community-card" key={community.slug} href={`/communities/${community.slug}`}><span className="community-icon"><Users size={18} /></span><span className="eyebrow">{community.count} preview members</span><strong>{community.title}</strong><p>{community.body}</p><span className="rail-more">Explore community <ArrowUpRight size={14} /></span></Link>)}</div><PreviewNote>Topics and member counts are example content. Membership actions are not connected.</PreviewNote></section>;
  return <section><PageHeading title="Settings" eyebrow="PREFERENCES" description="A few interface controls for this local preview." /><div className="settings-card"><div className="settings-copy"><span className="settings-icon"><Settings2 size={18} /></span><div><strong>Color theme</strong><p>Choose a comfortable appearance. Your selection stays in this browser.</p></div></div><button className="button button-outline" type="button" onClick={toggleTheme}>{theme === "dark" ? "Switch to light" : "Switch to dark"}</button></div><div className="detail-card" id="about"><h2>About CodeBloom</h2><p>Discover. Discuss. Build upon. A project-centered developer community, designed to make good work easier to find and improve together.</p><Link className="text-link" href="/explore">Explore projects <ArrowUpRight size={14} /></Link></div><div className="detail-card" id="guidelines"><h2>Community guidelines</h2><p>Share context, critique ideas with care, credit the work that inspired you, and respect each other’s boundaries.</p></div><div className="detail-card" id="privacy"><h2>Privacy in this preview</h2><p>Sample activity and browser-local interactions are not private account records and are not shared. Live conversations are not enabled.</p></div><PreviewNote>Account security and durable user preferences arrive with the later authentication phase.</PreviewNote></section>;
}
