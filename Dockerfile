FROM node:16-alpine

ARG REDIS
ARG DATABASE_URL

ENV REDIS=$REDIS
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci 
COPY . .
run npm run prisma:generate

RUN npm run build
ENV NODE_ENV=production


CMD [ "node", "./dist/src/main.js" ]