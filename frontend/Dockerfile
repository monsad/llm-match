FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package.json  ./
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM nginx:alpine

# Copy build files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
