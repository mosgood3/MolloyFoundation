import Header from '@/components/header';
import Footer from '@/components/footer';
import RegisterTeamForm from '@/components/register';

export const metadata = {
  title: "Register — Molloy Madness",
  description: "Register your team or sign up as a singles player for the 4th Annual Molloy Madness tournament.",
};

export default function Register() {
  return (
    <>
      <Header />
      <main>
        <RegisterTeamForm />
      </main>
      <Footer />
    </>
  );
}
