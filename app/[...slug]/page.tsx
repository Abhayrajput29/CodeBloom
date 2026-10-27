import { notFound } from "next/navigation";
import { CommunityView, FeedView, LoginView, ProfileView, ProjectDetail, PublishView, SimplePage } from "@/components/feed-view";

type PageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CatchAllPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const [section, value] = slug;

  if (section === "explore") {
    const initialQuery = typeof search.q === "string" ? search.q : "";
    return <FeedView key={`explore-${initialQuery}`} mode="explore" initialQuery={initialQuery} />;
  }
  if (section === "publish" && slug.length === 1) return <PublishView />;
  if (section === "login" && slug.length === 1) return <LoginView />;
  if (section === "projects" && value && slug.length === 2) return <ProjectDetail slug={value} />;
  if (section === "u" && value && slug.length === 2) return <ProfileView handle={value} />;
  if (section === "communities" && value && slug.length === 2) return <CommunityView slug={value} />;
  if (slug.length === 1 && ["bookmarks", "notifications", "messages", "communities", "settings"].includes(section)) {
    return <SimplePage kind={section as "bookmarks" | "notifications" | "messages" | "communities" | "settings"} />;
  }

  notFound();
}
