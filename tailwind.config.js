// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Thêm dòng này để kích hoạt Dark Mode bằng nút bấm
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Có thể cấu hình thêm màu brand tùy chỉnh ở đây nếu cần
      }
    },
  },
  plugins: [],
}