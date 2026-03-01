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

# Set them as env vars during build
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GEMINI_MODEL=$VITE_GEMINI_MODEL
ENV VITE_GEMINI_BASE_URL=$VITE_GEMINI_BASE_URL

# Set NODE_ENV to production but we still need dev dependencies for build
ENV NODE_ENV=production

# Copy package files first (for better caching)
COPY package*.json ./

# Install ALL dependencies (including dev dependencies like Vite)
RUN npm ci

# Verify Vite is installed (for debugging - remove in production)
RUN npx vite --version || echo "Vite not found in npx, checking node_modules..."
RUN ls -la node_modules/.bin/ || echo "No .bin directory found"

# Copy source code
COPY . .

# Build the app - using npx to ensure Vite is found
RUN npx vite build || npm run build

# Check build output (for debugging)
RUN ls -la dist/ || echo "Dist folder not created"

# ---------------------------
# 2. Run stage (Nginx serve)
# ---------------------------
FROM nginx:1.25-alpine

# Remove default config
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Create custom nginx config with logging disabled
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Disable access logs completely
    access_log off;
    
    # Only log critical errors
    error_log /dev/stderr crit;

    # Hide nginx version
    server_tokens off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Block access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Create health check file
RUN echo "healthy" > /usr/share/nginx/html/health

EXPOSE 80

# Run nginx in foreground with quiet mode
CMD ["nginx", "-g", "daemon off;", "-q"]