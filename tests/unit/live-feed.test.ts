import { describe, expect, it } from "vitest";
import { mapLiveProjectRows, sortLiveFeed, type LiveFeedSocialRows, type LiveProjectRow } from "@/lib/live-feed";

const baseRow: LiveProjectRow = {
  id: "11111111-1111-4111-8111-111111111111",
  owner_id: "22222222-2222-4222-8222-222222222222",
  slug: "garden-tool-12345678",
  name: "Garden Tool",
  tagline: "A thoughtful project for curious developers.",
  description: "A project description that is long enough for the live schema checks.",
  repository_url: "https://github.com/example/garden-tool",
  demo_url: null,
  status: "published",
  created_at: new Date(Date.now() - 3_600_000).toISOString(),
  profiles: { username: "garden_dev", display_name: "Garden Developer" },
  project_tags: [{ tag: "typescript" }, { tag: "open source" }],
};
const emptySocial: LiveFeedSocialRows = { voteTotals: [], userVotes: [], commentTotals: [], comments: [], bookmarks: [], follows: [] };

describe("live project feed mapping", () => {
  it("normalizes database projects and applies only aggregate and viewer-specific social data", () => {
    const mapped = mapLiveProjectRows([baseRow], {
      ...emptySocial,
      voteTotals: [{ project_id: baseRow.id, score: 4, upvotes: 5, downvotes: 1 }],
      userVotes: [{ project_id: baseRow.id, value: 1 }],
      commentTotals: [{ project_id: baseRow.id, comment_count: 12 }],
      bookmarks: [{ project_id: baseRow.id }],
      follows: [{ followed_id: baseRow.owner_id }],
      comments: [{ id: "comment-1", project_id: baseRow.id, body: "A helpful note.", created_at: "2026-10-28T12:00:00.000Z", author_id: "author-1", profiles: { username: "commenter_1", display_name: "Commenter One" } }],
    });
    expect(mapped).toHaveLength(1);
    expect(mapped[0]).toMatchObject({
      id: baseRow.id,
      ownerId: baseRow.owner_id,
      handle: "garden_dev",
      author: "Garden Developer",
      votes: 4,
      score: 4,
      vote: 1,
      comments: 12,
      commentsCount: 12,
      bookmarked: true,
      followingCreator: true,
      live: true,
      tags: ["typescript", "open source"],
    });
    expect(mapped[0].recentComments[0]).toMatchObject({ authorUsername: "commenter_1", body: "A helpful note." });
  });

  it("keeps missing social aggregates at zero and follows only actual followed creators", () => {
    const other = { ...baseRow, id: "33333333-3333-4333-8333-333333333333", owner_id: "44444444-4444-4444-8444-444444444444", slug: "other-project-12345678" };
    const mapped = mapLiveProjectRows([baseRow, other], emptySocial);
    expect(mapped[0].score).toBe(0);
    expect(mapped[0].bookmarked).toBe(false);
    expect(sortLiveFeed(mapped, "Following")).toEqual([]);
  });

  it("sorts by server timestamps and aggregate score and filters project metadata", () => {
    const older = { ...baseRow, created_at: new Date(Date.now() - 4 * 3_600_000).toISOString(), slug: "older-project-12345678", name: "Older Project" };
    const newer = { ...baseRow, id: "55555555-5555-4555-8555-555555555555", created_at: new Date(Date.now() - 10 * 60_000).toISOString(), slug: "newer-project-12345678", name: "Newer Project" };
    const rows = mapLiveProjectRows([older, newer], { ...emptySocial, voteTotals: [{ project_id: older.id, score: 1, upvotes: 1, downvotes: 0 }, { project_id: newer.id, score: 9, upvotes: 9, downvotes: 0 }] });
    expect(sortLiveFeed(rows, "New").map((project) => project.name)).toEqual(["Newer Project", "Older Project"]);
    expect(sortLiveFeed(rows, "Top").map((project) => project.name)).toEqual(["Newer Project", "Older Project"]);
    expect(sortLiveFeed(rows, "For you", "garden").map((project) => project.name)).toEqual(["Older Project", "Newer Project"]);
  });
});
