import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Thiếu tên tệp' }, { status: 400 });
    }

    // Đọc file từ thư mục tạm /tmp
    const filePath = path.join('/tmp', filename);

    if (!fs.existsSync(filePath)) {
      console.error(`[API Error] File không tồn tại: ${filePath}`);
      return NextResponse.json({ error: 'Tệp tin không tồn tại trên máy chủ' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Trả về dữ liệu âm thanh với Header chuẩn
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('[API TTS Route Error]', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}