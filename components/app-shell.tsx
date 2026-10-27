"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowRight, Bell, Bookmark, ChevronDown, ChevronRight,
  CircleHelp, Compass, Flame, Hash, Home, Menu, MessageCircle, Moon,
  Plus, Search, Settings, Sun, X,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { projects } from "@/lib/demo-data";

const discovery = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/communities", label: "Communities", icon: Hash },
];
const personal = [
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/notifications", label: "Activity", icon: Bell, dot: true },
  { href: "/messages", label: "Messages", icon: MessageCircle },
];
const topics = [
  { href: "/communities/opensource", label: "Open source", count: "2.4k" },
  { href: "/communities/indie-makers", label: "Indie makers", count: "1.8k" },
  { href: "/communities/design-systems", label: "Design systems", count: "980" },
];

function Brand() {
  return <Link href="/" className="brand" aria-label="CodeBloom home">
    <span className="brand-icon" aria-hidden="true"><i /><i /><i /><i /></span>
    <span className="brand-name">code<span>bloom</span><small>DISCOVER. DISCUSS. BUILD UPON.</small></span>
  </Link>;
}

function Avatar({ initials = "AC", tone = "plum" }: { initials?: string; tone?: string }) {
  return <span className={`avatar avatar-${tone}`} aria-hidden="true">{initials}</span>;
}

function NavItem({ href, label, icon: Icon, active, dot, onNavigate }: {
  href: string; label: string; icon: typeof Home; active: boolean; dot?: boolean; onNavigate?: () => void;
}) {
  return <Link href={href} className={`nav-item${active ? " nav-item-active" : ""}`} aria-current={active ? "page" : undefined} onClick={onNavigate}>
    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} /><span>{label}</span>{dot && <i className="nav-dot" aria-label="Preview activity" />}
  </Link>;
}

