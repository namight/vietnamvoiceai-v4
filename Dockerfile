# Giai đoạn 1: Cài đặt và Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Ép RAM gắt hơn nữa ở bước này
ENV NODE_OPTIONS="--max_old_space_size=256"
RUN npm run build

# Giai đoạn 2: Máy chủ thực thi (Cực kỳ nhẹ)
FROM node:20-alpine AS runner
WORKDIR /app

# Cài đặt FFmpeg (Bắt buộc phải có ở máy chủ chạy)
RUN apk update && apk add --no-cache ffmpeg

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Chỉ copy những file thiết yếu đã được build từ Giai đoạn 1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]