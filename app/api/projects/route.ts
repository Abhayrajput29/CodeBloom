import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { projectInputSchema } from "@/lib/validation/projects";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("projects").select("id, slug, name, tagline, description, repository_url, demo_url, status, created_at, profiles!projects_owner_id_fkey(username, display_name), project_tags(tag)").eq("visibility", "public").order("created_at", { ascending: false }).limit(50);
    if (error) throw error;
    return NextResponse.json({ projects: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load projects." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const input = projectInputSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to publish a project." }, { status: 401 });
    const slugBase = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
    const { data: project, error } = await supabase.from("projects").insert({ owner_id: user.id, slug, name: input.name, tagline: input.tagline, description: input.description, repository_url: input.repositoryUrl, demo_url: input.demoUrl || null }).select("id, slug").single();
    if (error) throw error;
    const { error: tagsError } = await supabase.from("project_tags").insert(input.tags.map((tag) => ({ project_id: project.id, tag: tag.toLowerCase() })));
    if (tagsError) throw tagsError;
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return NextResponse.json({ error: "Please correct the highlighted project fields." }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to publish project." }, { status: 500 });
  }
}
