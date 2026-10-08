import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { AuthForm } from "@/components/auth/AuthForm";
import { getOptionalUser } from "@/lib/data";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getOptionalUser()) {
    redirect("/");
  }

  return (
    <main className="grid min-h-screen bg-night text-night-text lg:grid-cols-[1.2fr_1fr]">
      <section
        className="relative flex min-h-[18rem] flex-col justify-between bg-cover bg-center p-8 sm:p-12"
        style={{ backgroundImage: "url(/images/backgrounds/prism-beam.png)" }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-night/30" />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md space-y-3 py-10">
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Explore. Colecione. Descubra.
          </h1>
          <p className="text-sm text-night-muted">
            Sua biblioteca pessoal de referências visuais.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center border-t border-night-border bg-night-surface/60 p-8 lg:border-l lg:border-t-0">
        <AuthForm />
      </section>
    </main>
  );
}
