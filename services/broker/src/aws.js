const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

function uploadRecording(bucket, key, body) {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: 'video/mp4',
  };
  return s3.upload(params).promise();
}

module.exports = { uploadRecording };
