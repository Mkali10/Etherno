# Use Node 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy source code
COPY src/ ./src/

# Expose port 8080
EXPOSE 8080

# Command to run the app
CMD ["npm", "start"]
