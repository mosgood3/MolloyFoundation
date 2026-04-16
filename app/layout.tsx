import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/meta-pixel";

// Import Inter font and assign it to a CSS variable (optional)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.matthewcmolloyfoundation.org"),
  title: "Molloy Madness",
  description: "Matthew C. Molloy Foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased" suppressHydrationWarning>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
