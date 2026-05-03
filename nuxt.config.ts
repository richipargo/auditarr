// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    // '@nuxt/test-utils',
    '@nuxt/test-utils/module',
    '@nuxt/ui',
    '@nuxthub/core',
  ],
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Auditarr',
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    dbPath: 'data',
  },
  compatibilityDate: '2025-07-15',
  nitro: {
    experimental: {
      tasks: true,
    },
  },
  hub: {
    db: 'sqlite',
    dir: 'data',
  },
  eslint: {
    config: {
      stylistic: false,
    },
  },
});
