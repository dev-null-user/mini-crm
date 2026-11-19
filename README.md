# Mini-CRM
### Система управлением графиком смен в рамках тестового задания. 

Для чего все таки: моя задача показать свои знания и подход к решении задачи. 

Подробная задача: <link>https://www.figma.com/design/QVdDSEGTL1bWg7UmuPpoPe/%D0%A2%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%BE%D0%B5-%D0%B7%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-%D1%80%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%87%D0%B8%D0%BA?node-id=0-1&p=f&t=XGWEQEFL8LcqZMaI-0</link>


Frontend: TypeScript, React, Tailwimd

Backend: Bun, Hono, Zod, WebSocket, Drizze (ORM & kit)

### Запуск через Docker Compose

Если файла `.env` ещё нет, скопируйте пример и задайте свой пароль PostgreSQL в `POSTGRES_PASSWORD`:

```sh
cp example.env .env
```

Соберите и запустите сервисы:

```sh
docker compose --env-file .env up -d --build
docker compose ps
```

При использовании файла `.env` в корне проекта флаг `--env-file .env` можно опустить. Если он указан, его нужно ставить перед `up`. Веб-приложение доступно по адресу `http://<адрес-сервера>:3000`; внешний порт задаётся переменной `WEB_PORT`. API и Socket.IO доступны через тот же адрес: Nginx перенаправляет пути `/api/` и `/socket.io/` внутрь сети Compose. Значения `NEXT_PUBLIC_API_URL` и `NEXT_PUBLIC_SOCKET_URL` из `.env` используются при локальном запуске без Docker; в Docker-сборке настроен общий адрес сайта.

При запуске Compose дожидается PostgreSQL и применяет миграции до старта API. Демоданные не добавляются автоматически. Чтобы заполнить пустые справочники сотрудниками и шаблонами из `seed.ts`, выполните:

```sh
docker compose --env-file .env run --rm --no-deps migrate bun run db:seed
```

Повторный запуск команды не создаёт дубликаты. Для диагностики используйте `docker compose logs -f migrate api web proxy`. Данные PostgreSQL сохраняются в томе `postgres_data` при обычной остановке контейнеров.

### График смен

Для локального запуска без Docker примените миграции и при необходимости заполните справочники сотрудников и шаблонов:

```sh
bun run --filter @shift/db db:migrate
bun run --filter @shift/db db:seed
```

Смены сохраняются в базе сразу после назначения или удаления. Кнопка «Сохранить» обновляет данные графика с сервера; «Опубликовать» публикует отображаемые даты. Изменение смены возвращает соответствующую дату в черновик.

Обновления между открытыми страницами передаются через Socket.IO: API отправляет событие `schedule:updated` с диапазоном изменённых дат, после чего страницы с пересекающимся периодом перечитывают данные. При восстановлении соединения график обновляется повторно. Адрес сервера задаётся через `NEXT_PUBLIC_SOCKET_URL`, разрешённые источники — через `CORS_ORIGIN`.

Методы API (префикс `/api/v1`):

- `GET /employees/search?fullName=...` — поиск сотрудников; пустое имя возвращает всех.
- `GET /schedules/templates` — активные шаблоны смен.
- `GET /schedules?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` — смены и статус публикации периода.
- `PATCH /schedules/shifts` — атомарное назначение, изменение и удаление смен.
- `POST /schedules/publish` — публикация периода с полями `startDate` и `endDate`.

Пример изменения смен:

```json
{
  "assignments": [
    { "employeeId": "UUID сотрудника", "date": "2026-06-01", "templateId": null, "startTime": "09:00", "endTime": "17:00" }
  ],
  "removals": [
    { "employeeId": "UUID сотрудника", "date": "2026-06-02" }
  ]
}
```

Для смены по шаблону передайте его UUID и время из справочника; для своего времени используйте `templateId: null`.
При переносе смены назначение и удаление передаются одним запросом. Поле `onlyIfEmpty: true` у назначения защищает занятую ячейку, а `expected` с исходными `templateId`, `startTime` и `endTime` у удаления позволяет обнаружить изменение исходной смены.
