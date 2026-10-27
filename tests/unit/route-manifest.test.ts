import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type RouteManifest = {
  routes: Array<{ path: string; title?: string }>;
};

const manifest = JSON.parse(
  readFileSync(new URL("../../public/manus-routes.json", import.meta.url), "utf8"),
) as RouteManifest;

describe("public route manifest", () => {
  it("declares the CodeBloom home route", () => {
    expect(manifest.routes).toContainEqual({ path: "/", title: "CodeBloom" });
  });

  it("contains unique absolute route paths", () => {
    const paths = manifest.routes.map((route) => route.path);

    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => path.startsWith("/"))).toBe(true);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("includes parameterized project, profile, and community pages", () => {
    const paths = manifest.routes.map((route) => route.path);
    expect(paths).toContain("/projects/:slug");
    expect(paths).toContain("/u/:handle");
    expect(paths).toContain("/communities/:slug");
  });
});
