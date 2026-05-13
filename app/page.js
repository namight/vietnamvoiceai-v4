// app/page.js
'use client';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Uploader from '../components/Uploader';
import AudioPlayer from '../components/AudioPlayer';
import { Moon, Sun, Sparkles } from 'lucide-react';

export default function Home() {
  // 1. Chỉnh mặc định thành 'light' (Giao diện sáng)
  const [theme, setTheme] = useState('light');
  
  // 2. Chỉnh giọng đọc mặc định thành 'nam-minh' (Giọng Nam)
  const [voice, setVoice] = useState('nam-minh');
  
  const [rate, setRate] = useState('1.0');
  const [pause, setPause] = useState('1.0');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Xóa phần useEffect tự động nhận diện nền tối của máy tính để luôn ưu tiên Light Mode.

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) {
      alert('Vui lòng nhập văn bản hoặc tải lên tệp!');
      return;
    }

    setIsLoading(true);
    setAudioUrl(null);

    const formData = new FormData();
    formData.append('voice', voice);
    formData.append('rate', rate);
    if (text) formData.append('text', text);
    if (file) formData.append('file', file);

    try {
      const response = await fetch('/api/tts', { method: 'POST', body: formData });
      const data = await response.json();
      if (response.ok) {
        setAudioUrl(data.url);
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      alert('Không thể kết nối Server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-[#0b1120] text-gray-900 dark:text-white transition-colors duration-300 font-sans overflow-hidden">
        
        {/* Cột trái (Sidebar) */}
        <Sidebar 
          voice={voice} setVoice={setVoice} 
          rate={rate} setRate={setRate} 
          pause={pause} setPause={setPause} 
        />
        
        {/* Cột phải (Nội dung chính) */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <header className="px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1120] flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
                <Mic className="w-6 h-6" /> 
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-500 flex items-center gap-2">
                  VIETNAMVOICEAI <Sparkles className="w-5 h-5" />
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Công nghệ chuyển đổi văn bản sang giọng nói AI</p>
              </div>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full transition-all"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </header>

          {/* Vùng thao tác */}
          <div className="p-8 max-w-5xl mx-auto w-full pb-20">
            <Uploader text={text} setText={setText} file={file} setFile={setFile} />

            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:-translate-y-0.5'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {isLoading ? 'Đang xử lý...' : 'Chuyển đổi thành giọng nói'}
            </button>

            <AudioPlayer audioUrl={audioUrl} isLoading={isLoading} />
          </div>
        </main>
        
      </div>
    </div>
  );
}

// Icon dùng trong Logo
function Mic(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  );
}