# Проектная работа: Mesto (интерактивная страница с API)

Интерактивная страница для обмена фотографиями мест. Данные пользователя и карточек загружаются с сервера Яндекс.Практикума.

## Ссылка на опубликованный проект

После настройки GitHub Pages укажите здесь актуальный адрес, например:

`https://<ваш-логин>.github.io/<имя-репозитория>/`

Текущий репозиторий: [mesto-ad](https://github.com/nachynondar/mesto-ad).

## Локальный запуск и сборка

Требуется [Node.js](https://nodejs.org/) (рекомендуется LTS).

```bash
npm install
```

Запуск dev-сервера (страница откроется в браузере автоматически):

```bash
npm run dev
```

Сборка в папку `dist`:

```bash
npm run build
```

Публикация собранного проекта на GitHub Pages (ветка `gh-pages`):

```bash
npm run deploy
```

Перед первым `npm run deploy` в репозитории на GitHub включите **Settings → Pages → Source: Deploy from a branch** и выберите ветку `gh-pages` (она создаётся после первого деплоя).

## Структура скриптов

- `src/scripts/index.js` — точка входа
- `src/scripts/components/api.js` — запросы к API
- `src/scripts/components/card.js` — разметка карточки
- `src/scripts/components/modal.js` — открытие/закрытие попапов
- `src/scripts/components/validation.js` — валидация форм
