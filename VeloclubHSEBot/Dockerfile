FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY bot.ts ./
COPY quiz ./quiz
COPY images ./images

RUN npm run build

CMD ["npm", "start"]