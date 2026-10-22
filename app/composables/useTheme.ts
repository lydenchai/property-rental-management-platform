import { ref, computed } from 'vue';

export type ThemeMode = 'light' | 'dark';

const currentTheme = ref<ThemeMode>('dark');
const isReady = ref(false);

export function useTheme() {
  function setTheme(mode: ThemeMode) {
    currentTheme.value = mode;
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (mode === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      try {
        localStorage.setItem('rentease-theme', mode);
      } catch (e) {
        console.warn('Could not persist theme to localStorage', e);
      }
    }
  }

  function toggleTheme() {
    setTheme(currentTheme.value === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('rentease-theme') as ThemeMode | null;
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    } catch {
      setTheme('dark');
    }
    isReady.value = true;
  }

  return {
    theme: currentTheme,
    isDark: computed(() => currentTheme.value === 'dark'),
    isReady: computed(() => isReady.value),
    setTheme,
    toggleTheme,
    initTheme,
  };
}
