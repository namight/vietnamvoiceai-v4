// app/api/tts/route.js
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { extractTextFromFile } from '../../../lib/doc-processor';
import { generateAudioChunk } from '../../../lib/tts-engine';
import { mergeAudioFiles } from '../../../lib/audio-helper';

function chunkText(text, maxLength = 2500) {
  // Cắt câu theo dấu câu chuẩn ngữ pháp Việt Nam
  const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence + ' ';
    } else {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const voice = formData.get('voice') || 'nam-minh';
    const rate = formData.get('rate') || '1.0';
    let rawText = formData.get('text') || '';
    const file = formData.get('file');

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      rawText = await extractTextFromFile(buffer, file.type);
    }

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: 'Nội dung trống.' }, { status: 400 });
    }

    const outputDir = path.join(process.cwd(), 'public', 'outputs');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const chunks = chunkText(rawText, 2500);
    
    // Nếu văn bản ngắn (dưới 2500 ký tự), trả về file ngay lập tức (Speed < 1s)
    if (chunks.length === 1) {
      const fileName = `voice_${Date.now()}.mp3`;
      await generateAudioChunk(chunks[0], voice, rate, fileName);
      return NextResponse.json({ success: true, url: `/outputs/${fileName}` });
    }

    // Nếu văn bản dài, chạy song song 4 khối để đạt tốc độ công nghiệp
    const generatedFiles = [];
    const BATCH_SIZE = 4;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE).map((c, idx) => 
        generateAudioChunk(c, voice, rate, `chunk_${Date.now()}_${i + idx}.mp3`)
      );
      const results = await Promise.all(batch);
      generatedFiles.push(...results);
    }

    const finalFilename = `vi_voice_ai_final_${Date.now()}.mp3`;
    const finalFilePath = path.join(outputDir, finalFilename);
    
    await mergeAudioFiles(generatedFiles, finalFilePath);

    // Dọn dẹp tệp tạm
    generatedFiles.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));

    return NextResponse.json({ success: true, url: `/outputs/${finalFilename}` });

  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json({ error: 'Lỗi hệ thống xử lý.' }, { status: 500 });
  }
}