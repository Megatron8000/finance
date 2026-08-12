# Требования к хостингу и инструкция по деплою

---

## 1. Требования к серверу

### Минимальные

| Параметр       | Значение                           |
|----------------|------------------------------------|
| CPU            | 2 vCPU                             |
| RAM            | 2 ГБ                               |
| Диск           | 20 ГБ SSD                          |
| ОС             | Ubuntu 22.04 / Debian 12           |
| Сеть           | Публичный IP, порты 80 и 443       |
| Docker         | Docker Engine 24+ + Docker Compose v2 |

### Рекомендованные

| Параметр       | Значение                           |
|----------------|------------------------------------|
| CPU            | 4 vCPU                             |
| RAM            | 4 ГБ                               |
| Диск           | 40 ГБ SSD                          |
| Бэкапы         | Автобэкапы БД каждый день          |
| SSL            | Let's Encrypt (бесплатный)         |

---

## 2. Что нужно подготовить перед деплоем

### 2.1. Репозиторий на GitHub

Все файлы проекта должны быть в Git-репозитории. Убедись, что в `.gitignore` нет лишнего и что `docker-compose.yml` работает локально.

### 2.2. Безопасные секреты

Перед деплоем **обязательно** замени в `docker-compose.yml`:

```
POSTGRES_PASSWORD: finance_password   → на сложный пароль (32+ символов)
DB_PASSWORD: finance_password         → на тот же пароль
JWT_SECRET: CHANGE_ME_TO_32+_CHARS_... → на случайную строку (64+ символов)
```

Генератор секрета:
```bash
openssl rand -base64 48
```

### 2.3. Домен (опционально)

Если нужен красивый URL (например `finance.example.com`):
1. Купи домен у любого регистратора (REG.RU, Namecheap, Cloudflare и т.д.)
2. В DNS-настройках домена добавь A-запись, указывающую на IP твоего сервера

---

## 3. Пошаговая инструкция деплоя

### Шаг 1 — Подключение к серверу

```bash
ssh root@<IP_СЕРВЕРА>
```

### Шаг 2 — Установка Docker

```bash
# Обновляем пакеты
apt update && apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Устанавливаем Docker Compose v2
apt install -y docker-compose-plugin

# Проверяем
docker --version
docker compose version
```

### Шаг 3 — Клонирование проекта

```bash
cd /opt
git clone https://github.com/<ТВОЙ_USER>/financeApp.git
cd financeApp
```

### Шаг 4 — Настройка секретов

Создай файл `.env` в корне проекта (так секреты не попадут в Git):

```bash
cat > .env << 'EOF'
POSTGRES_DB=finance_db
POSTGRES_USER=finance_user
POSTGRES_PASSWORD=СЮДА_СЛОЖНЫЙ_ПАРОЛЬ_БД
DB_USERNAME=finance_user
DB_PASSWORD=СЮДА_СЛОЖНЫЙ_ПАРОЛЬ_БД
JWT_SECRET=СЮДА_СЛУЧАЙНАЯ_СТРОКА_64_СИМВОЛА
SERVER_PORT=8081
EOF
```

Затем обнови `docker-compose.yml` — замени все захардкоженные секреты на переменные:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: finance-db
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    # убираем ports, БД не нужна снаружи
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: finance-backend
    environment:
      SERVER_PORT: ${SERVER_PORT}
      DB_URL: jdbc:postgresql://db:5432/${POSTGRES_DB}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    # убираем ports, бэкенд доступен через nginx
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: /api
    container_name: finance-frontend
    depends_on:
      - backend

  nginx:
    image: nginx:1.27-alpine
    container_name: finance-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-production.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend

volumes:
  pgdata:
