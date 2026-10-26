import { computed } from 'vue';

export type ThemeMode = 'light' | 'dark';

export function useTheme() {
  const themeCookie = useCookie<ThemeMode>('rentease-theme', {
    default: () => 'dark',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  const theme = useState<ThemeMode>('rentease_theme_mode', () => {
    return themeCookie.value || 'dark';
  });

  function applyDomClasses(mode: ThemeMode) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode;
    themeCookie.value = mode;

    if (typeof window !== 'undefined') {
      applyDomClasses(mode);
      try {
        localStorage.setItem('rentease-theme', mode);
      } catch (e) {
        console.warn('Could not persist theme to localStorage', e);
      }
    }
  }

  function toggleTheme() {
    // Check both reactive state and active DOM class to guarantee inversion
    let isCurrentDark = theme.value === 'dark';
    if (typeof document !== 'undefined') {
      if (
        document.documentElement.classList.contains('light') &&
        !document.documentElement.classList.contains('dark')
      ) {
        isCurrentDark = false;
      } else if (
        document.documentElement.classList.contains('dark') &&
        !document.documentElement.classList.contains('light')
      ) {
        isCurrentDark = true;
      }
    }
    const nextMode: ThemeMode = isCurrentDark ? 'light' : 'dark';
    setTheme(nextMode);
  }

  function initTheme() {
    if (typeof window === 'undefined') return;
    try {
      let saved: ThemeMode | null = themeCookie.value;
      if (!saved || (saved !== 'light' && saved !== 'dark')) {
        const stored = localStorage.getItem('rentease-theme') as ThemeMode | null;
        if (stored === 'light' || stored === 'dark') {
          saved = stored;
        }
      }

      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else {
        const prefersDark =
          window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    } catch {
      setTheme('dark');
    }
  }

  return {
    theme,
    currentTheme: theme,
    isDark: computed(() => theme.value === 'dark'),
    isReady: computed(() => true),
    setTheme,
    toggleTheme,
    initTheme,
  };
}
