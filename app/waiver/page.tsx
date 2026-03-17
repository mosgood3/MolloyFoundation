import { Suspense } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import WaiverClient from "@/components/waiver-client";

export const metadata = {
  title: "Sign Waiver — Molloy Madness",
  description: "Sign your tournament waiver for the Molloy Madness 3v3 charity basketball tournament.",
};

export default function WaiverPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-28 pb-16 px-4">
        <Suspense
          fallback={
            <div className="text-center py-20 text-gray-400">Loading...</div>
          }
        >
          <WaiverClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
