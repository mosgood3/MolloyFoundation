import Header from "@/components/header";
import Footer from "@/components/footer";
import AdminLoginForm from "@/components/admin-login";

export const metadata = {
  title: "Admin Login — Molloy Madness",
};

export default function AdminLoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        {/* Hero band — matches /teams layout */}
        <div className="pt-32 pb-12 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-3">
              Authorized Access Only
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-slate-800">
              Admin Dashboard
            </h1>
          </div>
        </div>

        <AdminLoginForm />
      </main>
      <Footer />
    </>
  );
}
