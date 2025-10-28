FROM node:24.10.0-alpine

WORKDIR /game

COPY . .

RUN npm install && npm run extract

EXPOSE 3000

CMD ["npm", "start"]
