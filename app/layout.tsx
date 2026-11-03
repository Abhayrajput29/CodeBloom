import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";
import { CommunityProvider } from "@/components/community-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { getPublicSiteOrigin } from "@/lib/public-site";
import "./globals.css";

const publicOrigin = getPublicSiteOrigin();

export const metadata: Metadata = {
  ...(publicOrigin ? { metadataBase: publicOrigin } : {}),
  title: { default: "Code_Bloom", template: "%s · Code_Bloom" },
  description: "A project-centered developer community for discovering, discussing, and building upon software projects.",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <CommunityProvider>
              <AppShell>{children}</AppShell>
            </CommunityProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
