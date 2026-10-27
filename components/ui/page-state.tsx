import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="page-heading">
    <div className="page-heading-copy">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {action && <div className="page-heading-action">{action}</div>}
  </header>;
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <section className="empty-state">
    <span className="empty-state-icon">{icon}</span>
    <h2>{title}</h2>
    <p>{description}</p>
    {action && <div className="empty-state-action">{action}</div>}
  </section>;
}
