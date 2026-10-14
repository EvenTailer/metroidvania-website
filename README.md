# Cyber-Duck Metroidvania Dev Hub

React + TypeScript + Vite (Feature-Sliced Design).

## Запуск

```bash
npm install
npm run dev
```

В терминале после `npm run dev` смотри строку **Local:** — обычно `http://localhost:5173/`.  
Если порт 5173 занят, Vite поднимет **5174**, **5175** и т.д. — открывай именно тот URL из терминала.  
`ERR_CONNECTION_REFUSED` на 5173 значит, что dev-сервер не запущен или слушает другой порт.

Пароли: `1111` (Илья), `2222` (Художник), `3333` (Геймдизайнер), `2026` (master).

## Деплой на хостинг (PHP)

1. Локально: `npm run build` — соберётся папка `dist/`.
2. Залей **содержимое** `dist/` в корень сайта на хостинге (`public_html`, `www` или подпапка домена).
3. На сервере должен работать **PHP** (для `api/board.php`, `api/gallery.php`, `api/chat.php`, `api/narrative.php`).
4. Скопируй `api/config.example.php` → `api/config.php`, задай свой `upload_token`.
5. Права на запись: `data/` (JSON), `uploads/gallery/` (картинки) — обычно `755` на папки, при ошибках загрузки — `775` по политике хостинга.
6. Открой сайт по домену. Роутинг в приложении без React Router — одна `index.html`, отдельный `.htaccess` для SPA не нужен.

Локально без PHP API галерея/чат могут работать через эмуляцию Vite (`vite.galleryDevApi`); на хостинге — только реальные `public/api/*.php`.

## Скрипты

- `npm run dev` — dev-сервер
- `npm run build` — production build
- `npm run preview` — превью билда

## Агенты

Промпт для будущих ИИ-агентов (Architect / Designer / Critic по CLEAF):

→ [`AGENTS_CLEAF.md`](./AGENTS_CLEAF.md)

Старый HTML-макет сохранён как `mockup.html` / `mockup_standalone.html` — не развивать, только React.
