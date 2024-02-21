# Step 1: Build the React application
# Use the official Node.js 16 image as the base image
FROM node:16-alpine as build

# Set the working directory in the container
WORKDIR /app

# Accept REACT_APP_API_URL as a build-time argument
ARG REACT_APP_API_URL

# Set it as a build-time environment variable
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy package.json and package-lock.json (or yarn.lock) files
COPY ./ui/app/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY ./ui/app/ .

# Build the React application
RUN npm run build

# Step 2: Serve the React application using a simple HTTP server
# Use the official Nginx image to serve the built application
FROM nginx:alpine

# Copy the built app from the previous stage to the Nginx server
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY ./config/nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the Docker host, so we can access the app
EXPOSE 80

# Start Nginx and serve the application
CMD ["nginx", "-g", "daemon off;"]

