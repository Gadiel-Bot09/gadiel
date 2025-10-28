FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.cjs postcss.config.cjs ./
COPY index.html ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
RUN npm install --omit=dev
RUN npm install -g serve
ENV NODE_ENV=production
EXPOSE 4173
CMD ["npx", "serve", "-s", "dist", "-l", "4173"]
