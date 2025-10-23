
# Базовое окружение
FROM node:18

# Каталог приложения
WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем пакеты
RUN npm install --production

# Копируем всё остальное
COPY . .

# Указываем порт микросервиса
EXPOSE 8080

# Команда запуска
CMD ["npm", "start"]
