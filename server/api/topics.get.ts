import { topicsArraySchema } from '../schemas/message';
import { db, schema } from '@nuxthub/db';

export default defineEventHandler(async (event) => {
  try {
    const results = await db
      .selectDistinct({ topic: schema.messages.topic })
      .from(schema.messages)
      .orderBy(schema.messages.topic);

    const topics = results.map(row => row.topic);

    return topicsArraySchema.parse(topics);
  } catch (error) {
    console.error('Error retrieving topics:', error);
    setResponseStatus(event, 500);
    return [];
  }
});
