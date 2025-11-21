# Event Registration Service

Веб-сервис для регистрации на мероприятия с авторизацией через Telegram.

## Технический стек

- **Frontend + Backend**: Next.js 14 (App Router) + TypeScript
- **Стили**: Tailwind CSS
- **БД**: PostgreSQL + Prisma ORM
- **Аутентификация**: Telegram Login Widget + JWT (HttpOnly cookie)
- **Файлы**: Локальное хранение в `/public/uploads` (MVP)

## Установка и запуск

### 1. Установка зависимостей

```bash
pnpm install
# или
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта на основе `.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/event_registration?schema=public"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
JWT_SECRET="your_jwt_secret_here_change_in_production"
EVENT_ORGANIZER_TELEGRAM="https://t.me/your_username"
NEXT_PUBLIC_TELEGRAM_BOT_NAME="your_bot_name"
NEXT_PUBLIC_EVENT_ORGANIZER_TELEGRAM="https://t.me/your_username"
ADMIN_INVITE_CODE="your_admin_invite_code_here"
```

### 3. Настройка базы данных

```bash
# Генерация Prisma Client
pnpm db:generate

# Применение миграций
pnpm db:migrate

# Или для разработки (без миграций)
pnpm db:push
```

### 4. Запуск сервера разработки

```bash
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Аутентификация
│   │   ├── events/        # Мероприятия
│   │   ├── registrations/ # Регистрации
│   │   └── users/         # Пользователи
│   ├── events/            # Страницы мероприятий
│   ├── profile/           # Профиль пользователя
│   └── admin/             # Админ-панель
├── components/            # React компоненты
├── lib/                   # Утилиты и библиотеки
│   ├── auth.ts           # JWT аутентификация
│   ├── prisma.ts         # Prisma Client
│   └── telegram.ts       # Валидация Telegram
├── prisma/               # Prisma схема и миграции
└── scripts/              # Утилиты (экспорт данных)
```

## Основные API endpoints

### Аутентификация

- `POST /api/auth/telegram` - Авторизация через Telegram
- `POST /api/auth/logout` - Выход из системы

### Пользователи

- `GET /api/users/me` - Получить текущего пользователя
- `PUT /api/users/me` - Обновить профиль пользователя

### Мероприятия

- `GET /api/events` - Список мероприятий
- `GET /api/events/[slug]` - Получить мероприятие по slug
- `POST /api/events` - Создать мероприятие (только для админов)

### Регистрации

- `POST /api/registrations/register` - Зарегистрироваться на мероприятие
- `POST /api/registrations/[registrationId]/upload-receipt` - Загрузить чек об оплате

## Основные страницы

- `/` - Главная страница со списком мероприятий
- `/events/[slug]` - Страница мероприятия
- `/events/[slug]/participants` - Список участников мероприятия
- `/profile` - Профиль пользователя
- `/profile/setup` - Настройка профиля (для новых пользователей)
- `/admin/events` - Список мероприятий (админка)
- `/admin/events/new` - Создание мероприятия (админка)

## Workflow

1. **Авторизация**: Пользователь входит через Telegram Login Widget
2. **Настройка профиля**: Новый пользователь заполняет анкету
3. **Регистрация на мероприятие**: Пользователь записывается на мероприятие, указывая ожидания
4. **Оплата**: Пользователь загружает чек об оплате
5. **Просмотр участников**: Все могут видеть список участников и их интро

## Миграция данных

Для экспорта данных используйте скрипт:

```bash
npx tsx scripts/exportUsers.ts
```

Данные будут экспортированы в `exports/users-[timestamp].json`.

## Разработка

### Генерация Prisma Client

```bash
pnpm db:generate
```

### Создание миграции

```bash
pnpm db:migrate
```

### Prisma Studio (GUI для БД)

```bash
pnpm db:studio
```

## Заметки

- В MVP файлы (чеки) хранятся локально в `/public/uploads`
- Для продакшена рекомендуется использовать S3 или другой cloud storage
- JWT токены хранятся в HttpOnly cookies для безопасности
- Админ-доступ определяется флагом `isAdmin` в таблице User

