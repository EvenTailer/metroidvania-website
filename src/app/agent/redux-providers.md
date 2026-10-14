# Провайдеры и Redux Toolkit

Архитектурный провайдер — React-компонент вокруг дерева приложения. Пункт «DeepSeek / Groq / OpenRouter» в ИИ-чате — выбор внешнего API. Это не провайдер.

Как собрано:

- `src/app/store.ts` — `configureStore`, `createHubStore`.
- `src/app/providers/` — корень с `Provider`. `main.tsx` рендерит только его.
- Слайсы: `task`, `note`, `gallery`, `chat`, `narrative`, `roadmap`, `character`, `session`. Запросы к PHP живут в `entities/*/api.ts` и вызываются из `src/app/model`.
- База на сервере. Redux — состояние клиента. Ключи `mv4_*` и `mv_auth_ok` — локальный кэш, не источник правды после ответа сервера.
- Новый экран — страница и адрес `#/имя`. Не добавлять `useState` доски в `src/app/App.tsx`.
