import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromFile(buffer, filename) {
  try {
    const extension = filename.split('.').pop().toLowerCase();
    let extractedText = '';
    
    // 1. Trích xuất văn bản dựa trên định dạng
    if (extension === 'pdf') {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } 
    else if (extension === 'docx') {
      const result = await mammoth.extractRawText({ buffer: buffer });
      extractedText = result.value;
    } 
    else {
      throw new Error('Định dạng tệp không được hỗ trợ. Chỉ nhận .pdf hoặc .docx');
    }

    // 2. TỐI ƯU: Dọn dẹp văn bản thô
    // Giúp AI đọc mượt hơn, không bị ngắc ngứ bởi các ký tự rác hoặc xuống dòng thừa
    const cleanText = extractedText
      .replace(/\r\n/g, '\n')         // Đồng bộ hóa các kiểu xuống dòng (Windows/Mac)
      .replace(/\n{3,}/g, '\n\n')     // Gộp các chỗ xuống dòng quá dài thành tối đa 2 dòng (để AI nghỉ ngơi hợp lý)
      .replace(/ +/g, ' ')            // Xóa các khoảng trắng thừa liên tiếp
      .trim();

    return cleanText;

  } catch (error) {
    console.error('[Doc Processor Error]', error);
    throw new Error('Không thể đọc nội dung tệp. Đảm bảo tệp không bị mã hóa mật khẩu hoặc hỏng.');
  }
}