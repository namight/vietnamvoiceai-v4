// next.config.js
/** @type {import('next').Config} */
const nextConfig = {
  // 1. Ép Next.js biên dịch file TypeScript thô của thư viện này
  transpilePackages: ['edge-tts'],
  
  // 2. Giữ nguyên các thư viện Node.js nặng ở phía Server, không trộn vào Browser
  serverExternalPackages: ['pdf-parse', 'fluent-ffmpeg', 'mammoth'],
};

module.exports = nextConfig;