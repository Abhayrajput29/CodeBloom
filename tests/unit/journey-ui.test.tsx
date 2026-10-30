// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  router: { replace: vi.fn(), refresh: vi.fn() },
  refreshAuth: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("next/link", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react");
  return { default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => ReactModule.createElement("a", { href, ...props }, children) };
});
vi.mock("next/navigation", () => ({ useRouter: () => mocks.router }));
vi.mock("@/components/auth-provider", () => ({ useAuth: () => ({ configured: true, refresh: mocks.refreshAuth }) }));
vi.mock("@/components/theme-provider", () => ({ useTheme: () => ({ theme: "dark", toggleTheme: vi.fn() }) }));
vi.mock("@/lib/supabase/browser", () => ({ createSupabaseBrowserClient: () => ({ auth: {
  signUp: mocks.signUp,
  signInWithPassword: mocks.signInWithPassword,
  resetPasswordForEmail: mocks.resetPasswordForEmail,
  updateUser: mocks.updateUser,
} }) }));
vi.mock("@/components/project-card", async () => {
  const ReactModule = await vi.importActual<typeof import("react")>("react");
  return { ProjectArtwork: ({ project }: { project: { name: string } }) => ReactModule.createElement("div", { role: "img", "aria-label": `${project.name} artwork` }) };
});

import { AuthPage } from "@/components/auth-page";
import { DashboardWelcome } from "@/components/dashboard-welcome";
import { LandingPage } from "@/components/landing-page";

afterEach(() => cleanup());
beforeEach(() => {
  vi.clearAllMocks();
  mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
  mocks.refreshAuth.mockResolvedValue(undefined);
});

function fillSignupForm(password: string, confirmation: string) {
  fireEvent.change(screen.getByLabelText("Email address", {exact: true}), { target: { value: "builder@example.test" } });
  fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), { target: { value: password } });
  fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), { target: { value: confirmation } });
  const form = screen.getByRole("button", { name: /create account/i }).closest("form");
  if (!form) throw new Error("Signup form not found");
  fireEvent.submit(form);
}

describe("entry and first-run journey", () => {
  it("offers a direct account path and a clearly labelled guest exploration path", () => {
    render(<LandingPage />);
    expect(screen.getAllByRole("link", { name: /create (your )?account/i }).every((link) => link.getAttribute("href") === "/signup")).toBe(true);
    expect(screen.getByRole("link", { name: "Explore as a guest" }).getAttribute("href")).toBe("/explore");
    expect(screen.getAllByRole("link", { name: "Sign in" }).every((link) => link.getAttribute("href") === "/login")).toBe(true);
  });

  it("blocks signup before Supabase when the password confirmation differs", async () => {
    render(<AuthPage mode="signup" />);
    fillSignupForm("correct-horse-7", "different-password");
    expect(await screen.findByRole("alert")).toHaveTextContent("Those passwords do not match");
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("sends a matching signup back to the dashboard welcome journey when a session is returned", async () => {
    mocks.signUp.mockResolvedValue({ data: { session: { user: { id: "test-user" } } }, error: null });
    render(<AuthPage mode="signup" next="/dashboard?source=landing" />);
    fillSignupForm("correct-horse-7", "correct-horse-7");
    await waitFor(() => expect(mocks.router.replace).toHaveBeenCalledWith("/dashboard?source=landing&welcome=1"));
    expect(mocks.refreshAuth).toHaveBeenCalledOnce();
  });

  it("shows an email-confirmation step when signup requires verification", async () => {
    render(<AuthPage mode="signup" />);
    fillSignupForm("correct-horse-7", "correct-horse-7");
    expect(await screen.findByRole("status")).toHaveTextContent("Check your email to confirm your account");
    expect(mocks.router.replace).not.toHaveBeenCalled();
  });

  it("gives new members three useful next steps and explains live account sync", () => {
    render(<DashboardWelcome emailConfirmed />);
    expect(screen.getByRole("heading", { name: "Welcome to your workshop." })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Get started on CodeBloom" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /make it yours/i }).getAttribute("href")).toBe("/settings/profile");
    expect(screen.getByRole("link", { name: /find inspiration/i }).getAttribute("href")).toBe("/explore");
    expect(screen.getByRole("link", { name: /share a build/i }).getAttribute("href")).toBe("/publish");
    expect(screen.getByRole("status")).toHaveTextContent("Email confirmed");
    expect(screen.getByRole("status")).toHaveTextContent("sync to your account");
  });
});
