# Stage 1: Build the React Vite app (Updated to Node 22!)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY . .


# Build the app (Vite outputs to the 'dist' folder)
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the built files from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure Nginx to listen on port 8080 and handle React routing
RUN echo 'server { \
    listen 8080; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose the port Cloud Run expects
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]