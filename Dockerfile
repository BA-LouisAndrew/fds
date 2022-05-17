FROM node:16-alpine

ENV NODE_ENV=production
ARG REDIS

ENV REDIS=$REDIS

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production
COPY . .

RUN npm run build


CMD [ "node", "./dist/src/main.js" ]