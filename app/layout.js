// app/layout.js
import './globals.css';

export const metadata = {
  title: 'VIETNAMVOICEAI',
  description: 'Nền tảng chuyển đổi văn bản thành giọng nói chuyên nghiệp',
};

export default function RootLayout({ children }) {
  return (
    // Thêm suppressHydrationWarning vào đây
    <html lang="vi" suppressHydrationWarning> 
      {/* Và thêm cả vào body */}
      <body className="bg-gray-950 text-white min-h-screen transition-colors duration-300" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}