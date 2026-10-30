import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { mapLiveProjectRows, type LiveFeedSocialRows, type LiveProjectRow } from "@/lib/live-feed";

const projectSelection = "id, owner_id, slug, name, tagline, description, repository_url, demo_url, status, created_at, profiles!projects_owner_id_fkey(username, display_name), project_tags(tag)";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!getSupabaseConfig()) return NextResponse.json({ error: "The live project service is not configured." }, { status: 503 });
  const { slug } = await context.params;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: row, error: projectError } = await supabase.from("projects").select(projectSelection).eq("slug", slug).eq("visibility", "public").eq("status", "published").maybeSingle();
    if (projectError) return NextResponse.json({ error: "Unable to load this live project." }, { status: 503 });
    if (!row) return NextResponse.json({ error: "Project not found." }, { status: 404 });
    const project = row as unknown as LiveProjectRow;
    const [voteTotals, userVotes, commentTotals, comments, bookmarks, follows] = await Promise.all([
      supabase.from("project_vote_totals").select("project_id, score, upvotes, downvotes").eq("project_id", project.id),
      user ? supabase.from("project_votes").select("project_id, value").eq("user_id", user.id).eq("project_id", project.id) : Promise.resolve({ data: [], error: null }),
      supabase.from("project_comment_totals").select("project_id, comment_count").eq("project_id", project.id),
      supabase.from("project_comments").select("id, project_id, body, created_at, author_id, profiles!project_comments_author_id_fkey(username, display_name)").eq("project_id", project.id).order("created_at", { ascending: false }).limit(3),
      user ? supabase.from("bookmarks").select("project_id").eq("user_id", user.id).eq("project_id", project.id) : Promise.resolve({ data: [], error: null }),
      user ? supabase.from("creator_follows").select("followed_id").eq("follower_id", user.id) : Promise.resolve({ data: [], error: null }),
    ]);
    const error = voteTotals.error ?? userVotes.error ?? commentTotals.error ?? comments.error ?? bookmarks.error ?? follows.error;
    if (error) return NextResponse.json({ error: "Live project social data is unavailable. Apply the live social migration." }, { status: 503 });
    const social = {
      voteTotals: voteTotals.data ?? [],
      userVotes: userVotes.data ?? [],
      commentTotals: commentTotals.data ?? [],
      comments: comments.data ?? [],
      bookmarks: bookmarks.data ?? [],
      follows: follows.data ?? [],
    } as LiveFeedSocialRows;
    const [liveProject] = mapLiveProjectRows([project], social);
    return NextResponse.json({ project: liveProject }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "The live project service is unavailable." }, { status: 503 });
  }
}
