# Sử dụng môi trường Node.js nhẹ và nhanh nhất
FROM node:20-alpine

# CÀI ĐẶT FFMPEG (Rất quan trọng cho VietnamVoiceAI)
RUN apk update && apk add --no-cache ffmpeg

# Thiết lập thư mục làm việc trong server
WORKDIR /app

# Copy các file cấu hình và cài đặt thư viện
COPY package*.json ./
RUN npm ci

# Copy toàn bộ mã nguồn dự án vào server
COPY . .

# Build dự án Next.js
RUN npm run build

# Mở cổng 3000
EXPOSE 3000

# Lệnh khởi chạy ứng dụng
CMD ["npm", "start"]