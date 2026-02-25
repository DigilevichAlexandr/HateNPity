# Cloud environment для HateNPity

Цель: чтобы любой cloud-агент мог сразу работать с `web/` без ручной подготовки.

## Базовые требования к образу

- Node.js **22.x**
- npm **10+**
- Docker CLI + Docker Compose plugin (`docker compose`)

## Кэш npm

В проекте задано:

- `web/.npmrc`:
  - `cache=${HOME}/.npm`
  - `prefer-offline=true`
  - `engine-strict=true`

Рекомендуемый persist cache path: `~/.npm`.

## Preinstall для cloud-агентов

Добавлен скрипт:

- `scripts/cloud-agent-bootstrap.sh`

Что делает:

1. Проверяет Node 22+.
2. Проверяет наличие Docker и `docker compose`.
3. Настраивает npm cache (`~/.npm`).
4. Выполняет `npm ci` в `web/`.
5. Выполняет `npm run prisma:generate` в `web/`.

## Как использовать в env setup agent

В startup script cloud-окружения укажи:

```bash
bash /workspace/scripts/cloud-agent-bootstrap.sh
```

Если рабочая директория агента отличается, сначала перейди в корень репозитория.

