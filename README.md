# HateNPity

Социальная сеть (MVP) в стиле «TikTok»: авторизация, загрузка видео и комментарии.

Сайт находится в папке **`web/`**.

## Быстрый старт

```bash
cd web
cp .env.example .env
docker compose up -d postgres
npm install
npm run db:migrate
# npm run dev
```

Подробности — в `web/README.md`.

## Cloud environment (для агентов)

- Node.js 22 (`.nvmrc`)
- npm cache: `~/.npm` (`web/.npmrc`)
- bootstrap script: `scripts/cloud-agent-bootstrap.sh`
- docs: `docs/cloud-environment.md`

