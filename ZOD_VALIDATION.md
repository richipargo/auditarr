# Zod Type Validation

This document explains the Zod runtime type validation system implemented in AuditArr.

## Overview

Zod provides runtime type validation for all API endpoints, ensuring:
- **Type safety at runtime** - Catches type errors that TypeScript can't catch at compile time
- **Validated responses** - All API responses are validated before being sent to clients
- **Schema documentation** - Schemas serve as living documentation of API contracts
- **Parse errors** - Automatic error messages when data doesn't match expected types

## Schema Definitions

All schemas are defined in `server/schemas/message.ts`:

### Action Schema

Represents an ntfy.sh action button:

```typescript
const actionSchema = z.object({
  action: z.string(),
  label: z.string(),
  url: z.string().url().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  clear: z.boolean().optional()
})
```

### Message Metadata Schema

Validates incoming message metadata (from ntfy.sh headers):

```typescript
const messageMetadataSchema = z.object({
  title: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  click: z.string().url().optional(),
  icon: z.string().url().optional(),
  actions: z.array(actionSchema).optional()
})
```

### Message Response Schema

Validates API response messages:

```typescript
const messageResponseSchema = z.object({
  id: z.string(),
  time: z.string(),
  topic: z.string(),
  message: z.string(),
  title: z.string().optional(),
  priority: z.number().int().min(1).max(5),
  tags: z.array(z.string()).optional(),
  click: z.string().url().optional(),
  icon: z.string().url().optional(),
  actions: z.array(actionSchema).optional(),
  event: z.string()
})
```

### Messages Array Schema

Validates arrays of messages:

```typescript
const messagesArraySchema = z.array(messageResponseSchema)
```

### Topics Array Schema

Validates arrays of topic names:

```typescript
const topicsArraySchema = z.array(z.string())
```

### Message Filters Schema

Validates query parameters for filtering messages:

```typescript
const messageFiltersSchema = z.object({
  topic: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})
```

## Type Exports

All schemas export TypeScript types:

```typescript
export type Action = z.infer<typeof actionSchema>
export type MessageMetadata = z.infer<typeof messageMetadataSchema>
export type MessageResponse = z.infer<typeof messageResponseSchema>
export type MessageFilters = z.infer<typeof messageFiltersSchema>
```

These types are used throughout the codebase for compile-time type checking.

## API Endpoint Validation

### POST /api/[topic]

**Validates:**
1. **Input**: Message metadata from ntfy.sh headers
2. **Output**: Message response object

```typescript
// Validate metadata from headers
const validatedMetadata = messageMetadataSchema.parse(metadata)

// Save to database
const result = await saveMessage(topic, message, validatedMetadata)

// Validate and return response
return messageResponseSchema.parse(result)
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "X-Title: Server Alert" \
  -H "X-Priority: 5" \
  -H "X-Tags: urgent,server" \
  -d "Server disk space critical"
```

**Validated Response:**
```json
{
  "id": "1234567890-abc123",
  "time": "2026-02-15T10:30:00.000Z",
  "topic": "alerts",
  "message": "Server disk space critical",
  "title": "Server Alert",
  "priority": 5,
  "tags": ["urgent", "server"],
  "event": "message"
}
```

### GET /api/[topic]

**Validates:**
- **Output**: Array of message objects

```typescript
const messages = await getMessagesByTopic(topic)
return messagesArraySchema.parse(messages)
```

### GET /api/topics

**Validates:**
- **Output**: Array of topic strings

```typescript
const topics = await getAllTopics()
return topicsArraySchema.parse(topics)
```

### GET /api/messages

**Validates:**
1. **Input**: Query parameters (filters)
2. **Output**: Array of message objects

```typescript
// Validate query parameters
const filters = messageFiltersSchema.parse({
  topic: query.topic,
  search: query.search,
  startDate: query.startDate,
  endDate: query.endDate
})

// Get filtered messages
const messages = await getFilteredMessages(filters)

// Validate and return response
return messagesArraySchema.parse(messages)
```

## Database Function Validation

All database functions return validated types:

### saveMessage()

```typescript
export async function saveMessage(
  topic: string,
  message: string,
  metadata: MessageMetadata = {}
): Promise<MessageResponse>
```

Returns a validated `MessageResponse` object.

### getMessagesByTopic()

```typescript
export async function getMessagesByTopic(
  topic: string
): Promise<MessageResponse[]>
```

Returns an array of validated `MessageResponse` objects.

### getFilteredMessages()

```typescript
export async function getFilteredMessages(
  filters: MessageFilters
): Promise<MessageResponse[]>
```

Accepts validated `MessageFilters` and returns validated `MessageResponse[]`.

## Error Handling

When validation fails, Zod throws a `ZodError` with detailed information:

```typescript
try {
  const validated = messageResponseSchema.parse(data)
} catch (error) {
  if (error instanceof ZodError) {
    console.error('Validation failed:', error.errors)
    // error.errors contains detailed validation errors
  }
}
```

**Example error:**
```json
{
  "errors": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["priority"],
      "message": "Expected number, received string"
    }
  ]
}
```

## Benefits

1. **Runtime Safety**: Catches type errors that slip through TypeScript compilation
2. **API Contract Enforcement**: Ensures API responses match documented schemas
3. **Self-Documentation**: Schemas document the expected data structure
4. **Client Confidence**: Clients can trust the API response structure
5. **Debugging**: Clear error messages when data doesn't match schema
6. **Refactoring Safety**: Schema changes immediately affect all validation points

## Testing

All validation is tested in the API test suite:

```bash
npm test -- --project api
```

Tests verify:
- ✅ Valid data passes validation
- ✅ Invalid data throws ZodError
- ✅ API responses match schemas
- ✅ Database queries return validated types

Coverage: **97.82%** statement coverage including schemas

## Adding New Schemas

To add validation for a new API endpoint:

1. **Define the schema** in `server/schemas/message.ts`:
   ```typescript
   export const myNewSchema = z.object({
     field1: z.string(),
     field2: z.number()
   })

   export type MyNewType = z.infer<typeof myNewSchema>
   ```

2. **Import in your endpoint**:
   ```typescript
   import { myNewSchema } from '../schemas/message'
   ```

3. **Validate input/output**:
   ```typescript
   const validated = myNewSchema.parse(data)
   return validated
   ```

4. **Update types** in database functions if needed

5. **Add tests** for the new validation

## Performance

Zod validation has minimal performance impact:
- Schema compilation happens once at module load
- Parse operations are optimized
- Validation adds ~1-2ms per API call
- Can be disabled in production if needed (not recommended)

## Migration from `any` Types

Before Zod, many functions returned `any`:

```typescript
// Before
function parseMessage(row: any): any {
  return { ... }
}

// After
function parseMessage(row: any): MessageResponse {
  const parsed = { ... }
  return messageResponseSchema.parse(parsed)
}
```

This migration provides:
- Type safety throughout the stack
- Runtime validation
- Better IDE autocomplete
- Compile-time type checking
