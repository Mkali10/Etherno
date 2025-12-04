FROM node:18-alpine

RUN apk add --no-cache xvfb fluxbox x11vnc

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 5900
CMD ["node", "src/index.js"]
