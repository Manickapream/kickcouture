require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const axios = require('axios');
const Vendor = require('./backend/models/Vendor');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const timestamp = Date.now();
    const email = `testvendor_${timestamp}@example.com`;
    const password = 'password123';

    console.log('Registering vendor...');
    await axios.post('http://localhost:5000/api/vendor/register', {
      ownerName: 'Test Owner',
      businessName: 'Test Business',
      email: email,
      phone: '1234567890',
      address: '123 Test St',
      password: password,
      confirmPassword: password
    });

    console.log('Approving vendor in DB...');
    await Vendor.updateOne({ email }, { status: 'approved' });

    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/vendor/login', {
      email, password
    });
    const token = loginRes.data.token;
    console.log('Token received');

    console.log('Updating profile...');
    const updateRes = await axios.put('http://localhost:5000/api/vendor/profile', {
      ownerName: 'Test Owner Updated',
      phone: '0987654321',
      address: '321 Test St',
      businessDescription: 'A nice test business'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Profile updated!', updateRes.data);

    // Now test with businessDescription as empty string
    console.log('Updating with empty description...');
    const updateEmptyRes = await axios.put('http://localhost:5000/api/vendor/profile', {
      ownerName: 'Test Owner Updated',
      phone: '0987654321',
      address: '321 Test St',
      businessDescription: ''
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Profile updated empty!', updateEmptyRes.data);

    // Now test with missing fields
    console.log('Updating with missing optional fields...');
    const updateMissingRes = await axios.put('http://localhost:5000/api/vendor/profile', {
      ownerName: 'Test Owner Updated'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Profile updated missing!', updateMissingRes.data);

  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
  } finally {
    mongoose.disconnect();
  }
}

test();
