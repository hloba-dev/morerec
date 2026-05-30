# Генератор реквизитов (React + MongoDB)

Одностраничное приложение на Next.js: формирует платёжные реквизиты (4 платежа,
карта / телефон / СБП, выбор банка, RU/EN) и сохраняет скопированные реквизиты в
MongoDB. Заточено под iPhone Safari. Удаление — через модальное окно.

## Локальный запуск

```bash
npm install
cp .env.example .env.local   # вписать свой MONGODB_URI
npm run dev
```

Открыть http://localhost:3000

## Переменные окружения

| Переменная     | Обязательна | Описание                                   |
| -------------- | ----------- | ------------------------------------------ |
| `MONGODB_URI`  | да          | строка подключения к MongoDB (напр. Atlas) |
| `MONGODB_DB`   | нет         | имя базы (по умолчанию `morerec`)          |

## Деплой на Vercel

1. Залить репозиторий на GitHub.
2. На vercel.com → **Add New → Project** → импортировать репозиторий.
3. В **Settings → Environment Variables** добавить `MONGODB_URI`
   (и при необходимости `MONGODB_DB`).
4. Deploy. Vercel сам определит Next.js — без доп. настроек.

> Для MongoDB Atlas в **Network Access** добавьте `0.0.0.0/0` (или диапазоны
> Vercel), иначе serverless-функции не достучатся до базы.

## Что и где

- `app/page.tsx` — страница, рендерит форму.
- `components/PaymentForm.tsx` — вся логика формы (порт из PHP-плагина).
- `lib/generate.ts` — генерация текста реквизитов (формат 1:1 с оригиналом).
- `lib/i18n.ts`, `lib/banks.ts` — локализация и банки.
- `app/api/records/*` — REST для сохранения/чтения/удаления (MongoDB).
- `lib/mongodb.ts` — кэшированное подключение к Mongo для serverless.
