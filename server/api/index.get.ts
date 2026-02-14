import { getAllTopics } from '../utils/database';

export default defineEventHandler(async (event) => {
  return new Promise((resolve, _reject) => {
    getAllTopics((err, topics) => {
      if (err) {
        console.error('Error retrieving topics:', err);
        setResponseStatus(event, 500);
        resolve({ topics: [] });
      } else {
        resolve({ topics });
      }
    });
  });
});
