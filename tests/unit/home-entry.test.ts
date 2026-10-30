import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, redirect } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  redirect: vi.fn((destination: string) => { throw new Error(`redirect:${destination}`); }),
}));

vi.mock("@/lib/auth", () => ({ getAuthenticatedUser }));
vi.mock("@/components/landing-page", () => ({ LandingPage: vi.fn(() => null) }));
vi.mock("next/navigation", () => ({ redirect }));

import HomePage from "@/app/page";
import { LandingPage } from "@/components/landing-page";

describe("public root entry", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends an authenticated visitor to the dashboard", async () => {
    getAuthenticatedUser.mockResolvedValue({ id: "member-1" });
    await expect(HomePage()).rejects.toThrow("redirect:/dashboard");
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("keeps the landing page public for guests", async () => {
    getAuthenticatedUser.mockResolvedValue(null);
    const result = await HomePage();
    expect(result.type).toBe(LandingPage);
  });
});
