import { describe, expect, it } from 'vitest';
import { fetch, setup } from '@nuxt/test-utils/e2e';

describe('[topic].get.ts', async () => {
  await setup({
    server: true
  });

  it ('returns messages by topic', async () => {
    const res = await fetch ('/api/test');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      a: 'afsdfds',
    });
  });
});
