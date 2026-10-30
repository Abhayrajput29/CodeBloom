import { describe, expect, it } from "vitest";
import { projectInputSchema } from "../../lib/validation/projects";

const validProject = {
  name: "Signal Garden",
  tagline: "A calmer way to understand your notifications.",
  description: "A small open-source inbox that groups noisy events into patterns you can act on with confidence.",
  repositoryUrl: "https://github.com/codebloom/signal-garden",
  tags: ["typescript", "next.js"],
};

describe("project publishing validation", () => {
  it("accepts a bounded GitHub project payload", () => {
    expect(projectInputSchema.parse(validProject)).toMatchObject(validProject);
  });

  it("rejects arbitrary repository hosts", () => {
    expect(() => projectInputSchema.parse({ ...validProject, repositoryUrl: "https://example.com/project" })).toThrow();
  });

  it("rejects a project without topics", () => {
    expect(() => projectInputSchema.parse({ ...validProject, tags: [] })).toThrow();
  });

  it("normalizes and deduplicates topics using the database-supported character set", () => {
    expect(projectInputSchema.parse({ ...validProject, tags: ["TypeScript", "typescript", "C++"] }).tags).toEqual(["typescript", "c++"]);
    expect(projectInputSchema.safeParse({ ...validProject, tags: ["AI/ML"] }).success).toBe(false);
  });

  it("requires an HTTPS GitHub repository URL", () => {
    expect(() => projectInputSchema.parse({ ...validProject, repositoryUrl: "http://github.com/codebloom/app" })).toThrow();
    expect(() => projectInputSchema.parse({ ...validProject, repositoryUrl: "https://github.com/codebloom/app/path" })).toThrow();
  });
});
