FROM node:18

FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3006

CMD ["node", "dist/src/server.js"]