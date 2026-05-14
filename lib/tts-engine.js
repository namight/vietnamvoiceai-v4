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
      
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      // SỬA ĐỔI: Dùng thư mục /tmp để có quyền ghi file trên Render
      const outputDir = '/tmp'; 
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const finalFilePath = path.join(outputDir, outputFilename);

      const ratePercent = Math.round((parseFloat(rate) - 1) * 100);
      const rateString = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
      
      const safeText = text.replace(/[<>&'"]/g, '').trim();

      const response = await tts.toStream(safeText, { rate: rateString });
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