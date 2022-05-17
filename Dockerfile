FROM node:16-alpine

ARG REDIS

ENV REDIS=$REDIS

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci 
COPY . .

RUN npm run build
ENV NODE_ENV=production


CMD [ "node", "./dist/src/main.js" ]