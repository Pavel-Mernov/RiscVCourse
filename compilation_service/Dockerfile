# Используйте базовый образ для вашего приложения
FROM node:18

# Установите рабочую директорию
WORKDIR /app

# Копируйте package.json и package-lock.json
COPY package*.json ./

# Установите зависимости
RUN npm install

RUN apt-get update && apt-get install -y openjdk-17-jdk && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Проверим установку
RUN java -version

# Копируйте все исходные файлы
COPY . .

# Скомпилируйте TypeScript в JavaScript
RUN npm run build

# Запустите приложение
CMD ["node", "dist/main.js"]  # Запуск скомпилированного JavaScript

EXPOSE 3000