# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY relay/package.json ./relay/
COPY app/package.json ./app/

# Install dependencies across monorepo
RUN npm ci

# Copy sources
COPY shared ./shared
COPY relay ./relay
COPY scripts ./scripts

# Build shared and relay packages
RUN npm run governance:check
RUN npm --workspace=shared run build
RUN npm --workspace=relay run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY relay/package.json ./relay/

RUN npm ci --omit=dev

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/relay/dist ./relay/dist

EXPOSE 8080

CMD ["node", "relay/dist/index.js"]
