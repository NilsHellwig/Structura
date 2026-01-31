# Stage 1: Build the React application
FROM node:20-slim AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
# We'll expect VITE_API_URL to be passed during build if needed, 
# or we can use a relative path if Nginx proxies /api
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build output to Nginx HTML directory
COPY --from:build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
# We'll create a custom nginx.conf to handle routing and proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
