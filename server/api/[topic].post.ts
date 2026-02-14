import { saveMessage } from '../utils/database';

export default defineEventHandler(async (event) => {
  const topic = getRouterParam(event, 'topic');
  const body = await readRawBody(event);
  const message = body.toString();

  console.log(`[${new Date().toISOString()}] Publishing to topic "${topic}": ${message}`);

  return new Promise((resolve, reject) => {
    saveMessage(topic, message, (err, savedMessage) => {
      if (err) {
        console.error('Error saving message to database:', err);
        setResponseStatus(event, 500);
        reject('Internal Server Error');
      } else {
        console.log('Message saved successfully');
        resolve('OK');
      }
    });
  });
});
