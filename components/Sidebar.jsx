// components/Sidebar.jsx
import { Settings, Mic2, Gauge, Clock, Check } from 'lucide-react';

export default function Sidebar({ voice, setVoice, rate, setRate, pause, setPause }) {
  return (
    <div className="w-full md:w-80 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1120] p-6 flex flex-col overflow-y-auto transition-colors duration-300">
      <div className="mb-8 flex items-center gap-2 text-gray-800 dark:text-white font-bold text-xl">
        <Settings className="w-6 h-6 text-blue-500" />
        Cài đặt
      </div>

      {/* Cấu hình Giọng đọc */}
      <div className="mb-8 space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Mic2 className="w-4 h-4 text-purple-500" /> Giọng đọc
        </label>
        <select 
          value={voice} 
          onChange={(e) => setVoice(e.target.value)}
          className="w-full p-3 bg-white dark:bg-[#151e32] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer appearance-none shadow-sm"
        >
          <option value="nam-minh">Nam Minh</option>
          <option value="hoai-my">Hoài My</option>
          <option value="phuong-linh">Phương Linh</option>
          <option value="an-minh">An Minh</option>
        </select>
        {/* Đã xóa các thẻ hiển thị badge Giọng nữ / Neural AI ở đây */}
      </div>

      {/* Cấu hình Tốc độ đọc */}
      <div className="mb-8 space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Gauge className="w-4 h-4 text-blue-500" /> Tốc độ đọc
        </label>
        <select 
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full p-3 bg-white dark:bg-[#151e32] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer shadow-sm"
        >
          <option value="0.5">0.5x - Chậm</option>
          <option value="0.75">0.75x - Hơi chậm</option>
          <option value="1.0">1.0x - Bình thường</option>
          <option value="1.25">1.25x - Hơi nhanh</option>
          <option value="1.5">1.5x - Nhanh</option>
          <option value="2.0">2.0x - Cực nhanh</option>
        </select>
        <input 
          type="range" min="0.5" max="2.0" step="0.25" value={rate} onChange={(e) => setRate(e.target.value)}
          className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
        />
      </div>

      {/* Cấu hình Ngắt câu */}
      <div className="mb-8 space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Clock className="w-4 h-4 text-blue-500" /> Tốc độ ngắt câu
        </label>
        <select 
          value={pause}
          onChange={(e) => setPause(e.target.value)}
          className="w-full p-3 bg-white dark:bg-[#151e32] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer shadow-sm"
        >
          <option value="0.5">0.5x - Ngắn</option>
          <option value="1.0">1.0x - Bình thường</option>
          <option value="1.5">1.5x - Dài</option>
        </select>
        <input 
          type="range" min="0.5" max="1.5" step="0.5" value={pause} onChange={(e) => setPause(e.target.value)}
          className="w-full accent-blue-500 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
        />
      </div>

      {/* Box Thông tin hệ thống */}
      <div className="mt-auto bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl p-5">
        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Thông tin hệ thống
        </h4>
        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-blue-500" /> Giới hạn: 10,000 từ/lần</li>
          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-blue-500" /> Định dạng: .docx, .pdf</li>
          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-blue-500" /> Thời gian xử lý: ~40 giây</li>
        </ul>
      </div>
    </div>
  );
}