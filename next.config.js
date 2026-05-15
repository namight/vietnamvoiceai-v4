/** @type {import('next').Config} */
const nextConfig = {
  // Thêm dòng này để xuất ra file nhẹ gọn
  output: 'standalone',

  transpilePackages: ['edge-tts'],
  serverExternalPackages: ['pdf-parse', 'fluent-ffmpeg', 'mammoth'],
};

module.exports = nextConfig;