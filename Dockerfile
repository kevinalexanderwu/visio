FROM node:22.12.0-alpine3.21 AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

FROM node:22.12.0-alpine3.21 AS backend-dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev

FROM node:22.12.0-alpine3.21 AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=backend-dependencies /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/
COPY backend/src ./backend/src
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY public/assets ./frontend/dist/assets
EXPOSE 3000
CMD ["node", "backend/src/server.js"]
