"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth-provider";
import { AuthGateDialog } from "@/components/auth-gate-dialog";
import { ProjectArtwork } from "@/components/project-card";
import { projects as demoProjects, type Project } from "@/lib/demo-data";
import { sound } from "@/components/landing-sound";

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Loader state
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Auth gate dialog state
  const [gateOpen, setGateOpen] = useState(false);
  const [gateAction, setGateAction] = useState("participate in this project");
  const [gateReturnTo, setGateReturnTo] = useState("/dashboard");

  // Contact form state
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formTask, setFormTask] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Numbers state
  const numbersTrackRef = useRef<HTMLDivElement>(null);

  // Simulated Loader (0% -> 100%)
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 9) + 6;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
        }, 350);
      } else {
        setProgress(current);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  function toggleAudio() {
    const next = sound.toggle();
    setSoundEnabled(next);
  }

  function handleSkip() {
    sound.playClick();
    setLoading(false);
    const contentEl = document.getElementById("content");
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleReplay() {
    sound.playClick();
    setLoading(true);
    setProgress(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 9) + 6;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => setLoading(false), 300);
      } else {
        setProgress(current);
      }
    }, 35);
  }

  function handleProtectedAction(actionName: string, destination: string) {
    if (user) {
      window.location.href = destination;
    } else {
      sound.playClick();
      setGateAction(actionName);
      setGateReturnTo(destination);
      setGateOpen(true);
    }
  }

  function handleSubmitBrief(e: React.FormEvent) {
    e.preventDefault();
    sound.playSuccess();
    setFormSubmitted(true);
  }

  return (
    <div className="hw-root">
      {/* SVG Icon Symbols matching helloworlddsgn.com */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="i-ne" viewBox="0 0 24 24">
          <path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-right" viewBox="0 0 24 24">
          <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-down" viewBox="0 0 24 24">
          <path d="M12 4v15M6 13l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-redo" viewBox="0 0 24 24">
          <path d="M19 12a7 7 0 1 1-2.05-4.95M19 4v5h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
      </svg>

      {/* ============================================================ */}
      {/* 1. LOADER SCREEN (Figma Blueprint: helloworlddsgn.com)        */}
      {/* ============================================================ */}
      <div className={`loader ${loading ? "" : "is-done"}`} id="loader" aria-live="polite">
        <div className="loader-glow" aria-hidden="true" />
        <div className="loader-top">
          <span id="loader-status">Building CodeBloom</span>
          <span>codebloom.exe</span>
        </div>
        <div className="loader-count">
          <b id="loader-num">{progress}</b>%
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TOP CHROME NAVIGATION                                     */}
      {/* ============================================================ */}
      <header className="top">
        <Link className="brand" href="/" id="home" aria-label="CodeBloom home">
          <span className="brand-icon-quad" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </Link>
        <div className="who">
          <b>CodeBloom</b>
          <span>developer community</span>
        </div>

        <div className="top-actions">
          {/* Sound toggle */}
          <button
            className="snd"
            id="snd"
            type="button"
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Mute audio" : "Turn music on"}
            onClick={toggleAudio}
          >
            <span className="snd-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="snd-t">sound</span>
          </button>

          {/* Theme toggle */}
          <button
            className="snd"
            type="button"
            onClick={() => {
              sound.playClick();
              toggleTheme();
            }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? "LIGHT" : "DARK"}
          </button>

          {/* Authentication Links */}
          <Link href="/login" className="top-auth-btn btn-text" onClick={() => sound.playClick()}>
            Sign in
          </Link>
          <Link href="/signup" className="top-auth-btn btn-solid" onClick={() => sound.playClick()}>
            Create account
          </Link>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. RETRO INTRO / STORY MONITOR STAGE                         */}
      {/* ============================================================ */}
      <div className="story-hero-stage">
        <div className="screen-card">
          <p className="screen-prompt">{"// INITIALIZE CODEBLOOM PROTOCOL"}</p>
          <h1 className="screen-title">
            Every great project starts with an idea.<span className="caret">_</span>
          </h1>
          <p className="screen-sub">
            Welcome to <strong>CodeBloom</strong> — where developers turn ideas into something bigger, together.
          </p>

          <div className="screen-actions">
            <Link href="/signup" className="btn" onClick={() => sound.playClick()}>
              <span>Create your account</span>
              <svg className="ico" aria-hidden="true">
                <use href="#i-right" />
              </svg>
            </Link>

            <Link href="/explore" className="btn btn-outline" onClick={() => sound.playClick()}>
              <span>Explore as a guest</span>
            </Link>
          </div>
        </div>

        <button className="skip" id="skip" type="button" onClick={handleSkip}>
          <span>Skip the story</span>{" "}
          <svg className="ico" aria-hidden="true">
            <use href="#i-down" />
          </svg>
        </button>

        <p className="hint" id="hint">
          <span>Scroll to look around</span>{" "}
          <svg className="ico" aria-hidden="true">
            <use href="#i-down" />
          </svg>
        </p>
      </div>

      {/* ============================================================ */}
      {/* 4. SWISS EDITORIAL SHEET (.content)                          */}
      {/*    ONE 12-column grid (.sw-grid) with shared vertical rule   */}
      {/* ============================================================ */}
      <div className="content" id="content">
        {/* ========================================================== */}
        {/* SECTION (01) ABOUT CODEBLOOM                               */}
        {/* ========================================================== */}
        <section className="sw sw-about" id="about" aria-labelledby="about-title">
          <div className="sw-hero">
            <header className="sw-head sw-grid">
              <p className="sw-label">
                <span>(01)</span> About CodeBloom
              </p>
              <p className="sw-label sw-r">A community built for developers.</p>
            </header>

            {/* Giant display lines staggered on Swiss grid columns */}
            <h2 className="sw-big sw-grid" id="about-title">
              <span className="ln c1">Hey,</span>
              <span className="ln c5">welcome to</span>
              <span className="ln c2">CodeBloom</span>
            </h2>
          </div>

          <div className="sw-rest">
            <div className="sw-grid sw-intro">
              {/* Photo / Artwork on columns 1-4 */}
              <figure className="sw-photo">
                <div className="sw-photo-inner">
                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px", opacity: 0.8, marginBottom: "8px" }}>
                    CODEBLOOM // v2026.1
                  </span>
                  <strong style={{ fontSize: "20px", letterSpacing: "-0.02em" }}>
                    Don&apos;t just build projects.
                  </strong>
                  <span style={{ fontSize: "14px", opacity: 0.85, marginTop: "4px" }}>
                    Grow them together.
                  </span>
                </div>
              </figure>

              {/* Lead paragraph in the butter.video manner with flat symbol tiles between words */}
              <p className="sw-lead">
                CodeBloom is a place where developers come together to discover projects{" "}
                <span className="tile ic ic-creative" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z"
                      fill="#fff"
                    />
                  </svg>
                </span>
                , contribute to real-world solutions{" "}
                <span className="tile ic ic-web" aria-hidden="true">
                  <svg viewBox="0 0 32 24">
                    <rect x="4" y="4" width="24" height="16" rx="3" fill="none" stroke="#fff" strokeWidth="2.2" />
                    <path d="M4 9h24" stroke="#fff" strokeWidth="2.2" />
                    <circle cx="8" cy="6.6" r="1" fill="#fff" />
                    <circle cx="11" cy="6.6" r="1" fill="#fff" />
                  </svg>
                </span>
                , share ideas{" "}
                <span className="tile ic ic-motion" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 6.5v11l9-5.5z" fill="#fff" />
                  </svg>
                </span>{" "}
                and grow through collaboration{" "}
                <span className="tile ic ic-brand" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M12 4l2.2 5.2L20 10l-4.3 3.8L17 20l-5-3-5 3 1.3-6.2L4 10l5.8-.8z"
                      fill="#051727"
                    />
                  </svg>
                </span>{" "}
                for developers.{" "}
                <span className="dim">
                  Because the best way to become a better developer is to build something meaningful with others.
                </span>
              </p>
            </div>

            {/* Swiss Stats List */}
            <ul className="sw-stats" aria-label="CodeBloom Overview">
              <li className="sw-grid">
                <b className="sw-num">1,420+</b>
                <span className="sw-label">developers registered</span>
              </li>
              <li className="sw-grid">
                <b className="sw-num">184+</b>
                <span className="sw-label">projects created</span>
              </li>
              <li className="sw-grid">
                <b className="sw-num">890+</b>
                <span className="sw-label">contributions made</span>
              </li>
            </ul>

            {/* Staggered Swiss quote */}
            <p className="sw-quote sw-grid">
              <span className="ln c1">
                <span className="q">Don&apos;t just</span> <span className="q q-r">build</span>
              </span>
              <span className="ln c5">
                <span className="q q-r">projects —</span>
              </span>
              <span className="ln c2">
                <span className="q">grow them</span> <span className="q q-i">together</span>
              </span>
            </p>

            <div className="sw-about-actions">
              <Link href="/signup" className="btn" onClick={() => sound.playClick()}>
                <span>Create your account</span>
                <svg className="ico" aria-hidden="true">
                  <use href="#i-right" />
                </svg>
              </Link>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleProtectedAction("share a project", "/publish")}
              >
                <span>Share a project</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION (02) CODEBLOOM IN NUMBERS (MESH-GRADIENT BAND)     */}
        {/* ========================================================== */}
        <section className="sw-numbers" id="numbers" aria-labelledby="nums-title">
          <div className="nums-stage">
            <div className="nums-track" ref={numbersTrackRef}>
              <div className="nums-intro">
                <p className="sw-label">
                  <span>(02)</span> In numbers · since 2026
                </p>
                <h2 className="nums-title" id="nums-title">
                  Growing<br />together.
                </h2>
              </div>

              <div className="num">
                <span className="num-i">01</span>
                <b>1,420+</b>
                <span className="num-l">developers</span>
              </div>
              <div className="num">
                <span className="num-i">02</span>
                <b>184+</b>
                <span className="num-l">projects</span>
              </div>
              <div className="num">
                <span className="num-i">03</span>
                <b>890+</b>
                <span className="num-l">contributions</span>
              </div>
              <div className="num">
                <span className="num-i">04</span>
                <b>340+</b>
                <span className="num-l">collaborations</span>
              </div>
              <div className="num">
                <span className="num-i">05</span>
                <b>92+</b>
                <span className="num-l">completed</span>
              </div>
              <div className="num">
                <span className="num-i">06</span>
                <b>520+</b>
                <span className="num-l">ideas shared</span>
              </div>
              <div className="num">
                <span className="num-i">07</span>
                <b>48+</b>
                <span className="num-l">libraries</span>
              </div>
              <div className="num">
                <span className="num-i">08</span>
                <b>100%</b>
                <span className="num-l">open source</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION (03) WORKS TUNNEL / EXPLORE PROJECTS               */}
        {/* ========================================================== */}
        <section className="works" id="work" aria-labelledby="work-title">
          <div className="works-stage">
            <header className="works-header">
              <p className="works-note">
                <span>(03)</span> Explore Projects
              </p>
              <h2 className="works-title" id="work-title">
                Ideas worth building.
              </h2>
              <p className="works-sub">( curated open source · developer tools · experiments )</p>
              <Link className="btn works-btn" href="/explore" onClick={() => sound.playClick()}>
                <span>Explore all projects</span>
                <svg className="ico" aria-hidden="true">
                  <use href="#i-right" />
                </svg>
              </Link>
            </header>

            {/* Showcase Cards Grid */}
            <div className="works-grid">
              {demoProjects.slice(0, 6).map((project: Project) => (
                <article key={project.slug} className="works-card">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="works-card-art"
                    aria-label={`Explore ${project.name}`}
                    onClick={() => sound.playClick()}
                  >
                    <ProjectArtwork project={project} />
                  </Link>

                  <div className="works-card-body">
                    <div className="works-card-meta">
                      <span>{project.status}</span>
                      <span>by {project.author}</span>
                    </div>

                    <h3 className="works-card-title">
                      <Link href={`/projects/${project.slug}`} onClick={() => sound.playClick()}>
                        {project.name}
                      </Link>
                    </h3>

                    <p className="works-card-desc">{project.description}</p>

                    <div className="works-card-tags">
                      {project.tags.map((tag) => (
                        <span key={tag} className="works-card-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="works-card-actions">
                      <span style={{ fontSize: "12px", opacity: 0.8 }}>
                        {project.votes} appreciations
                      </span>

                      <button
                        type="button"
                        className="works-card-btn"
                        onClick={() =>
                          handleProtectedAction(`contribute to ${project.name}`, `/projects/${project.slug}`)
                        }
                      >
                        <span>Contribute</span>
                        <svg className="ico" aria-hidden="true">
                          <use href="#i-right" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION (05) JOIN THE COMMUNITY / CONTACT                  */}
        {/* ========================================================== */}
        <footer className="sw sw-foot" id="contact" aria-labelledby="cta-title">
          <header className="sw-head sw-grid">
            <p className="sw-label">
              <span>(05)</span> Join the Community
            </p>
            <p className="sw-label sw-r">open to developers and collaborators</p>
          </header>

          <h2 className="sw-big sw-grid" id="cta-title">
            <span className="ln c1">Let’s build</span>
            <span className="ln c4">something together?</span>
          </h2>

          {/* Swiss Links List */}
          <ul className="sw-links">
            <li>
              <a className="sw-grid" href="mailto:contact@codebloom.dev">
                <span className="sw-label">01</span>
                <b>Email</b>
                <span className="sw-note">contact@codebloom.dev</span>
                <svg className="ico" aria-hidden="true">
                  <use href="#i-ne" />
                </svg>
              </a>
            </li>
            <li>
              <a
                className="sw-grid"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sw-label">02</span>
                <b>GitHub</b>
                <span className="sw-note">@codebloom</span>
                <svg className="ico" aria-hidden="true">
                  <use href="#i-ne" />
                </svg>
              </a>
            </li>
            <li>
              <Link className="sw-grid" href="/explore" onClick={() => sound.playClick()}>
                <span className="sw-label">03</span>
                <b>Explore</b>
                <span className="sw-note">all community projects</span>
                <svg className="ico" aria-hidden="true">
                  <use href="#i-ne" />
                </svg>
              </Link>
            </li>
            <li>
              <Link className="sw-grid" href="/signup" onClick={() => sound.playClick()}>
                <span className="sw-label">04</span>
                <b>Create account</b>
                <span className="sw-note">join the garden</span>
                <svg className="ico" aria-hidden="true">
                  <use href="#i-ne" />
                </svg>
              </Link>
            </li>
          </ul>

          {/* Contact / Project Brief Form Card */}
          <div className="sw-formwrap">
            <form className="sw-formcard" id="brief" onSubmit={handleSubmitBrief} aria-labelledby="form-title">
              <p className="f-sub">Open to developers, maintainers &amp; tinkerers</p>
              <h3 id="form-title">
                <span className="ln">
                  Tell us about <span className="w2">your project</span>
                </span>
              </h3>

              {formSubmitted ? (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <h4 style={{ fontSize: "28px", margin: "0 0 10px" }}>Note Received!</h4>
                  <p style={{ opacity: 0.9 }}>
                    Thank you for reaching out, <strong>{formName || "builder"}</strong>. We look forward to building something great together.
                  </p>
                </div>
              ) : (
                <div className="sw-fields">
                  <label>
                    <span>Name *</span>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder="Your Name *"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>Telegram / GitHub / Email *</span>
                    <input
                      type="text"
                      name="contact"
                      required
                      placeholder="Telegram / GitHub / Email *"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                    />
                  </label>
                  <label className="f-wide">
                    <span>Task or Project Idea</span>
                    <textarea
                      name="task"
                      rows={3}
                      placeholder="What are you building? Looking for collaborators or open-source contributors?"
                      value={formTask}
                      onChange={(e) => setFormTask(e.target.value)}
                    />
                  </label>
                  <button className="btn btn-ink" type="submit">
                    <span>Send the brief</span>
                    <svg className="ico" aria-hidden="true">
                      <use href="#i-right" />
                    </svg>
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="sw-end sw-grid">
            <p className="sw-label">© 2026 CodeBloom</p>
            <button className="sw-replay" id="replay" type="button" onClick={handleReplay}>
              <span>Watch the story again</span>{" "}
              <svg className="ico" aria-hidden="true">
                <use href="#i-redo" />
              </svg>
            </button>
          </div>

          <p className="sw-word" aria-hidden="true">
            code_bloom
          </p>
        </footer>
      </div>

      {/* Auth Gate Dialog for Protected Actions */}
      <AuthGateDialog
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        action={gateAction}
        returnTo={gateReturnTo}
      />
    </div>
  );
}
