"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LockKeyhole, X } from "lucide-react";

export function AuthGateDialog({ open, onClose, action, returnTo }: { open: boolean; onClose: () => void; action: string; returnTo: string }) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  const next = encodeURIComponent(returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/dashboard");
  return <div className="auth-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title"><button type="button" className="icon-button auth-dialog-close" onClick={onClose} aria-label="Close sign in prompt"><X size={18} /></button><span className="auth-dialog-icon"><LockKeyhole size={20} /></span><p className="landing-kicker">A LITTLE ACCOUNTABILITY</p><h2 id="auth-dialog-title">Sign in to {action}.</h2><p>Join CodeBloom to take part. Your place will be waiting after you sign in.</p><Link className="button button-primary button-wide" href={`/login?next=${next}`}>Sign in</Link><Link className="button button-outline button-wide" href={`/signup?next=${next}`}>Create an account</Link><button className="auth-dialog-cancel" type="button" onClick={onClose}>Not now</button></section></div>;
}
