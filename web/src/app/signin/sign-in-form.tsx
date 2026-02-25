"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";

const ERROR_TEXT: Record<string, string> = {
  CredentialsSignin: "Неверный email или пароль.",
};

export function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const initialError = useMemo(() => {
    const e = sp.get("error");
    return e ? (ERROR_TEXT[e] ?? "Не удалось войти.") : null;
  }, [sp]);

  const created = sp.get("created") === "1";
  const [errorText, setErrorText] = useState<string | null>(initialError);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrorText(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    setPending(false);

    if (res?.error) {
      setErrorText(ERROR_TEXT[res.error] ?? "Не удалось войти.");
      return;
    }

    router.push(res?.url ?? "/");
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
        <h1 className="text-lg font-semibold tracking-tight">Вход</h1>
        <p className="mt-1 text-sm text-slate-600">Введите email и пароль.</p>

        {created ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Аккаунт создан. Теперь можно войти.
          </div>
        ) : null}

        {errorText ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {errorText}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Пароль</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 h-10 rounded-xl bg-slate-900 text-sm font-medium text-white enabled:hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Входим…" : "Войти"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link href="/signup" className="text-slate-900 underline">
            Регистрация
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

