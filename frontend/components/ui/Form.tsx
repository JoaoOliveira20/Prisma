"use client";

import { useTransition, type ComponentProps } from "react";

type FormProps = Omit<ComponentProps<"form">, "action" | "onSubmit"> & {
  action: (formData: FormData) => void;
};

export function Form({ action, ...props }: FormProps) {
  const [, startTransition] = useTransition();

  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => action(formData));
      }}
    />
  );
}
