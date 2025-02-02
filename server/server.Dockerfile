# Use the official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /server

# Copy package.json and package-lock.json first (to leverage Docker caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "dev"]