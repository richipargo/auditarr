import { db, schema } from '@nuxthub/db';

export default defineEventHandler(async () => {
  const results = await db
    .selectDistinct({ topic: schema.messages.topic })
    .from(schema.messages)
    .orderBy(schema.messages.topic);

  return results.map(row => row.topic) || [];
});
