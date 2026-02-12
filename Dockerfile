# ---------------------------
# 1. Build stage
# ---------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Add build args for Vite environment variables
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_URL

# Set them as env vars during build (Vite will pick these up)
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

# Optional: Verify args are received (for debugging, remove in production)
RUN echo "Building with VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}" && \
    echo "Project ID: ${VITE_SUPABASE_PROJECT_ID}"

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