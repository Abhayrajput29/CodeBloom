import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/page-state";

export default function NotFound() {
  return <section className="not-found-page"><EmptyState icon={<Search size={24} />} title="This page hasn’t taken root" description="We couldn’t find that CodeBloom page. The link may be out of date, or the project may have moved." action={<div className="not-found-actions"><Link className="button button-primary" href="/explore">Explore projects</Link><Link className="button button-outline" href="/"><ArrowLeft size={15} /> Back home</Link></div>} /></section>;
}
