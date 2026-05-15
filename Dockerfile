# Sử dụng môi trường Node.js nhẹ
FROM node:20-alpine

# CÀI ĐẶT FFMPEG
RUN apk update && apk add --no-cache ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# MẸO ÉP RAM: Giới hạn Node.js chỉ dùng tối đa 300MB RAM khi build
ENV NODE_OPTIONS="--max_old_space_size=300"

# Build dự án (Tắt kiểm tra ESLint/Type tạm thời để nhẹ máy)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]