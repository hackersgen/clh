FROM node:16.5.0-slim

WORKDIR /game

COPY . .

RUN npm install && npm run extract

EXPOSE 3000

CMD ["npm", "start"]
