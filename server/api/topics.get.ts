import { getAllTopics } from '../utils/database'

export default defineEventHandler(async (event) => {
  try {
    const topics = await getAllTopics()
    return topics
  } catch (error) {
    console.error('Error retrieving topics:', error)
    setResponseStatus(event, 500)
    return []
  }
})
