import { describe, expect, it } from "vitest";
import { authCallbackRedirectUrl, authSuccessDestination, safeAuthDestination } from "@/lib/auth-destination";

describe("safeAuthDestination", () => {
  it("keeps valid local paths including query and fragment", () => {
    expect(safeAuthDestination("/publish?draft=1#details")).toBe("/publish?draft=1#details");
  });

  it("falls back for external, protocol-relative, and backslash paths", () => {
    expect(safeAuthDestination("https://evil.example/path")).toBe("/dashboard");
    expect(safeAuthDestination("//evil.example/path")).toBe("/dashboard");
    expect(safeAuthDestination("/\\evil.example")).toBe("/dashboard");
    expect(safeAuthDestination(null)).toBe("/dashboard");
  });
});

describe("authSuccessDestination", () => {
  it("marks the default signup dashboard for the welcome journey", () => {
    expect(authSuccessDestination("/dashboard?source=landing", "signup")).toBe("/dashboard?source=landing&welcome=1");
  });

  it("preserves the requested destination and does not add a welcome marker to login", () => {
    expect(authSuccessDestination("/publish?draft=1#details", "signup")).toBe("/publish?draft=1#details");
    expect(authSuccessDestination("/dashboard", "login")).toBe("/dashboard");
  });
});

describe("authCallbackRedirectUrl", () => {
  it("adds the welcome notice only for a signup confirmation on the local origin", () => {
    const url = authCallbackRedirectUrl("https://codebloom.test/auth/callback?code=one-time", "/dashboard", true);
    expect(url.origin).toBe("https://codebloom.test");
    expect(url.pathname).toBe("/dashboard");
    expect(url.searchParams.get("auth_notice")).toBe("confirmed");
    expect(url.searchParams.has("code")).toBe(false);
  });

  it("preserves a safe destination query and fragment without adding a login notice for other flows", () => {
    const url = authCallbackRedirectUrl("https://codebloom.test/auth/callback", "/publish?draft=1#details", false);
    expect(url.pathname).toBe("/publish");
    expect(url.searchParams.get("draft")).toBe("1");
    expect(url.hash).toBe("#details");
    expect(url.searchParams.has("auth_notice")).toBe(false);
  });

  it("falls back to the dashboard instead of redirecting outside the app", () => {
    const url = authCallbackRedirectUrl("https://codebloom.test/auth/callback", "https://evil.example", true);
    expect(url.origin).toBe("https://codebloom.test");
    expect(url.pathname).toBe("/dashboard");
  });
});
