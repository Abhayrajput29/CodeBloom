import { describe, expect, it } from "vitest";
import { safeGitHubRepositoryUrl, safeHttpsUrl } from "@/lib/urls";

describe("external project URLs", () => {
  it("normalizes a plain HTTPS demo host and rejects script or credential URLs", () => {
    expect(safeHttpsUrl("signal.garden")).toBe("https://signal.garden/");
    expect(safeHttpsUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpsUrl("https://user:pass@example.com")).toBeNull();
  });

  it("accepts only HTTPS github.com owner/repository links", () => {
    expect(safeGitHubRepositoryUrl("https://github.com/codebloom/site/")).toBe("https://github.com/codebloom/site");
    expect(safeGitHubRepositoryUrl("http://github.com/codebloom/site")).toBeNull();
    expect(safeGitHubRepositoryUrl("https://example.com/codebloom/site")).toBeNull();
    expect(safeGitHubRepositoryUrl("https://github.com/codebloom/site/tree/main")).toBeNull();
  });
});
