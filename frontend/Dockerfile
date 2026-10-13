# Stage 1: build the React app
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY . .

# Baked in at build time (CRA inlines REACT_APP_* vars). Real env vars override .env files.
ARG REACT_APP_MEDIA_URL
ENV REACT_APP_MEDIA_URL=$REACT_APP_MEDIA_URL \
    REACT_APP_BACKEND_URL="" \
    GENERATE_SOURCEMAP=false \
    INLINE_RUNTIME_CHUNK=false \
    CI=false
RUN yarn build

# Stage 2: Caddy serves the build and proxies /api to the backend
FROM caddy:2.10-alpine
COPY --from=build /app/build /srv
COPY Caddyfile /etc/caddy/Caddyfile
