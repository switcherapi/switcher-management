# ---------- Base ----------
FROM node:24-alpine AS builder

# Required for @parcel/watcher
RUN apk add --update g++ make python3 && rm -rf /var/cache/apk/*

WORKDIR /usr/local/app

# Copy the source files
COPY ./ /usr/local/app/

# Install all dependencies, both production and development, build, and remove dev dependencies
RUN npm ci && \
	npm run build:prod && \
	npm prune --omit=dev

# ---------- Release ----------
FROM nginx:1.29.2-alpine-slim

# Copy nginx config file
RUN rm -rf /usr/share/nginx/html/* && rm -rf /etc/nginx/nginx.conf
COPY nginx.conf nginx-no-ssl.conf nginx-ssl.conf /etc/nginx/

# Copy dynamic env setup script
COPY ./docker/setup.sh /setup.sh
RUN chmod +x /setup.sh

# Copy the production dependencies
COPY --from=builder /usr/local/app/dist/switcher-management/browser /usr/share/nginx/html