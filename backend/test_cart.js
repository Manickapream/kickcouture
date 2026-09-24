const jwt = require("jsonwebtoken");
const http = require("http");

const secret = "super_secret_kickcouture_key_123";
const token = jwt.sign({ id: "60c72b2f9b1d8b001c8e4e9f", role: "user" }, secret);

const data = JSON.stringify({
  email: "test@example.com",
  productId: "6ab3fb8f7808d3355c3f8c15",
  status: "cart"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/order/add',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${responseData}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
