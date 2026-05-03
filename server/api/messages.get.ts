import { messageFiltersSchema, messagesArraySchema } from '../schemas/message';
import { db, schema } from '@nuxthub/db';
import { and, desc, eq, gte, like, lte, or } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const filters = messageFiltersSchema.parse({
      topic: query.topic as string | undefined,
      search: query.search as string | undefined,
      startDate: query.startDate as string | undefined,
      endDate: query.endDate as string | undefined,
    });

    const conditions = [];

    if (filters.topic) {
      const topic = filters.topic.toLowerCase();
      conditions.push(eq(schema.messages.topic, topic));
    }

    if (filters.search) {
      // Search in both message content, topic, and title (case-insensitive for topic)
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          like(schema.messages.message, searchPattern),
          like(schema.messages.topic, `%${filters.search.toLowerCase()}%`),
          like(schema.messages.title, searchPattern)
        )
      );
    }

    if (filters.startDate) {
      conditions.push(gte(schema.messages.createdAt, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(schema.messages.createdAt, new Date(filters.endDate)));
    }

    const q = db
    .select()
    .from(schema.messages)
    .orderBy(desc(schema.messages.createdAt))
    .limit(100);

    const results = conditions.length > 0
      ? await q.where(and(...conditions))
      : await q;

    return messagesArraySchema.parse(results);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    setResponseStatus(event, 500);
    return [];
  }
});