function ContextRail() {
  return <aside className="context-rail" aria-label="Community highlights">
    <section className="rail-card rail-intro"><span className="eyebrow">A COMMUNITY, NOT A DIRECTORY</span><h2>Good work gets better <em>together.</em></h2><p>Share a build, trade thoughtful feedback, and find ideas you want to build upon.</p><Link className="button button-primary button-wide" href="/publish"><Plus size={16} /> Share your project</Link></section>
    <section className="rail-card"><div className="rail-heading"><span className="eyebrow"><Flame size={13} /> IN THE GARDEN</span><Link href="/explore" aria-label="Explore community projects"><ChevronRight size={16} /></Link></div>
      {projects.slice(0, 4).map((project, index) => <Link className="trend-item" href={`/projects/${project.slug}`} key={project.slug}><span className="trend-number">0{index + 1}</span><span><strong>{project.name}</strong><small>{project.tags[0]} · {project.votes} preview appreciations</small></span></Link>)}
      <Link href="/explore" className="rail-more">Explore all projects <ArrowRight size={14} /></Link>
    </section>
    <section className="rail-card"><div className="rail-heading"><span className="eyebrow"><Activity size={13} /> GROWING TOPICS</span></div>{topics.map((topic, index) => <Link className="rail-topic" href={topic.href} key={topic.href}><span><i className={`topic-mark topic-mark-${index}`}><Hash size={12} /></i> {topic.label}</span><small>{topic.count} preview</small></Link>)}<Link href="/communities" className="rail-more">Browse communities <ArrowRight size={14} /></Link></section>
    <blockquote className="rail-quote"><span aria-hidden="true">“</span><p>The best software communities make it easier to share what you learned, not just what you shipped.</p><cite>THE CODEBLOOM IDEA</cite></blockquote>
  </aside>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const onFeed = pathname === "/" || pathname === "/explore";
  const currentSection = pathname === "/" ? "/" : pathname.startsWith("/explore") ? "/explore" : pathname.startsWith("/communities") ? "/communities" : pathname.startsWith("/bookmarks") ? "/bookmarks" : pathname.startsWith("/notifications") ? "/notifications" : pathname.startsWith("/messages") ? "/messages" : "";

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { setMobileOpen(false); setProfileOpen(false); }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (term) router.push(`/explore?q=${encodeURIComponent(term)}`);
  }

  return <div className={`app-shell${mobileOpen ? " mobile-open" : ""}`}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="topbar">
      <div className="topbar-brand"><button className="icon-button mobile-menu-button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="primary-sidebar">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button><Brand /></div>
      <form className="global-search" role="search" onSubmit={submitSearch}><Search size={16} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search projects, people, and topics" placeholder="Search projects, people, topics…" /><kbd aria-hidden="true">⌘ K</kbd><button type="submit" aria-label="Search"><ArrowRight size={15} /></button></form>
      <div className="topbar-actions"><span className="preview-indicator"><i /> Preview mode</span><button className="icon-button theme-button" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button><Link className="topbar-bell" href="/notifications" aria-label="Activity (preview)"><Bell size={18} /><i /></Link><button className="profile-trigger" aria-expanded={profileOpen} aria-haspopup="true" aria-label="Open preview profile menu" onClick={() => setProfileOpen((open) => !open)}><Avatar /><ChevronDown size={13} /></button>
        {profileOpen && <div className="profile-popover" role="menu"><div className="popover-identity"><Avatar /><span><strong>Amira Chen</strong><small>Preview profile</small></span></div><Link role="menuitem" href="/u/amiracodes" onClick={() => setProfileOpen(false)}>View profile</Link><Link role="menuitem" href="/settings" onClick={() => setProfileOpen(false)}>Preferences</Link><Link role="menuitem" href="/login" onClick={() => setProfileOpen(false)}>Sign in preview</Link></div>}
      </div>
    </header>
    {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <div className="app-grid">
      <aside className={`left-sidebar${mobileOpen ? " left-sidebar-open" : ""}`} id="primary-sidebar">
        <span className="sidebar-label">DISCOVER</span><nav aria-label="Primary navigation">{discovery.map((item) => <NavItem key={item.href} {...item} active={currentSection === item.href} onNavigate={() => setMobileOpen(false)} />)}</nav>
        <span className="sidebar-label sidebar-label-gap">YOUR SPACE</span><nav aria-label="Personal navigation">{personal.map((item) => <NavItem key={item.href} {...item} active={currentSection === item.href} dot={item.dot} onNavigate={() => setMobileOpen(false)} />)}</nav>
        <Link className="share-project-link" href="/publish" onClick={() => setMobileOpen(false)}><span><Plus size={16} /></span><b>Share a project</b><small>Preview</small></Link>
        <div className="sidebar-communities"><div className="sidebar-community-heading"><span className="sidebar-label">YOUR COMMUNITIES</span><Link href="/communities" aria-label="Browse communities"><Plus size={14} /></Link></div>{topics.map((topic, index) => <Link className="sidebar-topic" href={topic.href} key={topic.href} onClick={() => setMobileOpen(false)}><span className={`topic-mark topic-mark-${index}`}><Hash size={12} /></span><span>{topic.label}</span><small>{topic.count}</small></Link>)}<Link href="/communities" className="sidebar-browse">Browse all <ArrowRight size={13} /></Link></div>
        <div className="sidebar-bottom"><Link href="/settings"><Settings size={16} /> Settings</Link><Link href="/settings#help"><CircleHelp size={16} /> Help & feedback</Link><div className="sidebar-legal"><Link href="/settings#about">About</Link><span>·</span><Link href="/settings#guidelines">Guidelines</Link><span>·</span><Link href="/settings#privacy">Privacy</Link></div><small>© 2026 CodeBloom community</small></div>
      </aside>
      <main className={`main-column${onFeed ? " main-column-feed" : ""}`} id="main-content" tabIndex={-1}><div className="main-inner">{children}<div className="mobile-preview-note"><i /> Preview interactions are not synced</div></div></main>
      {onFeed && <ContextRail />}
    </div>
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{[{ href: "/", label: "Home", icon: Home }, { href: "/explore", label: "Explore", icon: Compass }, { href: "/publish", label: "Publish", icon: Plus }, { href: "/notifications", label: "Activity", icon: Bell }, { href: "/messages", label: "Messages", icon: MessageCircle }].map((item) => { const Icon = item.icon; return <Link href={item.href} key={item.href} className={currentSection === item.href ? "mobile-nav-active" : ""} aria-current={currentSection === item.href ? "page" : undefined} onClick={() => setMobileOpen(false)}><Icon size={18} /><span>{item.label}</span></Link>; })}</nav>
  </div>;
}
