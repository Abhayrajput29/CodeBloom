export default function Loading() {
  return <section className="route-loading" role="status" aria-live="polite" aria-label="Loading CodeBloom">
    <span className="loading-label">Loading community</span>
    <div className="loading-block loading-heading" />
    <div className="loading-block loading-copy" />
    <div className="loading-card"><div className="loading-block loading-art" /><div className="loading-block loading-line" /><div className="loading-block loading-line loading-line-short" /></div>
    <span className="sr-only">Loading CodeBloom content…</span>
  </section>;
}
