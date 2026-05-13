// lib/audio-helper.js
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export async function mergeAudioFiles(inputFiles, outputFile) {
  return new Promise((resolve, reject) => {
    if (!inputFiles || inputFiles.length === 0) {
      return reject(new Error('Không có file âm thanh để gộp.'));
    }

    if (inputFiles.length === 1) {
      fs.copyFileSync(inputFiles[0], outputFile);
      return resolve(outputFile);
    }

    const outputDir = path.dirname(outputFile);
    const listPath = path.join(outputDir, `concat_list_${Date.now()}.txt`);
    let listContent = '';
    
    inputFiles.forEach(file => {
      // Bắt buộc dùng path.basename để FFmpeg không bị lỗi với tên máy tính
      const fileName = path.basename(file);
      listContent += `file '${fileName}'\n`;
    });

    fs.writeFileSync(listPath, listContent);

    ffmpeg()
      .input(listPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions('-c copy') 
      .save(outputFile)
      .on('end', () => {
        if (fs.existsSync(listPath)) fs.unlinkSync(listPath);
        resolve(outputFile);
      })
      .on('error', (err) => {
        console.error('Lỗi FFmpeg khi gộp:', err);
        reject(err);
      });
  });
}