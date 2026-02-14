import { getMessagesByTopic } from '../utils/database'

export default defineEventHandler(async (event) => {
  try {
    const topic = getRouterParam(event, 'topic')
    if (!topic) {
      setResponseStatus(event, 400)
      return { error: 'Topic is required' }
    }

    const messages = await getMessagesByTopic(topic)
    return messages
  } catch (error) {
    console.error('Error retrieving messages:', error)
    setResponseStatus(event, 500)
    return []
  }
})
