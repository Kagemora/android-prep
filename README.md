# Android Prep — личная шпаргалка

Статический сайт, работает без бэкенда. Прогресс ("выучено") хранится
в localStorage браузера — то есть локально, на конкретном устройстве.

## Как запустить локально

Просто открой `index.html` в браузере — двойным кликом или
`open index.html` (Mac) / `start index.html` (Windows).

## Как выложить на GitHub Pages (бесплатно, 5 минут)

1. Создай новый репозиторий на GitHub, например `android-prep`
   (можно приватный — Pages работает и с приватными репо на платных
   планах; на бесплатном GitHub Pages репозиторий должен быть публичным).
2. Залей туда содержимое этой папки:
   ```bash
   cd prep-site
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/Kagemora/android-prep.git
   git push -u origin main
   ```
3. В репозитории: **Settings → Pages → Source** → выбери ветку `main`
   и папку `/ (root)` → Save.
4. Через 1-2 минуты сайт будет доступен по адресу:
   `https://kagemora.github.io/android-prep/`

## Как добавлять новые вопросы

Открой `js/data.js` — там массив `QUESTIONS`. Скопируй любой существующий
объект и заполни свои поля:

```js
{
  id: "k4",              // уникальный id
  cat: "kotlin",         // категория из CATEGORIES (kotlin/coroutines/di/android/arch/testing/algo/lifehacks/resume)
  q: "Текст вопроса",
  what: "Что это (определение)",
  key: "Ключевое отличие / механика",
  example: "Пример или следствие",
  code: `// код-пример, если нужен, иначе null`
}
```

Сайт подхватит новый вопрос автоматически при перезагрузке страницы —
больше ничего трогать не нужно.

## Как добавить новую категорию

В `js/data.js` в массив `CATEGORIES` добавь объект вида
`{ id: "новый_id", label: "Файл.kt", icon: "X" }`, и используй этот `id`
в поле `cat` у новых вопросов.

## Структура файлов

```
index.html       — разметка страницы
css/style.css     — стили (тема IDE)
js/data.js        — весь контент (редактируй здесь)
js/app.js         — логика (поиск, чекбоксы, localStorage) — трогать не обязательно
```
