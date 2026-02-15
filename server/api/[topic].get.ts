import { getMessagesByTopic } from '../utils/database'
import { messagesArraySchema } from '../schemas/message'

export default defineEventHandler(async (event) => {
  try {
    const topic = getRouterParam(event, 'topic')
    if (!topic) {
      setResponseStatus(event, 400)
      return { error: 'Topic is required' }
    }

    const messages = await getMessagesByTopic(topic)

    // Validate response array with Zod
    return messagesArraySchema.parse(messages)
  } catch (error) {
    console.error('Error retrieving messages:', error)
    setResponseStatus(event, 500)
    return []
  }
})
