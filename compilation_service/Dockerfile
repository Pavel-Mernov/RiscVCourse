
FROM node:18 as app

FROM ubuntu:22.04

WORKDIR /app

# ставим базовые сертификаты и ключи
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# обновляем списки пакетов заново
RUN apt-get update

# устанавливаем docker cli
RUN apt-get install -y docker.io

COPY --from=app /usr/local /usr/local
COPY . .

RUN npm install
RUN npm run build

CMD ["node", "dist/server.js"]
