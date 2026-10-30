import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function HomePage() {
  if (await getAuthenticatedUser()) redirect("/dashboard");
  return <LandingPage />;
}
