// lib/tts-engine.js
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import path from 'path';
import fs from 'fs';

export const VOICE_MAP = {
  'nam-minh': 'vi-VN-NamMinhNeural', 
  'hoai-my': 'vi-VN-HoaiMyNeural',
  'phuong-linh': 'vi-VN-HoaiMyNeural', 
  'an-minh': 'vi-VN-NamMinhNeural',
};

export async function generateAudioChunk(text, voiceKey = 'nam-minh', rate = 1.0, outputFilename) {
  return new Promise(async (resolve, reject) => {
    try {
      const voice = VOICE_MAP[voiceKey] || VOICE_MAP['nam-minh'];
      const tts = new MsEdgeTTS();
      
      // Thiết lập chất lượng cao nhất
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const outputDir = path.join(process.cwd(), 'public', 'outputs');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const finalFilePath = path.join(outputDir, outputFilename);

      const ratePercent = Math.round((parseFloat(rate) - 1) * 100);
      const rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
      
      // Làm sạch văn bản để AI không vấp
      const safeText = text.replace(/[<>&'"]/g, '').trim();

      // LẤY LUỒNG TRỰC TIẾP (NHANH NHẤT & KHÔNG LỖI THƯ MỤC)
      const response = await tts.toStream(safeText, { rate: rateString });
      
      // Khắc phục lỗi "undefined reading audio" bằng cách kiểm tra cả 2 định dạng trả về của thư viện
      const audioStream = response.audioStream || response;

      if (!audioStream || typeof audioStream.pipe !== 'function') {
        return reject(new Error("Không thể kết nối luồng âm thanh từ Microsoft."));
      }

      const writeStream = fs.createWriteStream(finalFilePath);
      audioStream.pipe(writeStream);

      writeStream.on('finish', () => resolve(finalFilePath));
      writeStream.on('error', (err) => {
        if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);
        reject(err);
      });

    } catch (error) {
      console.error('[TTS Engine Error]', error);
      reject(error);
    }
  });
}