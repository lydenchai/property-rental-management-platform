// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
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
});
