# ---------- Base ----------
FROM node:20-alpine AS builder

# Required for @parcel/watcher
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /usr/local/app

# Copy the source files
COPY ./ /usr/local/app/

# Install all dependencies, both production and development
RUN npm ci

# Build
RUN npm run build:local

# Remove dev dependencies
RUN npm prune --force --production

# ---------- Release ----------
FROM nginx:1.26.1-alpine-slim

# Copy nginx config file
RUN rm -rf /usr/share/nginx/html/* && rm -rf /etc/nginx/nginx.conf
COPY nginx.conf nginx-no-ssl.conf nginx-ssl.conf /etc/nginx/

# Copy dynamic env setup script
COPY ./docker/setup.sh /setup.sh
RUN chmod +x /setup.sh

# Copy the production dependencies
COPY --from=builder /usr/local/app/dist/switcher-management /usr/share/nginx/html