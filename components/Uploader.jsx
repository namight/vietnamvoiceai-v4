// components/Uploader.jsx
import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';

export default function Uploader({ text, setText, file, setFile }) {
  const [activeTab, setActiveTab] = useState('text'); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setText('');
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition ${
            activeTab === 'file' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
              : 'bg-white dark:bg-[#151e32] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Upload className="w-5 h-5" /> Tải file lên
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition ${
            activeTab === 'text' 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
              : 'bg-white dark:bg-[#151e32] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <FileText className="w-5 h-5" /> Nhập văn bản
        </button>
      </div>

      {/* Nội dung Tab */}
      <div className="bg-white dark:bg-[#151e32] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        {activeTab === 'text' ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nhập văn bản của bạn</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">{wordCount.toLocaleString()} / 10,000 từ</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setFile(null); }}
              placeholder="Nhập hoặc dán văn bản cần chuyển đổi thành giọng nói..."
              className="w-full h-64 bg-gray-50 dark:bg-[#0b1120] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        ) : (
          <div className="h-64 border-2 border-dashed border-blue-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-blue-50/50 dark:bg-[#0b1120] hover:bg-blue-50 dark:hover:bg-gray-800/50 transition relative group cursor-pointer">
            <input 
              type="file" accept=".docx,.pdf" onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Kéo thả file hoặc click để chọn</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Hỗ trợ: .docx, .pdf (tối đa 10MB)</p>
            {file && (
              <div className="mt-4 px-4 py-2 bg-white dark:bg-[#151e32] border border-green-200 dark:border-green-500/30 rounded-lg text-green-600 dark:text-green-400 font-medium flex items-center shadow-sm z-10 relative">
                Đã tải lên: {file.name}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}