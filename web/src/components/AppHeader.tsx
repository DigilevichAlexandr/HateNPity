import Link from "next/link";
import Image from "next/image";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";

export async function AppHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="HateNPity" width={32} height={32} />
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            HateNPity
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            Лента
          </Link>
          <Link
            href="/upload"
            className="rounded-full px-3 py-1.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            Загрузка
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <span className="hidden max-w-[18rem] truncate text-xs text-slate-600 sm:inline">
                {session.user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/signin"
              className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

