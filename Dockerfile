# Build stage
FROM node:14.17.0-alpine AS builder
# Set working directory
WORKDIR /app
# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm ci
# Copy source files
COPY . .
# Build the app
RUN npm run build

# Production stage
FROM node:14.17.0-alpine
# Set working directory
WORKDIR /app
# Copy built assets from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/server.js ./server.js
# Install only production dependencies
RUN npm ci --only=production
# Expose the port the app runs on
EXPOSE 3000
# Start the application
CMD ["npm", "start"]