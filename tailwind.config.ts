import type { Config } from 'tailwindcss';

export default <Config>{
  darkMode: 'class',
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.{js,ts}',
    './app/plugins/**/*.{js,ts}',
    './app/app.{js,ts,vue}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-primary)',
        surface: 'var(--bg-surface)',
        'surface-hover': 'var(--bg-surface-hover)',
        subtle: 'var(--bg-subtle)',
        input: 'var(--bg-input)',
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
          focus: 'var(--border-focus)',
        },
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          subtle: 'rgba(79, 70, 229, 0.12)',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Kantumruy Pro', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
