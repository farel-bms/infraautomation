const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const client   = new SQSClient({ region: process.env.AWS_REGION || "us-east-1" });
const QUEUE_URL = process.env.SQS_QUEUE_URL;

/**
 * Publish a structured event to the SQS queue.
 * Silently skips if SQS_QUEUE_URL is not configured (e.g. local dev).
 */
async function publishEvent(eventType, payload) {
  if (!QUEUE_URL) return;

  const message = {
    eventType,
    payload,
    timestamp: new Date().toISOString(),
    source:    "lks-api",
  };

  await client.send(new SendMessageCommand({
    QueueUrl:    QUEUE_URL,
    MessageBody: JSON.stringify(message),
    MessageAttributes: {
      EventType: { DataType: "String", StringValue: eventType },
    },
  }));

  console.log(`SQS event published: ${eventType}`);
}

module.exports = { publishEvent };
