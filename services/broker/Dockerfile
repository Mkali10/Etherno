FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy rest of the source code
COPY src ./src

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "src/index.js"]
