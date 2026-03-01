# ---------------------------
# 1. Build stage
# ---------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Add build args for Vite environment variables
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_URL
ARG VITE_SITE_URL
ARG VITE_GEMINI_API_KEY
ARG VITE_GEMINI_MODEL
ARG VITE_GEMINI_BASE_URL

# Set them as env vars during build (Vite will pick these up)
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GEMINI_MODEL=$VITE_GEMINI_MODEL
ENV VITE_GEMINI_BASE_URL=$VITE_GEMINI_BASE_URL

# Set NODE_ENV to production but we still need dev dependencies for build
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies) for build
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# ---------------------------
# 2. Run stage (Nginx serve)
# ---------------------------
FROM nginx:1.25-alpine

# Remove default config
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a simple health check file
RUN echo "healthy" > /usr/share/nginx/html/health

EXPOSE 80

# Run nginx in foreground with quiet mode
CMD ["nginx", "-g", "daemon off;", "-q"]