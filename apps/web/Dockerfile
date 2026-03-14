FROM node:22-alpine AS base
WORKDIR /repo
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --no-frozen-lockfile

FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter @newguildplus/web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /repo/apps/web/.output ./.output
USER app
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
