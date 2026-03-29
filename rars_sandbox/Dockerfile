# stage 1 — build (node)
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# stage 2 — runtime (java + node вручную)
FROM eclipse-temurin:17-jdk

# ставим node вручную (без apt)
COPY --from=builder /usr/local /usr/local

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3006

CMD ["node", "dist/src/server.js"]