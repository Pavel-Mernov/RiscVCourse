# Используем базовый образ для вашего приложения : node
FROM node:18

# Установим рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Установим зависимости
RUN npm install

RUN apt-get update && apt-get install -y openjdk-17-jdk && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Проверим установку
RUN java -version

# Копируем все исходные файлы
COPY . .

COPY rars ./

# Компилируем TypeScript в JavaScript
RUN npm run build

# Запускаем приложение
CMD ["node", "dist/server.js"]  # Запуск скомпилированного JavaScript

EXPOSE 3000