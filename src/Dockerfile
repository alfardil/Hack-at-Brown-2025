# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /src

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 5173

# Start the application
CMD ["npm", "run", "start"]