import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type RouteManifest = {
  routes: Array<{ path: string; title?: string }>;
};

const manifest = JSON.parse(
  readFileSync(new URL("../../public/manus-routes.json", import.meta.url), "utf8"),
) as RouteManifest;

describe("public route manifest", () => {
  it("declares the public landing and authentication routes", () => {
    expect(manifest.routes).toContainEqual({ path: "/", title: "CodeBloom public landing" });
    expect(manifest.routes).toContainEqual({ path: "/login", title: "Sign in" });
    expect(manifest.routes).toContainEqual({ path: "/signup", title: "Create account" });
    expect(manifest.routes).toContainEqual({ path: "/dashboard", title: "Community feed (sign-in required)" });
    expect(manifest.routes).toContainEqual({ path: "/settings/profile", title: "Developer profile (sign-in required)" });
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
