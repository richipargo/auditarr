import { messagesArraySchema } from '../schemas/message';
import { db, schema } from '@nuxthub/db';
import { eq, desc } from 'drizzle-orm';
import { toMessageResponseList } from '../utils/messages';

export default defineEventHandler(async (event) => {
  try {
    const topic = getRouterParam(event, 'topic');
    if (!topic) {
      setResponseStatus(event, 400);
      return { error: 'Topic is required' };
    }

    const messages = await db.select()
      .from(schema.messages)
      .where(eq(schema.messages.topic, topic))
      .orderBy(desc(schema.messages.createdAt))
      .limit(100);

    return messagesArraySchema.parse(toMessageResponseList(messages));
  }
  catch (error) {
    console.error('Error retrieving messages:', error);
    setResponseStatus(event, 500);

    return [];
  }
});
