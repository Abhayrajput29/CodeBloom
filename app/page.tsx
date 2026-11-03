import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { getAuthenticatedUser } from "@/lib/auth";
import { createPublicPageMetadata } from "@/lib/seo";
import "./landing.css";

export const metadata = {
  ...createPublicPageMetadata(
    "Code_Bloom",
    "Explore open-source projects, developer tools, and experiments on CodeBloom. Read project stories, browse topics, and find your next idea to build.",
    "/",
  ),
  title: { absolute: "Code_Bloom" },
};

export default async function HomePage() {
  if (await getAuthenticatedUser()) redirect("/dashboard");
  return <LandingPage />;
}
