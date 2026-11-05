# Stage 1: Build
FROM node:22.20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Stage 2: Runtime
FROM node:22.20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist ./dist
EXPOSE 3003
ENV PORT=3003
CMD ["node", "dist/main.js"]
