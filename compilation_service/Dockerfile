
FROM node:18 as app

FROM eclipse-temurin:17-jdk
WORKDIR /app

COPY --from=app /usr/local /usr/local
COPY . .

RUN npm install
RUN npm run build

CMD ["node", "dist/server.js"]
