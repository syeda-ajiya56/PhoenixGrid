const http = require('http');

const data = JSON.stringify({
  id: 'TEST-AUTO-123',
  type: 'medical',
  severity: 'HIGH',
  location: 'Test Location',
  phone: '123456',
  description: 'Testing the API directly',
  status: 'pending',
  submittedBy: 'TestUser',
  lat: 24.86,
  lon: 67.01
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/sos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
