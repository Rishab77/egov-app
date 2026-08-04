FROM node:20-alpine

WORKDIR /app

COPY . .

WORKDIR /app/services/rest-service

RUN npm install --omit=dev

EXPOSE 4001

CMD ["node", "src/server.js"]