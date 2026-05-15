// app/api/tts/route.js
import { NextResponse } from 'next/server';
import { generateAudioChunk } from '../../../lib/tts-engine';
import { extractTextFromFile } from '../../../lib/doc-processor';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';

// Đảm bảo thư mục public/audio tồn tại để lưu file đầu ra cho Web đọc
const PUBLIC_AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');
if (!fs.existsSync(PUBLIC_AUDIO_DIR)) {
  fs.mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });
}

// ---------------------------------------------------------
// HÀM PHỤ 1: CHIA NHỎ VĂN BẢN THÔNG MINH
// Cắt văn bản thành các đoạn ngắn (~500 ký tự) dựa trên dấu câu
// Giúp Microsoft Edge TTS không bị nghẹn và đọc tự nhiên hơn
// ---------------------------------------------------------
function chunkText(text, maxLength = 500) {
  // Tách câu dựa trên dấu chấm, phẩy, hỏi chấm, chấm than, hoặc xuống dòng
  const sentences = text.match(/[^.,!?\n]+[.,!?\n]+/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  
  return chunks.length ? chunks : [text];
}

// ---------------------------------------------------------
// HÀM PHỤ 2: GHÉP FILE BẰNG FFMPEG
// ---------------------------------------------------------
function mergeAudioFiles(inputFiles, outputFile) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    
    // Đưa tất cả các file âm thanh nhỏ vào lệnh FFmpeg
    inputFiles.forEach(file => {
      command.input(file);
    });
    
    command
      .on('error', (err) => {
        console.error('[FFmpeg Error]', err);
        reject(err);
      })
      .on('end', () => resolve(outputFile))
      .mergeToFile(outputFile, os.tmpdir()); // Dùng /tmp để lưu cache ghép file
  });
}

// ---------------------------------------------------------
// API CHÍNH: XỬ LÝ YÊU CẦU POST
// ---------------------------------------------------------
export async function POST(req) {
  try {
    const formData = await req.formData();
    const voice = formData.get('voice') || 'nam-minh';
    const rate = formData.get('rate') || '1.0';
    const pause = formData.get('pause') || '1.0'; 
    
    const rawText = formData.get('text');
    const file = formData.get('file');

    let finalRawText = '';

    // 1. Trích xuất nội dung từ File hoặc Text
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      finalRawText = await extractTextFromFile(buffer, file.name);
    } else if (rawText) {
      finalRawText = rawText;
    }

    if (!finalRawText || finalRawText.trim() === '') {
      return NextResponse.json({ error: 'Không có nội dung để đọc' }, { status: 400 });
    }

    // 2. Cắt nhỏ văn bản
    const textChunks = chunkText(finalRawText, 500);
    const audioFiles = [];
    const tmpDir = os.tmpdir();

    // 3. THUẬT TOÁN XỬ LÝ THEO LÔ (BATCH PROCESSING)
    // Tối ưu RAM cho Render: Cho phép chạy 3 file CÙNG LÚC
    const BATCH_SIZE = 3; 

    for (let i = 0; i < textChunks.length; i += BATCH_SIZE) {
      const batch = textChunks.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map((text, index) => {
        const chunkIndex = i + index;
        const chunkPath = path.join(tmpDir, `chunk_${chunkIndex}_${Date.now()}.mp3`);
        
        // Gọi hàm TTS (Thêm khoảng trắng vào cuối để tạo nhịp ngắt (pause) giữa các câu)
        const textWithPause = text + " ".repeat(Math.max(1, parseInt(parseFloat(pause) * 5)));
        return generateAudioChunk(textWithPause, voice, rate, chunkPath);
      });

      // Chờ lô 3 file hiện tại tải xong hoàn toàn mới đi tiếp sang lô sau
      const completedBatchFiles = await Promise.all(batchPromises);
      audioFiles.push(...completedBatchFiles);
    }

    // 4. Khâu các file âm thanh lại với nhau
    const outputFileName = `voice_${Date.now()}.mp3`;
    const finalOutputPath = path.join(PUBLIC_AUDIO_DIR, outputFileName);
    
    if (audioFiles.length === 1) {
      // Nếu văn bản ngắn (chỉ có 1 chunk), copy thẳng ra kết quả luôn (bỏ qua FFmpeg cho nhẹ)
      fs.copyFileSync(audioFiles[0], finalOutputPath);
    } else {
      // Nếu có nhiều chunk, nhờ FFmpeg nối lại
      await mergeAudioFiles(audioFiles, finalOutputPath);
    }

    // 5. Dọn dẹp rác (Xóa các file chunk tạm trong bộ nhớ /tmp)
    for (const file of audioFiles) {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }

    // 6. Trả đường dẫn URL về cho Frontend
    return NextResponse.json({ url: `/audio/${outputFileName}` });

  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}