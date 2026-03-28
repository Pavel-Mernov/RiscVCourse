
FROM node:18 as app

FROM ubuntu:22.04
WORKDIR /app

COPY --from=app /usr/local /usr/local
COPY . .

RUN npm install
RUN npm run build

RUN apt-get update && apt-get install -y docker-cli

CMD ["node", "dist/server.js"]
