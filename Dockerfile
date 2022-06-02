FROM node:16-alpine

ARG REDIS
ARG DATABASE_URL
ARG RABBITMQ_URL

ENV REDIS=$REDIS
ENV DATABASE_URL=$DATABASE_URL
ENV RABBITMQ_URL=$RABBITMQ_URL

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci 
COPY . .
run npm run prisma:generate

RUN npm run build
ENV NODE_ENV=production


CMD [ "node", "./dist/src/main.js" ]