import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getOptionalUser } from "@/lib/data";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getOptionalUser()) {
    redirect("/");
  }

  return (
    <main className="night-scope relative isolate min-h-screen overflow-hidden bg-night text-night-text">
      <div
        aria-hidden="true"
        className="login-art absolute inset-x-0 top-0 -z-30 h-[44svh] sm:h-[48svh] bg-[length:auto_85%] bg-[position:39%_0] bg-no-repeat sm:bg-[length:100%_auto] sm:bg-[position:50%_0]"
        style={{ backgroundImage: "url(/images/backgrounds/prism-beam.png)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-20 h-[44svh] sm:h-[48svh] bg-linear-to-b from-night/10 to-night lg:hidden"
      />
      <div aria-hidden="true" className="login-fade -z-20" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-linear-to-t from-night/70 via-transparent to-night/30 lg:block" />
      <div aria-hidden="true" className="film-grain pointer-events-none absolute inset-0 -z-10" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[120rem] flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(26rem,32rem)] lg:pr-[clamp(2rem,7vw,7rem)]">
        <section className="flex h-[44svh] sm:h-[48svh] flex-col justify-end px-6 pb-8 lg:h-auto lg:px-[clamp(2rem,5vw,5rem)] lg:pb-16">
          <p className="max-w-md font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">Uma coisa → várias dimensões.</p>
          <p className="mt-3 hidden max-w-sm text-sm text-night-muted sm:block">Sua biblioteca pessoal de referências visuais, estéticas e conceituais.</p>
        </section>
        <section className="flex items-center justify-center px-6 pb-12 pt-4 lg:py-8">
          <AuthForm />
        </section>
      </div>
    </main>
  );
}
