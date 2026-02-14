import { getFilteredMessages } from '../utils/database'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    const messages = await getFilteredMessages({
      topic: query.topic as string | undefined,
      search: query.search as string | undefined,
      startDate: query.startDate as string | undefined,
      endDate: query.endDate as string | undefined
    })

    return messages
  } catch (error) {
    console.error('Error retrieving messages:', error)
    setResponseStatus(event, 500)
    return []
  }
})
