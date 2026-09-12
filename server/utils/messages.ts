import type { Message } from '../db/schema.sqlite';
import type { Action, MessageResponse, RichMetadata } from '../schemas/message';

function parseJsonField<T>(value: string | null | undefined): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

/**
 * Transform a database row into the MessageResponse shape expected by the API
 * schema and the frontend.
 *
 * - id: integer → string
 * - createdAt: integer timestamp → ISO 8601 string (mapped to `time`)
 * - tags: JSON string → string[]
 * - actions: JSON string → Action[]
 * - metadata: JSON string → RichMetadata
 */
export function toMessageResponse(row: Message): MessageResponse {
  return {
    id: String(row.id),
    time: new Date(row.createdAt).toISOString(),
    topic: row.topic,
    message: row.message,
    title: row.title ?? undefined,
    priority: row.priority,
    tags: parseJsonField<string[]>(row.tags),
    click: row.click ?? undefined,
    icon: row.icon ?? undefined,
    actions: parseJsonField<Action[]>(row.actions),
    event: row.event,
    metadata: parseJsonField<RichMetadata>(row.metadata),
  };
}

/**
 * Transform an array of database rows into MessageResponse[].
 */
export function toMessageResponseList(rows: Message[]): MessageResponse[] {
  return rows.map(toMessageResponse);
}
