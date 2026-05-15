import mammoth from 'mammoth';

export async function extractTextFromFile(buffer, filename) {
  try {
    const extension = filename.split('.').pop().toLowerCase();
    let extractedText = '';
    
    // 1. Trích xuất DOCX (Mammoth chạy rất mượt trên Server)
    if (extension === 'docx') {
      const result = await mammoth.extractRawText({ buffer: buffer });
      extractedText = result.value;
    } 
    // 2. Trích xuất PDF (Nạp động và "Lách luật" Server)
    else if (extension === 'pdf') {
      // Bơm các biến "giả" để đánh lừa thư viện PDF, chống sập Server
      if (typeof global.DOMMatrix === 'undefined') global.DOMMatrix = class {};
      if (typeof global.ImageData === 'undefined') global.ImageData = class {};
      if (typeof global.Path2D === 'undefined') global.Path2D = class {};

      // Chỉ import pdf-parse khi thực sự cần dùng đến
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } 
    else {
      throw new Error('Định dạng tệp không được hỗ trợ. Chỉ nhận .pdf hoặc .docx');
    }

    // 3. Dọn dẹp văn bản để AI đọc mượt hơn
    const cleanText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ +/g, ' ')
      .trim();

    return cleanText;

  } catch (error) {
    console.error('[Doc Processor Error]', error);
    throw new Error('Không thể đọc nội dung tệp. ' + error.message);
  }
}