```

### Шаг 5 — Nginx конфиг для прода

Создай файл `nginx-production.conf`:

```nginx
server {
    listen 80;
    server_name _;

    # For certbot ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Frontend — отдаёт статику React
    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API — проксирует на Spring Boot
    location /api/ {
        proxy_pass http://backend:8081/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Swagger (опционально)
    location /v3/api-docs {
        proxy_pass http://backend:8081/v3/api-docs;
    }

    location /swagger-ui {
        proxy_pass http://backend:8081/swagger-ui;
    }
}
```

### Шаг 6 — Сборка и запуск

```bash
cd /opt/financeApp

# Собрать образы и запустить
docker compose up -d --build

# Проверить что все контейнеры работают
docker compose ps

# Посмотреть логи
docker compose logs -f
```

### Шаг 7 — Открытие портов (если используется UFW)

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

### Шаг 8 — Проверка

Открой в браузере `http://<IP_СЕРВЕРА>` — должна открыться страница входа.

---

## 4. Настройка HTTPS (Let's Encrypt)

### Шаг 9 — Установка Certbot

```bash
apt install -y certbot
```

### Шаг 10 — Получение сертификата

```bash
# Останавливаем nginx-контейнер на время получения сертификата
docker compose stop nginx

# Получаем сертификат (замените домен и email)
certbot certonly --standalone \
    -d finance.example.com \
    --email admin@example.com \
    --agree-tos \
    --no-eff-email

# Копируем сертификаты в проект
mkdir -p ./certbot/conf
cp -r /etc/letsencrypt/* ./certbot/conf/
```

### Шаг 11 — Обновление Nginx конфига для HTTPS

Замени `nginx-production.conf`:

```nginx
# HTTP → HTTPS редирект
server {
    listen 80;
    server_name finance.example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl;
    server_name finance.example.com;

    ssl_certificate /etc/letsencrypt/live/finance.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/finance.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://backend:8081/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    location /v3/api-docs {
        proxy_pass http://backend:8081/v3/api-docs;
    }

    location /swagger-ui {
        proxy_pass http://backend:8081/swagger-ui;
    }
}
```

### Шаг 12 — Перезапуск с HTTPS

```bash
docker compose up -d --build
```

### Шаг 13 — Автопродление сертификата

Certbot ставится с таймером systemd, но для Docker нужен renewal через webhook:

```bash
# Создай скрипт обновления
cat > /opt/financeApp/renew-certs.sh << 'SCRIPT'
#!/bin/bash
cd /opt/financeApp
certbot renew --quiet
cp -r /etc/letsencrypt/* ./certbot/conf/
docker compose exec -T nginx nginx -s reload
SCRIPT
chmod +x /opt/financeApp/renew-certs.sh

# Добавь в crontab (раз в неделю)
(crontab -l 2>/dev/null; echo "0 3 * * 1 /opt/financeApp/renew-certs.sh >> /var/log/certbot-renew.log 2>&1") | crontab -
```

---

## 5. Бэкапы

### Бэкап PostgreSQL

```bash
# Ручной бэкап
docker compose exec db pg_dump -U finance_user finance_db > backup_$(date +%Y%m%d).sql

# Автобэкап каждый день в 2:00
cat > /opt/financeApp/backup.sh << 'SCRIPT'
#!/bin/bash
BACKUP_DIR="/opt/financeApp/backups"
mkdir -p "$BACKUP_DIR"
docker compose -f /opt/financeApp/docker-compose.yml exec -T db \
    pg_dump -U finance_user finance_db | gzip > "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz"
# Удаляем бэкапы старше 30 дней
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
SCRIPT
chmod +x /opt/financeApp/backup.sh

(crontab -l 2>/dev/null; echo "0 2 * * * /opt/financeApp/backup.sh") | crontab -
```

### Восстановление

```bash
gunzip < backups/backup_20260715_020000.sql.gz | docker compose exec -T db psql -U finance_user finance_db
```

---

## 6. Мониторинг

### Проверка статуса

```bash
# Статус контейнеров
docker compose ps

# Логи последних ошибок
docker compose logs --tail=50 --since=1h

# Использование ресурсов
docker stats --no-stream
```

### Healthcheck (опционально)

Бэкенд уже имеет Spring Boot Actuator — можно добавить healthcheck в docker-compose:

```yaml
  backend:
    ...
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 7. Популярные хостинги

| Хостинг          | Минимальный тариф     | Цена/мес | Примечание                        |
|------------------|-----------------------|----------|-----------------------------------|
| Timeweb Cloud    | Cloud S (2 vCPU/2 ГБ) | ~350 ₽   | Удобный консоль, Docker из коробки |
| Selectel         | SSD-2 (2 vCPU/2 ГБ)  | ~400 ₽   | Российский, хорошая сеть          |
| Hetzner (DE/FI)  | CX22 (2 vCPU/4 ГБ)   | ~4.5 €   | Дёшево, быстрые серверы           |
| DigitalOcean     | Basic 2GB             | $12      | Простой интерфейс                 |
| AWS Lightsail    | 2 GB                  | $10      | Минимальный AWS                   |
| Yandex Cloud     | standard-v1 (2 vCPU)  | ~400 ₽   | Интеграция с Яндекс.Облаком       |

---

## 8. Чеклист перед запуском

- [ ] Секреты заменены (не захардкожены)
- [ ] `.env` файл добавлен в `.gitignore`
- [ ] Docker Compose работает локально
- [ ] Порты 80 и 443 открыты на сервере
- [ ] DNS A-запись указывает на IP сервера
- [ ] SSL-сертификат получен и работает
- [ ] Автопродление сертификата настроено
- [ ] Бэкапы настроены и тестово восстановлены
- [ ] Приложение открывается по HTTPS и авторизация работает
