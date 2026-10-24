// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxtjs/i18n'
  ],
  googleFonts: {
    download: true,
    families: {
      'Plus+Jakarta+Sans': [400, 500, 600, 700],
      'Kantumruy+Pro': [300, 400, 500, 600, 700],
      'Inter': [400, 500, 600, 700],
    },
  },
  devtools: { enabled: true },
  imports: {
    dirs: ['stores', 'stores/**'],
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET || 'super-secret-random-key-change-this-in-production-min-32-chars-long',
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },
  app: {
    head: {
      title: 'Property Rental Management Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Enterprise-grade property rental management platform for Landlords, Tenants, Technicians, and Admins.',
        },
      ],
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('rentease-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}else{document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');}}catch(e){}})();`,
        },
      ],
    },
  },
  i18n: {
    langDir: 'locales',
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', name: 'English', file: 'en.json', language: 'en-US' },
      { code: 'km', name: 'ខ្មែរ', file: 'km.json', language: 'km-KH' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'rentease-locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
  }
});
