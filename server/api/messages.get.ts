import { getFilteredMessages } from '../utils/database'
import { messageFiltersSchema, messagesArraySchema } from '../schemas/message'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    // Validate query parameters with Zod
    const filters = messageFiltersSchema.parse({
      topic: query.topic as string | undefined,
      search: query.search as string | undefined,
      startDate: query.startDate as string | undefined,
      endDate: query.endDate as string | undefined
    })

    const messages = await getFilteredMessages(filters)

    // Validate response array with Zod
    return messagesArraySchema.parse(messages)
  } catch (error) {
    console.error('Error retrieving messages:', error)
    setResponseStatus(event, 500)
    return []
  }
})
