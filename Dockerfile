FROM node:19-slim as deps
WORKDIR /app
COPY package.json ./
RUN yarn install

FROM node:18-slim AS builder
RUN apt-get update
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:19-slim as runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist .
COPY --from=builder /app/package.json .
EXPOSE 5000
CMD ["yarn", "prod"]