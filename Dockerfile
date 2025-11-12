# Multi-stage Dockerfile for building the Vite Vue app and serving it with nginx
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies (both prod and dev needed for the Vite build)
COPY package*.json ./
RUN npm install --no-audit --no-fund --silent

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production

# Copy built static files from build stage into nginx www folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx config (includes SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
