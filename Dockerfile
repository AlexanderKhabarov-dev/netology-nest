FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn global add @nestjs/cli
RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["yarn", "run", "start:prod"]