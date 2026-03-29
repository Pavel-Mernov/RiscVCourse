FROM node:18

RUN apt-get update && apt-get install -y openjdk-17-jdk

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3006

CMD ["node", "dist/src/server.js"]