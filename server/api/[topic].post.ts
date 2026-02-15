import { saveMessage, type MessageMetadata } from '../utils/database'
import { messageMetadataSchema, messageResponseSchema } from '../schemas/message'

// Extract ntfy.sh-style headers from request
function extractMetadata(event: any): MessageMetadata {
  const headers = getHeaders(event)

  // ntfy.sh supports multiple header formats (X-Title, Title, etc.)
  const getHeader = (names: string[]) => {
    for (const name of names) {
      const value = headers[name.toLowerCase()]
      if (value) return value
    }
    return undefined
  }

  const metadata: MessageMetadata = {}

  // Extract title
  const title = getHeader(['x-title', 'title', 't', 'ti'])
  if (title) metadata.title = title

  // Extract priority (1-5, or named: min, low, default, high, urgent/max)
  const priorityStr = getHeader(['x-priority', 'priority', 'p', 'prio'])
  if (priorityStr) {
    const priorityMap: Record<string, number> = {
      'min': 1, 'low': 2, 'default': 3, 'high': 4, 'urgent': 5, 'max': 5
    }
    metadata.priority = priorityMap[priorityStr.toLowerCase()] || parseInt(priorityStr) || 3
  }

  // Extract tags (comma-separated)
  const tagsStr = getHeader(['x-tags', 'tags', 'tag', 'ta'])
  if (tagsStr) {
    metadata.tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0)
  }

  // Extract click URL
  const click = getHeader(['x-click', 'click'])
  if (click) metadata.click = click

  // Extract icon URL
  const icon = getHeader(['x-icon', 'icon'])
  if (icon) metadata.icon = icon

  // Extract actions (JSON array)
  const actionsStr = getHeader(['x-actions', 'actions', 'action'])
  if (actionsStr) {
    try {
      metadata.actions = JSON.parse(actionsStr)
    } catch (e) {
      console.error('Failed to parse actions JSON:', e)
    }
  }

  return metadata
}

export default defineEventHandler(async (event) => {
  try {
    const topic = getRouterParam(event, 'topic')
    if (!topic) {
      setResponseStatus(event, 400)
      return { error: 'Topic is required' }
    }

    const body = await readRawBody(event)
    const message = body?.toString() || ''

    // Extract ntfy.sh headers
    const metadata = extractMetadata(event)

    // Validate metadata with Zod
    const validatedMetadata = messageMetadataSchema.parse(metadata)

    console.log(`[${new Date().toISOString()}] Publishing to topic "${topic}":`, {
      message: message.substring(0, 100),
      metadata: validatedMetadata
    })

    const result = await saveMessage(topic, message, validatedMetadata)

    // Validate response with Zod
    return messageResponseSchema.parse(result)
  } catch (error) {
    console.error('Error saving message to database:', error)
    setResponseStatus(event, 500)
    return { error: 'Internal Server Error' }
  }
})
