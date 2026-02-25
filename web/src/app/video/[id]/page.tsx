import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
        take: 50,
      },
    },
  });

  if (!video) notFound();

  const author = (video.user.name ?? video.user.email) || "Автор";
  const published = new Date(video.createdAt).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4">
        <Link href="/" className="text-sm text-slate-600 hover:underline">
          ← Назад в ленту
        </Link>

        <div className="mt-3">
          <h1 className="text-lg font-semibold tracking-tight">{video.title}</h1>
          <div className="mt-1 text-xs text-slate-600">
            {author} · {published}
          </div>
          {video.description ? (
            <p className="mt-2 text-sm text-slate-700">{video.description}</p>
          ) : null}
        </div>

        <div className="mt-4 mx-auto w-full max-w-sm">
          <video
            className="aspect-[9/16] w-full rounded-2xl bg-slate-100 object-cover"
            src={`/api/videos/${video.id}/file`}
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </section>

      <aside className="rounded-2xl border border-slate-200/70 bg-white p-4">
        <h2 className="text-sm font-semibold tracking-tight">Комментарии</h2>

        {session?.user ? (
          <form
            action={`/api/videos/${video.id}/comments`}
            method="post"
            className="mt-3 grid gap-2"
          >
            <textarea
              name="text"
              rows={3}
              maxLength={500}
              required
              placeholder="Напишите комментарий…"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
            <button
              type="submit"
              className="h-9 rounded-xl bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"
            >
              Отправить
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            <Link href="/signin" className="text-slate-900 underline">
              Войдите
            </Link>
            , чтобы комментировать.
          </p>
        )}

        <div className="mt-4 grid gap-3">
          {video.comments.length === 0 ? (
            <p className="text-sm text-slate-600">Пока нет комментариев.</p>
          ) : (
            video.comments.map((c) => {
              const who = (c.user.name ?? c.user.email) || "Пользователь";
              const when = new Date(c.createdAt).toLocaleDateString("ru-RU", {
                month: "short",
                day: "2-digit",
              });
              return (
                <div key={c.id} className="rounded-xl border border-slate-200/70 p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="truncate text-xs font-medium text-slate-800">
                      {who}
                    </div>
                    <div className="shrink-0 text-xs text-slate-500">{when}</div>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                    {c.text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}

