FROM node:20-alpine

WORKDIR /app

COPY . .

WORKDIR /app/services/grpc-service

RUN npm install --omit=dev

EXPOSE 4002

CMD ["node", "src/server.js"]