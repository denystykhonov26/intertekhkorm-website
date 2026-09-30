# Сайт ТОВ «Інтертехкорм»

Статичний двомовний сайт компанії «Інтертехкорм» для GitHub Pages. Проєкт працює без збірки, фреймворків і серверного коду.

## Структура

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── sections/
│   ├── img/
│   └── js/
│       ├── main.js
│       ├── i18n.js
│       ├── modal.js
│       ├── form.js
│       └── nav.js
├── config/site.config.js
├── data/
│   ├── i18n/uk.json
│   ├── i18n/en.json
│   └── products.json
├── robots.txt
└── sitemap.xml
```

## Локальний запуск

ES-модулі та JSON-файли треба відкривати через локальний HTTP-сервер, а не подвійним кліком по `index.html`.

```bash
python3 -m http.server 8000
```

Після запуску відкрийте [http://localhost:8000](http://localhost:8000).

## Як редагувати сайт

### Тексти та переклади

- українські тексти: `data/i18n/uk.json`;
- англійські тексти: `data/i18n/en.json`;
- ключі в обох файлах мають залишатися однаковими;
- технічні показники продукції: `data/products.json`.

Після зміни JSON перевірте, що файл залишається валідним і сторінка без помилок відкривається обома мовами.

### Контакти

Телефон, email, месенджери, адреса, реквізити та адреса сайту зберігаються в одному файлі:

`config/site.config.js`

Не дублюйте ці дані в HTML або JavaScript-модулях.

### Форма запиту

У `config/site.config.js` заповніть `formEndpoint` адресою Formspree або Web3Forms. Для Web3Forms також заповніть `web3FormsAccessKey`.

Поки endpoint порожній, форма перевіряє поля та відкриває поштову програму через `mailto:`. Кожен запит отримує ідентифікатор формату `A-YYYYMMDD-XXXX` і поле `source=website`.

### Зображення

- зберігайте файли в `assets/img/`;
- використовуйте назви в `kebab-case`;
- для фотографій бажано мати AVIF, WebP і JPG;
- після заміни зображення не забудьте перевірити `width`, `height` та alt-тексти.

## Публікація через GitHub Pages

1. Завантажте гілку `main` у GitHub-репозиторій.
2. Відкрийте **Settings → Pages**.
3. У **Build and deployment** виберіть **Deploy from a branch**.
4. Виберіть гілку `main` і папку `/ (root)`.
5. Збережіть налаштування та дочекайтеся публікації.

Перед публікацією під іншою адресою оновіть:

- `siteUrl` у `config/site.config.js`;
- canonical, Open Graph, Twitter і hreflang URL в `index.html`;
- адресу sitemap у `robots.txt`;
- URL у `sitemap.xml`.

## Перевірка перед публікацією

- перемикання UA/EN та правильний логотип;
- відкриття й закриття обох модальних вікон клавіатурою;
- кнопки товарів і попередній вибір продукту у формі;
- телефон, email, Telegram, Viber, WhatsApp і Google Maps;
- форма у двох мовах;
- адаптивність на 375, 768, 1024 і 1440 px;
- відсутність помилок у консолі браузера.

