import { defineVitestProject } from '@nuxt/test-utils/config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'api',
          include: ['test/api/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
        // FIXME: Temporary fix for a bun issue
        plugins: [
          {
            name: 'ignore-bun-test',
            enforce: 'pre',
            resolveId(id) {
              if (id === 'bun:test') {
                return { id: 'bun:test', external: true };
              }
            }
          }
        ]
      }),
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
    },
  },
});
