import { Suspense } from "react";

import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
            <div className="h-5 w-24 rounded bg-slate-100" />
            <div className="mt-3 h-4 w-52 rounded bg-slate-100" />
            <div className="mt-6 grid gap-3">
              <div className="h-10 rounded-xl bg-slate-100" />
              <div className="h-10 rounded-xl bg-slate-100" />
              <div className="mt-2 h-10 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

