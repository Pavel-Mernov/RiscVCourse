FROM node:18

WORKDIR /app


COPY package*.json ./


RUN npm install




COPY . .


RUN npm run build


CMD ["node", "dist/index.js"]  # Запуск скомпилированного JavaScript

EXPOSE 3004