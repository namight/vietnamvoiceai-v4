import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import path from 'path';
import fs from 'fs';

export const VOICE_MAP = {
  'nam-minh': 'vi-VN-NamMinhNeural', 
  'hoai-my': 'vi-VN-HoaiMyNeural',
  'phuong-linh': 'vi-VN-HoaiMyNeural', 
  'an-minh': 'vi-VN-NamMinhNeural',
};

// ĐỔI outputFilename THÀNH outputPath để khớp với tệp API Route
export async function generateAudioChunk(text, voiceKey = 'nam-minh', rate = 1.0, outputPath) {
  return new Promise((resolve, reject) => {
    // Sử dụng IIFE (hàm chạy ngay lập tức) để bọc async trong Promise chuẩn xác nhất
    (async () => {
      try {
        const voice = VOICE_MAP[voiceKey] || VOICE_MAP['nam-minh'];
        const tts = new MsEdgeTTS();
        
        await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

        // Đảm bảo thư mục cha của file đầu ra tồn tại (phòng trường hợp os.tmpdir() bị xóa)
        const outputDir = path.dirname(outputPath); 
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Tính toán tốc độ đọc
        const ratePercent = Math.round((parseFloat(rate) - 1) * 100);
        const rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
        
        // Loại bỏ ký tự đặc biệt để tránh lỗi SSML Injection
        const safeText = text.replace(/[<>&'"]/g, '').trim();

        const response = await tts.toStream(safeText, { rate: rateString });
        const audioStream = response.audioStream || response;

        if (!audioStream || typeof audioStream.pipe !== 'function') {
          return reject(new Error("Không thể kết nối luồng âm thanh từ máy chủ Microsoft."));
        }

        const writeStream = fs.createWriteStream(outputPath);
        audioStream.pipe(writeStream);

        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', (err) => {
          // Xóa file lỗi đang ghi dở
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          reject(err);
        });

      } catch (error) {
        console.error('[TTS Engine Error]', error);
        reject(error);
      }
    })();
  });
}