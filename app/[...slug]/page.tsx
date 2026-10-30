import { redirect, notFound } from "next/navigation";
import { AuthPage } from "@/components/auth-page";
import { CommunityView, FeedView, ProfileView, ProjectDetail, PublishView, SimplePage } from "@/components/feed-view";
import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { getAuthenticatedUser } from "@/lib/auth";
import { safeAuthDestination } from "@/lib/auth-destination";
import { getPublicProfileByUsername } from "@/lib/profiles";

type PageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function single(value: string | string[] | undefined) { return typeof value === "string" ? value : null; }

export default async function CatchAllPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const [section, value] = slug;
  const next = safeAuthDestination(single(search.next));

  if (section === "login" && slug.length === 1) {
    if (await getAuthenticatedUser()) redirect(next);
    return <AuthPage mode="login" next={next} authError={single(search.auth_error) === "callback"} />;
  }
  if (section === "signup" && slug.length === 1) {
    if (await getAuthenticatedUser()) redirect(next);
    return <AuthPage mode="signup" next={next} />;
  }
  if (section === "forgot-password" && slug.length === 1) return <AuthPage mode="forgot" next={next} />;
  if (section === "reset-password" && slug.length === 1) return <AuthPage mode="reset" next={next} />;
  if (section === "explore") {
    const initialQuery = single(search.q) ?? "";
    return <FeedView key={`explore-${initialQuery}`} mode="explore" initialQuery={initialQuery} />;
  }
  if (section === "projects" && value && slug.length === 2) return <ProjectDetail slug={value} />;
  if (section === "u" && value && slug.length === 2) return <ProfileView handle={value} profile={await getPublicProfileByUsername(value)} />;
  if (section === "communities" && value && slug.length === 2) return <CommunityView slug={value} />;
  if (section === "communities" && slug.length === 1) return <SimplePage kind="communities" />;

  if (section === "settings" && value === "profile" && slug.length === 2) {
    if (!(await getAuthenticatedUser())) redirect(`/login?next=${encodeURIComponent("/settings/profile")}`);
    return <ProfileSettingsForm />;
  }

  const protectedRoutes = new Set(["dashboard", "publish", "bookmarks", "notifications", "messages", "settings"]);
  if (slug.length === 1 && protectedRoutes.has(section)) {
    if (!(await getAuthenticatedUser())) redirect(`/login?next=${encodeURIComponent(`/${section}`)}`);
    if (section === "dashboard") return <FeedView mode="home" welcome={single(search.welcome) === "1"} authConfirmed={single(search.auth_notice) === "confirmed"} />;
    if (section === "publish") return <PublishView />;
    return <SimplePage kind={section as "bookmarks" | "notifications" | "messages" | "settings"} />;
  }

  notFound();
}
