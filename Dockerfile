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

FROM nginx:1.22.1-alpine as runner
WORKDIR /usr/share/nginx/html
# Remove nginx default files
RUN rm -rf ./*
COPY --from=builder /app/dist .
ENTRYPOINT ["nginx", "-g", "daemon off;"]