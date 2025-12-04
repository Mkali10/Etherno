const http = require('http');

const options = {
  host: 'localhost',
  port: 8080,
  timeout: 2000,
  path: '/health'
};

http.request(options, (res) => {
  console.log(`HEALTHCHECK: Server responded ${res.statusCode}`);
  process.exit(res.statusCode === 200 ? 0 : 1);
}).on('error', () => {
  console.log('HEALTHCHECK: Server not responding');
  process.exit(1);
}).end();
