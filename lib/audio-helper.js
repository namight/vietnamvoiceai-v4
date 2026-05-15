import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

/**
 * Gộp các tệp âm thanh thành một tệp duy nhất bằng FFmpeg
 * @param {string[]} inputFiles - Danh sách đường dẫn tuyệt đối đến các tệp audio đầu vào
 * @param {string} outputFile - Đường dẫn tuyệt đối của tệp đầu ra
 */
export async function mergeAudioFiles(inputFiles, outputFile) {
  return new Promise((resolve, reject) => {
    // 1. Kiểm tra đầu vào
    if (!inputFiles || inputFiles.length === 0) {
      return reject(new Error('Không có file âm thanh để gộp.'));
    }

    // 2. Tối ưu: Nếu chỉ có 1 file, copy thẳng sang output, không cần chạy FFmpeg
    if (inputFiles.length === 1) {
      try {
        fs.copyFileSync(inputFiles[0], outputFile);
        return resolve(outputFile);
      } catch (err) {
        return reject(err);
      }
    }

    // 3. Chuẩn bị file danh sách (concat list) cho FFmpeg
    const outputDir = path.dirname(outputFile);
    const listPath = path.join(outputDir, `concat_list_${Date.now()}.txt`);
    let listContent = '';
    
    inputFiles.forEach(file => {
      /**
       * QUAN TRỌNG: 
       * FFmpeg trên Windows yêu cầu đường dẫn trong file list phải dùng dấu '/' 
       * và bọc trong nháy đơn để tránh lỗi nếu tên thư mục có khoảng trắng.
       */
      const safePath = file.replace(/\\/g, '/'); 
      listContent += `file '${safePath}'\n`;
    });

    try {
      fs.writeFileSync(listPath, listContent);
    } catch (err) {
      return reject(new Error('Không thể tạo tệp danh sách tạm: ' + err.message));
    }

    // 4. Chạy FFmpeg
    ffmpeg()
      .input(listPath)
      .inputOptions([
        '-f concat', // Sử dụng chế độ nối file
        '-safe 0'    // Cho phép đọc đường dẫn tuyệt đối
      ])
      .outputOptions('-c copy') // Nối trực tiếp luồng dữ liệu (không nén lại), cực nhanh và giữ nguyên chất lượng
      .save(outputFile)
      .on('end', () => {
        // Dọn dẹp file tạm sau khi hoàn tất
        if (fs.existsSync(listPath)) {
          fs.unlinkSync(listPath);
        }
        resolve(outputFile);
      })
      .on('error', (err) => {
        // Dọn dẹp file tạm ngay cả khi lỗi
        if (fs.existsSync(listPath)) {
          fs.unlinkSync(listPath);
        }
        console.error('Lỗi FFmpeg khi gộp audio:', err);
        reject(new Error('FFmpeg gộp file thất bại: ' + err.message));
      });
  });
}