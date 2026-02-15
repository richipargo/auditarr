// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Auditarr',
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },


  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/test-utils',
    '@nuxt/ui'
  ]
})
