
FROM node:18 as app


WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install
RUN npm run build

CMD ["node", "dist/server.js"]
