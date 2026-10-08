import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NavHistory } from "@/components/NavHistory";
import { registryOrigin } from "@/lib/registry";
import { ORB_STATES } from "@/lib/orbs/config";

// Geist is the sans face and backs --font-sans, so `font-sans` resolves to it.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const TOTAL = Object.keys(ORB_STATES).length;
const DESCRIPTION = `${TOTAL} thinking-state loaders for React: dotted 3D orbs drawn on one canvas engine, one per state your agent can be in. Install with the shadcn CLI — the code is yours.`;

export const metadata: Metadata = {
  // Absolute URLs for the OpenGraph image etc. Same origin the registry uses.
  metadataBase: new URL(registryOrigin()),
  title: {
    default: "orbish — thinking orbs for React",
    // Child routes set just their own name: "Docs · orbish".
    template: "%s · orbish",
  },
  description: DESCRIPTION,
  openGraph: { title: "orbish", description: DESCRIPTION, type: "website", siteName: "orbish" },
  twitter: { card: "summary_large_image", title: "orbish", description: DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Browser extensions inject attributes on <html>/<body> before hydration,
    // which React reports as a mismatch. Suppression is one level deep, so
    // real mismatches inside the tree still surface.
    <html
      lang="en"
      className={cn(geistSans.variable, geistMono.variable, "h-full font-sans antialiased")}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <NavHistory />
        {children}
      </body>
    </html>
  );
}
