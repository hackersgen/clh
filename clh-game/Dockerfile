FROM docker.io/library/node:16.5.0-slim

WORKDIR /game

COPY . .

RUN npm install && npm run extract

EXPOSE 3000 3001

ENTRYPOINT ["npm", "start"]