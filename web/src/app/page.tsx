import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/server/db";

export default async function Home() {
  const session = await auth();
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4">
        <h1 className="text-lg font-semibold tracking-tight">Лента</h1>
        <p className="mt-1 text-sm text-slate-600">
          Вертикальные видео. Загружайте свои и оставляйте комментарии.
        </p>
        {!session?.user ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/signup"
              className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Создать аккаунт
            </Link>
            <Link
              href="/signin"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Войти
            </Link>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href="/upload"
              className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Загрузить видео
            </Link>
          </div>
        )}
      </section>

      {videos.length === 0 ? (
        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 text-center">
          <p className="text-sm text-slate-600">Пока нет видео.</p>
          <p className="mt-1 text-sm text-slate-600">
            Начните с{" "}
            <Link href="/upload" className="text-slate-900 underline">
              загрузки
            </Link>
            .
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          <div className="h-[calc(100dvh-11rem)] overflow-y-auto snap-y snap-mandatory">
            {videos.map((video) => (
              <article
                key={video.id}
                className="snap-start border-b border-slate-200/70 p-4 last:border-b-0"
              >
                <div className="mx-auto w-full max-w-sm">
                  <video
                    className="aspect-[9/16] w-full rounded-2xl bg-slate-100 object-cover"
                    src={`/api/videos/${video.id}/file`}
                    controls
                    playsInline
                    preload="metadata"
                  />

                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/video/${video.id}`}
                        className="block truncate text-sm font-semibold text-slate-900 hover:underline"
                      >
                        {video.title}
                      </Link>
                      <div className="mt-0.5 text-xs text-slate-600">
                        {(video.user.name ?? video.user.email) || "Автор"} ·{" "}
                        {video._count.comments} комм.
                      </div>
                    </div>
                    <Link
                      href={`/video/${video.id}`}
                      className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                    >
                      Открыть
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
