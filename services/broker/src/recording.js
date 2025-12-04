const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function startRecording(sessionId) {
  const recordingId = uuidv4();
  const recordingStream = `s3://recordings/${recordingId}/stream.mp4`;
  
  // Initialize recording metadata
  await s3.putObject({
    Bucket: process.env.S3_BUCKET,
    Key: `recordings/${recordingId}/metadata.json`,
    Body: JSON.stringify({
      sessionId,
      startedAt: new Date().toISOString(),
      status: 'recording'
    })
  }).promise();
  
  return recordingId;
}

async function saveFrame(sessionId, frameData, timestamp) {
  const recordingId = `rec-${sessionId}-${Date.now()}`;
  
  await s3.putObject({
    Bucket: process.env.S3_BUCKET,
    Key: `recordings/${sessionId}/${recordingId}.jpg`,
    Body: frameData,
    ContentType: 'image/jpeg',
    Metadata: {
      timestamp: timestamp.toISOString()
    }
  }).promise();
}

module.exports = { startRecording, saveFrame };
