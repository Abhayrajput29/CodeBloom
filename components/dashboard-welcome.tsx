"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sprout, UserRound, X } from "lucide-react";

export function DashboardWelcome({ emailConfirmed = false }: { emailConfirmed?: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return <section className="dashboard-welcome" aria-labelledby="dashboard-welcome-title">
    <div className="dashboard-welcome-heading">
      <span className="dashboard-welcome-mark" aria-hidden="true"><Sprout size={20} /></span>
      <div><p className="eyebrow">YOUR FIRST STEPS</p><h2 id="dashboard-welcome-title">Welcome to your workshop.</h2><p>Start with one small step. Explore the live community feed and make the space yours as you go.</p></div>
      <button className="dashboard-welcome-dismiss" type="button" aria-label="Dismiss getting started panel" onClick={() => setDismissed(true)}><X size={17} /></button>
    </div>
    <nav className="dashboard-welcome-actions" aria-label="Get started on CodeBloom">
      <Link href="/settings/profile"><span className="welcome-step-icon"><UserRound size={16} /></span><span><strong>Make it yours</strong><small>Choose your name and introduce yourself.</small></span><ArrowRight size={15} /></Link>
      <Link href="/explore"><span className="welcome-step-icon"><Compass size={16} /></span><span><strong>Find inspiration</strong><small>Browse projects and follow a topic.</small></span><ArrowRight size={15} /></Link>
      <Link href="/publish"><span className="welcome-step-icon"><Sprout size={16} /></span><span><strong>Share a build</strong><small>Give your project a place to grow.</small></span><ArrowRight size={15} /></Link>
    </nav>
    <p className="dashboard-welcome-note" role="status">{emailConfirmed ? "Email confirmed—you’re signed in. " : "Your account is ready. "}Votes, bookmarks, follows, and comments sync to your account.</p>
  </section>;
}
