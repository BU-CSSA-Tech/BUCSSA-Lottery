/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  important: true, // 添加这一行来提高样式优先级
  theme: {
    extend: {
      fontFamily: {
        alimama: ['"Alimama DongFang DaKai"', 'sans-serif'],
      },
      colors: {
        primary: {
          from: '#28a7ff',
          to: '#0066ff',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'red-down': '0 4px 8px 0 rgba(220, 38, 38, 0.25)',
        'red-down-lg': '0 6px 12px 0 rgba(220, 38, 38, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 