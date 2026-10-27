"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Keep only the non-sensitive framework digest in the browser console.
    if (error.digest) console.error("CodeBloom route failed", error.digest);
  }, [error.digest]);

  return <section className="route-error" role="alert"><span className="error-icon"><AlertTriangle size={22} /></span><span className="eyebrow">A TEMPORARY SETBACK</span><h1>This page couldn’t load</h1><p>Your account and project data have not been changed. Try again, or return to the community feed.</p><div className="not-found-actions"><button className="button button-primary" onClick={() => retry()}><RefreshCw size={15} /> Try again</button><Link className="button button-outline" href="/">Back to CodeBloom</Link></div></section>;
}
