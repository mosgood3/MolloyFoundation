// app/page.tsx
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Molloy Madness",
  description:
    "Annual charity tournament benefiting cancer research & community causes.",
  openGraph: {
    title: "Molloy Madness",
    description:
      "Join the Molloy Madness charity tournament supporting cancer research and local scholarships.",
    url: "https://www.matthewcmolloyfoundation.org",
    siteName: "Matthew C. Molloy Memorial Foundation",
    images: [
      {
        url: "/team.jpg",
        width: 1200,
        height: 630,
        alt: "Molloy Madness Charity Tournament",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Molloy Madness",
    description:
      "Charity tournament supporting cancer research and scholarships.",
    images: ["/team.jpg"],
    site: "@MattMolloyFound",
  },
};

import Header from "@/components/header";
import HeroSection from "@/components/herosection";
import About from "@/components/about";
import Proceeds from "@/components/proceeds";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <About />
        <Proceeds />
      </main>
      <Footer />
    </>
  );
}
