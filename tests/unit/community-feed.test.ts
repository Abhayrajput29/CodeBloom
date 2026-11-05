import { describe, expect, it } from "vitest";
import { projects } from "@/lib/demo-data";
import { getPreviewFeed } from "@/lib/community-feed";

describe("preview community feed", () => {
  it("filters project name, description, author, and tags without case sensitivity", () => {
    expect(getPreviewFeed(projects, "For you", "RUST").map((project) => project.slug)).toContain("ledger-leaf");
    expect(getPreviewFeed(projects, "For you", "noah").map((project) => project.slug)).toEqual(["ledger-leaf"]);
  });

  it("orders New by the fixture age rather than lifetime votes", () => {
    const result = getPreviewFeed(projects, "New");
    expect(result[0]?.time).toBe("2h ago");
    expect(result.at(-1)?.time).toBe("1d ago");
  });

  it("keeps Top as a transparent vote-count order in preview data", () => {
    const result = getPreviewFeed(projects, "Top");
    expect(result[0]?.slug).toBe("signal-garden");
    expect(result.at(-1)?.slug).toBe("tiny-studio");
  });

  it("does not invent followed developers for a signed-out preview", () => {
    expect(getPreviewFeed(projects, "Following")).toEqual([]);
  });
});
