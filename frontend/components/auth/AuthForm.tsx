"use client";

import { useActionState, useId, useState } from "react";
import { login, register } from "@/app/actions/auth";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { TextField } from "@/components/ui/TextField";

const modes = [
  { id: "login", label: "Entrar" },
  { id: "register", label: "Registrar" },
] as const;

const copy = {
  login: { title: "Bem-vindo de volta", subtitle: "Entre para acessar sua biblioteca.", submit: "Entrar" },
  register: { title: "Crie sua conta", subtitle: "Comece a montar sua biblioteca visual.", submit: "Criar conta" },
};

export function AuthForm() {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(login, null);
  const [registerState, registerAction, registerPending] = useActionState(register, null);
  const passwordId = useId();

  const isLogin = mode === "login";
  const state = isLogin ? loginState : registerState;
  const pending = isLogin ? loginPending : registerPending;
  const fieldError = (name: string) => state?.errors?.[name]?.[0];
  const generalError = state?.message && Object.keys(state.errors ?? {}).length === 0 ? state.message : null;

  return (
    <div className="rise-in w-full max-w-sm">
      <Logo large />
      <h1 className="mt-8 lg:mt-10 [@media(max-height:760px)]:mt-6 font-serif text-3xl leading-tight">{copy[mode].title}</h1>
      <p className="mt-2 text-sm text-night-muted">{copy[mode].subtitle}</p>

      <div role="tablist" aria-label="Acesso" className="mt-6 lg:mt-8 [@media(max-height:760px)]:mt-5 flex gap-8 border-b border-night-muted/30">
        {modes.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={mode === item.id}
            onClick={() => setMode(item.id)}
            className={`-mb-px h-11 border-b-2 text-sm transition-colors ${
              mode === item.id
                ? "border-night-text text-night-text"
                : "border-transparent text-night-muted hover:text-night-text"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Form key={mode} action={isLogin ? loginAction : registerAction} aria-busy={pending} className="mt-6 space-y-5 [@media(max-height:760px)]:space-y-4">
        {generalError && (
          <p role="alert" className="rounded-sm border border-night-danger/40 bg-night-danger/10 px-4 py-3 text-sm text-night-danger">
            {generalError}
          </p>
        )}
        {!isLogin && <TextField tone="night" label="Nome" name="name" autoComplete="name" required error={fieldError("name")} />}
        <TextField tone="night" label="E-mail" name="email" type="email" autoComplete="email" required error={fieldError("email")} />
        <div className="space-y-2">
          <TextField
            tone="night"
            id={passwordId}
            label="Senha"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            error={fieldError("password")}
            trailing={
              <button
                type="button"
                aria-pressed={showPassword}
                aria-controls={passwordId}
                onClick={() => setShowPassword((current) => !current)}
                className="h-9 rounded-sm px-3 text-xs text-night-muted transition-colors hover:text-night-text"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            }
          />
          {isLogin && (
            <div className="flex justify-end">
              <button type="button" disabled title="Recuperação de senha em breve" className="text-xs text-night-muted/80 underline decoration-dotted underline-offset-4 disabled:cursor-not-allowed">
                Esqueceu a senha? <span className="no-underline">· em breve</span>
              </button>
            </div>
          )}
        </div>
        {!isLogin && (
          <TextField
            tone="night"
            label="Confirmar senha"
            name="password_confirmation"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
          />
        )}
        <Button variant="night" type="submit" disabled={pending} className="h-12 w-full rounded-sm!">
          {pending ? "Aguarde…" : copy[mode].submit}
        </Button>
      </Form>

      <div className="my-6 [@media(max-height:760px)]:my-4 flex items-center gap-4 text-xs text-night-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-night-muted/30" />
        ou
        <span className="h-px flex-1 bg-night-muted/30" />
      </div>

      <button
        type="button"
        disabled
        title="Login com Google em breve"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-sm border border-night-muted/60 text-sm text-night-text/80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continuar com Google
        <span className="rounded-full border border-night-muted/60 px-2 py-0.5 text-[11px] text-night-muted">em breve</span>
      </button>

      <p className="mt-8 [@media(max-height:760px)]:mt-5 text-center text-sm text-night-muted">
        {isLogin ? "Ainda não tem conta? " : "Já tem uma conta? "}
        <button
          type="button"
          onClick={() => setMode(isLogin ? "register" : "login")}
          className="rounded-sm text-night-text underline underline-offset-4 hover:text-night-text/80"
        >
          {isLogin ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </div>
  );
}
