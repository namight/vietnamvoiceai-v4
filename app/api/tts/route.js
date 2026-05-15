import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os'; // Thêm thư viện nhận diện hệ điều hành
import { generateAudioChunk } from '@/lib/tts-engine';
import { extractTextFromFile } from '@/lib/doc-processor';

// Thư mục tạm tương thích với mọi hệ điều hành (Windows, Linux, MacOS, Vercel)
const TEMP_DIR = os.tmpdir();

// 1. HÀM POST: Nhận FormData từ Frontend
export async function POST(request) {
  try {
    const formData = await request.formData();
    const voice = formData.get('voice') || 'nam-minh';
    const rate = formData.get('rate') || '1.0';
    
    let text = formData.get('text');
    const file = formData.get('file'); // Tệp .docx hoặc .pdf

    if (!text && !file) {
      return NextResponse.json({ error: 'Thiếu văn bản hoặc tệp đầu vào' }, { status: 400 });
    }

    // Xử lý nếu người dùng tải tệp lên
    if (file && file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = file.name;
      text = await extractTextFromFile(buffer, filename);
    }

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Không thể trích xuất văn bản từ tệp này' }, { status: 400 });
    }

    // Tạo tên file an toàn
    const outputFilename = `voice_${Date.now()}.mp3`;
    // Lưu vào thư mục tạm chuẩn của hệ điều hành
    const outputPath = path.join(TEMP_DIR, outputFilename);
    
    // Truyền đường dẫn tuyệt đối vào hàm generateAudioChunk
    await generateAudioChunk(text, voice, rate, outputPath);

    return NextResponse.json({ 
      success: true, 
      url: `/api/tts?filename=${outputFilename}` 
    });

  } catch (error) {
    console.error('[API POST Error]', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi tạo âm thanh' }, { status: 500 });
  }
}

// 2. HÀM GET: Trả file từ thư mục tạm về cho trình duyệt
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawFilename = searchParams.get('filename');

    if (!rawFilename) return NextResponse.json({ error: 'Thiếu tên tệp' }, { status: 400 });

    // BẢO MẬT: path.basename đảm bảo không ai có thể dùng '../' để truy cập thư mục trái phép
    const safeFilename = path.basename(rawFilename);
    const filePath = path.join(TEMP_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Tệp không tồn tại hoặc đã hết hạn trên server' }, { status: 404 });
    }

    // TỐI ƯU: Dùng fs.promises để đọc file không đồng bộ (non-blocking)
    const fileBuffer = await fs.promises.readFile(filePath);

    // Mẹo nhỏ: Thêm việc xóa file sau khi đã tải xong (tùy chọn) để đỡ đầy ổ cứng
    // fs.promises.unlink(filePath).catch(console.error);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        // Đổi từ 'attachment' thành 'inline' nếu bạn muốn file phát trực tiếp trên trình duyệt thay vì bị ép tải về
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API GET Error]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}