import Link from "next/link";

import { auth } from "@/auth";

export default async function UploadPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
          <h1 className="text-lg font-semibold tracking-tight">Загрузка видео</h1>
          <p className="mt-1 text-sm text-slate-600">
            Чтобы выкладывать видео, нужно войти.
          </p>
          <div className="mt-4">
            <Link
              href="/signin"
              className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
        <h1 className="text-lg font-semibold tracking-tight">Загрузка видео</h1>
        <p className="mt-1 text-sm text-slate-600">
          Поддерживаются обычные форматы (mp4/webm). Большие файлы могут
          загружаться дольше.
        </p>

        <form
          action="/api/videos"
          method="post"
          encType="multipart/form-data"
          className="mt-4 grid gap-3"
        >
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Заголовок</span>
            <input
              name="title"
              type="text"
              required
              maxLength={80}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Описание (опционально)</span>
            <textarea
              name="description"
              rows={3}
              maxLength={500}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Файл</span>
            <input
              name="file"
              type="file"
              accept="video/*"
              required
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-800 hover:file:bg-slate-200"
            />
            <span className="text-xs text-slate-500">
              Для демо: ограничение 100&nbsp;МБ на файл.
            </span>
          </label>

          <button
            type="submit"
            className="mt-2 h-10 rounded-xl bg-slate-900 text-sm font-medium text-white hover:bg-slate-800"
          >
            Опубликовать
          </button>
        </form>
      </div>
    </div>
  );
}

