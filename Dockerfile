FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production

COPY . .
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
RUN bun generate
RUN bun run build

ENV PORT=5000
EXPOSE 5000

CMD ["bun", "run", "start"]
