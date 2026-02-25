# HateNPity (web)

Минимальная соцсеть в стиле TikTok:

- авторизация (email + пароль)
- загрузка видео
- лента вертикальных видео
- страница видео + комментарии
- светлый спокойный дизайн

## Текущий стек

- Next.js (App Router)
- NextAuth (Credentials)
- Prisma + PostgreSQL
- Хранение видео:
  - `STORAGE_DRIVER=local` для локальной разработки
  - `STORAGE_DRIVER=s3` для production (S3/R2/MinIO и т.п.)

## Локальный запуск

1) Подготовьте env:

```bash
cp .env.example .env
```

2) Поднимите PostgreSQL через Docker:

```bash
docker compose up -d postgres
```

3) Установите зависимости и примените миграции:

```bash
npm install
npm run db:migrate
```

4) Запустите приложение:

```bash
npm run dev
```

По умолчанию локально используется `STORAGE_DRIVER=local`, файлы видео пишутся в `web/var/uploads/videos/`.

## Cloud-агенты

Для ускорения подготовки окружения:

```bash
npm run setup:cloud
```

Скрипт проверит Node 22+, Docker/Compose, настроит npm cache и выполнит `npm ci` + `prisma generate`.

## Локальный S3 (опционально)

В `docker-compose.yml` добавлены MinIO и инициализация бакета.

```bash
docker compose up -d minio minio-init
```

Пример env для локального S3:

```env
STORAGE_DRIVER="s3"
S3_REGION="us-east-1"
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="hatenpity-videos"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_FORCE_PATH_STYLE="true"
S3_KEY_PREFIX="videos"
```

## Production env (минимум)

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="случайная_строка_минимум_32_байта"

STORAGE_DRIVER="s3"
S3_REGION="auto"
S3_ENDPOINT="https://<your-s3-endpoint>"
S3_BUCKET="<bucket>"
S3_ACCESS_KEY_ID="<key>"
S3_SECRET_ACCESS_KEY="<secret>"
S3_KEY_PREFIX="videos"
S3_FORCE_PATH_STYLE="false"
```

Дополнительно:

- `MAX_VIDEO_BYTES` — лимит размера видео (в байтах), по умолчанию 100MB.
- `S3_SIGNED_URL_TTL_SECONDS` — время жизни signed URL (60..3600 сек).

## Деплой

### Вариант 1: Vercel + managed Postgres + S3

1. Создайте managed PostgreSQL (Neon/Supabase/Render/Railway) и бакет S3/R2.
2. Добавьте env-переменные из примера выше в проект Vercel.
3. На этапе деплоя примените миграции:
   - `npm run db:migrate:deploy`
4. Запустите production deploy:

```bash
npx vercel --prod
```

### Вариант 2: Docker (любой VPS/Cloud Run/Render)

Собрать и запустить контейнер:

```bash
docker build -t hatenpity-web .
docker run --rm -p 3000:3000 --env-file .env hatenpity-web
```

