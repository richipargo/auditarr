import { getMessagesByTopic } from '../utils/database';

export default defineEventHandler(async (event) => {
  const topic = getRouterParam(event, 'topic');

  return new Promise((resolve, reject) => {
    getMessagesByTopic(topic, (err, messages) => {
      if (err) {
        console.error('Error retrieving messages:', err);
        setResponseStatus(event, 500);
        resolve([]);
      } else {
        resolve(messages);
      }
    });
  });
});
