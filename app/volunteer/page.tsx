import Header from "@/components/header";
import Footer from "@/components/footer";
import VolunteerForm from "@/components/volunteer-form";

export const metadata = {
  title: "Volunteer — Molloy Madness",
  description:
    "Sign up to volunteer at the Molloy Madness 3v3 charity basketball tournament.",
};

export default function VolunteerPage() {
  return (
    <>
      <Header />
      <main>
        <VolunteerForm />
      </main>
      <Footer />
    </>
  );
}
