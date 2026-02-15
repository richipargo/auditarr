import { getAllTopics } from '../utils/database'
import { topicsArraySchema } from '../schemas/message'

export default defineEventHandler(async (event) => {
  try {
    const topics = await getAllTopics()

    // Validate response array with Zod
    return topicsArraySchema.parse(topics)
  } catch (error) {
    console.error('Error retrieving topics:', error)
    setResponseStatus(event, 500)
    return []
  }
})
