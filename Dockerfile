# ---------------------------
# 1. Build stage
# ---------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------------------------
# 2. Run stage (Nginx serve)
# ---------------------------
FROM nginx:1.25-alpine

# Remove default config
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
