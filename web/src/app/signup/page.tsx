import Link from "next/link";

const ERROR_TEXT: Record<string, string> = {
  email_taken: "Этот email уже зарегистрирован.",
  invalid: "Проверьте введённые данные.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const errorText = error
    ? ERROR_TEXT[error] ?? "Не удалось создать аккаунт."
    : null;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
        <h1 className="text-lg font-semibold tracking-tight">Регистрация</h1>
        <p className="mt-1 text-sm text-slate-600">
          Создайте аккаунт, чтобы загружать видео и комментировать.
        </p>

        {errorText ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {errorText}
          </div>
        ) : null}

        <form action="/api/signup" method="post" className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">
              Имя (опционально)
            </span>
            <input
              name="name"
              type="text"
              maxLength={40}
              autoComplete="nickname"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            />
          </label>
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
              minLength={8}
              autoComplete="new-password"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            />
            <span className="text-xs text-slate-500">Минимум 8 символов.</span>
          </label>
          <button
            type="submit"
            className="mt-2 h-10 rounded-xl bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"
          >
            Создать аккаунт
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link href="/signin" className="text-slate-900 underline">
            Войти
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

