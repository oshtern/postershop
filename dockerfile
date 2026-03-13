# Multi-stage build for full-stack app
# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ ./

# Build the application
RUN npm run build

# Stage 2: Build the backend
FROM node:18-alpine AS backend-builder

WORKDIR /backend

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY backend/ ./

# Build the backend
RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy backend build
COPY --from=backend-builder /backend/dist ./dist
COPY --from=backend-builder /backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy frontend build to backend's public directory
COPY --from=frontend-builder /frontend/dist ./dist/public

# Expose port
EXPOSE 4000

# Start the backend
CMD ["npm", "start"]