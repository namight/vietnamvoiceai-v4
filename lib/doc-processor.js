// lib/doc-processor.js
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

export async function extractTextFromFile(buffer, mimeType) {
  try {
    // 1. Xử lý tệp Word (.docx) - Dùng mammoth để lấy text thuần
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: buffer });
      return result.value; 
    } 
    
    // 2. Xử lý tệp PDF - Dùng pdf-parse
    else if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } 
    
    // 3. Tệp văn bản thuần (.txt)
    else {
      return buffer.toString('utf8');
    }
  } catch (error) {
    console.error('[Doc Processor Error] Lỗi đọc file:', error);
    throw new Error('Định dạng file không được hỗ trợ hoặc file bị lỗi.');
  }
}