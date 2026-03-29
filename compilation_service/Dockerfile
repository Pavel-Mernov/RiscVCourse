
FROM node:18 as app


WORKDIR /app

RUN apt-get update

COPY . .

RUN npm install
RUN npm run build

CMD ["node", "dist/server.js"]
