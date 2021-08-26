# ---------- Base ----------
FROM node:12-alpine as builder

WORKDIR /usr/local/app

# Copy the source files
COPY ./ /usr/local/app/

# Install all dependencies, both production and development
RUN npm install

# Build
RUN npm run build:local

# Remove dev dependencies
RUN npm prune --production

# ---------- Release ----------
FROM nginx:1.21.1-alpine

# Copy nginx config file
RUN rm -rf /usr/share/nginx/html/* && rm -rf /etc/nginx/nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copy dynamic env setup script
COPY ./docker/setup.sh /setup.sh
RUN chmod +x /setup.sh
ENTRYPOINT "/setup.sh"

# Copy the production dependencies
COPY --from=builder /usr/local/app/dist/switcher-management /usr/share/nginx/html