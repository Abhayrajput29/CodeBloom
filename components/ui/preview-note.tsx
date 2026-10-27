import { Info } from "lucide-react";

export function PreviewNote({ children = "Preview only — changes are not saved or sent." }: { children?: string }) {
  return <p className="preview-note"><Info size={14} aria-hidden="true" /><span>{children}</span></p>;
}
