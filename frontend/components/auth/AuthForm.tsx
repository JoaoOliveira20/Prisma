"use client";

import { useActionState, useState } from "react";
import { login, register } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/ui/Form";
import { TextField } from "@/components/ui/TextField";

const modes = [
  { id: "login", label: "Entrar" },
  { id: "register", label: "Registrar" },
] as const;

export function AuthForm() {
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("login");
  const [loginState, loginAction, loginPending] = useActionState(login, null);
  const [registerState, registerAction, registerPending] = useActionState(register, null);

  const isLogin = mode === "login";
  const state = isLogin ? loginState : registerState;
  const pending = isLogin ? loginPending : registerPending;
  const fieldError = (name: string) => state?.errors?.[name]?.[0];

  return (
    <div className="w-full max-w-sm space-y-6">
      <div role="tablist" aria-label="Acesso" className="grid grid-cols-2 border-b border-night-border">
        {modes.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={mode === item.id}
            onClick={() => setMode(item.id)}
            className={`pb-3 text-sm transition-colors ${
              mode === item.id
                ? "border-b-2 border-night-text text-night-text"
                : "text-night-muted hover:text-night-text"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Form key={mode} action={isLogin ? loginAction : registerAction} className="space-y-4">
        {!isLogin && <TextField tone="night" label="Nome" name="name" autoComplete="name" required error={fieldError("name")} />}
        <TextField tone="night" label="E-mail" name="email" type="email" autoComplete="email" required error={fieldError("email")} />
        <TextField
          tone="night"
          label="Senha"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          error={fieldError("password")}
        />
        {!isLogin && (
          <TextField
            tone="night"
            label="Confirmar senha"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
          />
        )}
        {state?.message && Object.keys(state.errors ?? {}).length === 0 && (
          <p className="text-sm text-night-danger" role="alert">{state.message}</p>
        )}
        <Button variant="night" type="submit" disabled={pending} className="w-full">
          {pending ? "Aguarde…" : isLogin ? "Entrar" : "Criar conta"}
        </Button>
      </Form>
    </div>
  );
}
