// components/AudioPlayer.jsx
import { useState, useEffect } from 'react';
import { Download, PlayCircle, Music, Loader2, Timer } from 'lucide-react';

export default function AudioPlayer({ audioUrl, isLoading }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timerInterval;
    let progressInterval;

    if (isLoading) {
      setElapsedTime(0);
      setProgress(0);

      timerInterval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 50) return prev + Math.random() * 4;
          if (prev < 85) return prev + Math.random() * 2;
          if (prev < 98) return prev + Math.random() * 0.2;
          return prev;
        });
      }, 400); 
    } else if (audioUrl) {
      setProgress(100);
      // Cố tình KHÔNG reset elapsedTime ở đây để giữ nguyên thời gian hoàn thành
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, audioUrl]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) {
    return (
      <div className="mt-8 bg-white dark:bg-[#151e32] border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Hệ thống AI đang tổng hợp âm thanh...</h3>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-3 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out" style={{ width: `${Math.min(progress, 99)}%` }}></div>
          </div>
          <div className="flex justify-between w-full text-sm font-semibold text-gray-500 dark:text-gray-400">
            <span>Tiến độ: {Math.min(Math.round(progress), 99)}%</span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400"><Timer className="w-4 h-4" /> Thời gian: {formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!audioUrl) return null;

  return (
    <div className="mt-8 bg-white dark:bg-[#151e32] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">File âm thanh đã tạo</h3>
            <p className="text-sm font-semibold text-blue-500 mt-1 flex items-center gap-1">
              <Timer className="w-4 h-4" /> Hoàn thành trong: {formatTime(elapsedTime)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 dark:bg-[#0b1120] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <audio controls src={audioUrl} className="w-full md:flex-1 h-12 custom-audio-player" />
        <a href={audioUrl} download className="w-full md:w-auto px-6 py-3 bg-[#00B167] hover:bg-[#009e5c] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-green-500/20 whitespace-nowrap">
          <Download className="w-5 h-5" /> Tải xuống
        </a>
      </div>
    </div>
  );
}