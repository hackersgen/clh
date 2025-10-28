FROM node:24.10.0-alpine

WORKDIR /app

COPY package.json ./

RUN mkdir /app/leaderboard

RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "start"]