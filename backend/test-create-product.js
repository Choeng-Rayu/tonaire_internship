const http = require('http');
const { URLSearchParams } = require('url');

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;

function makeRequest(method, path, data = null, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': contentType,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      if (contentType === 'application/x-www-form-urlencoded') {
        req.write(data.toString());
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function testCreateProduct() {
  try {
    console.log('Testing Product Creation...\n');

    // 1. Sign up
    console.log('1. Signing up...');
    const email = `testuser-${Date.now()}@test.com`;
    const signupRes = await makeRequest('POST', '/auth/signup', {
      name: 'Test User',
      email: email,
      password: 'Password123!',
    });
    console.log(`Status: ${signupRes.status}`);
    if (signupRes.status === 201) {
      console.log('✅ Signup successful');
    } else {
      console.log('❌ Signup failed:', signupRes.data);
      return;
    }

    // 2. Sign in
    console.log('\n2. Signing in...');
    const signinRes = await makeRequest('POST', '/auth/signin', {
      email: email,
      password: 'Password123!',
    });
    console.log(`Status: ${signinRes.status}`);
    authToken = signinRes.data?.data?.token;
    if (authToken) {
      console.log('✅ Signin successful, token received');
    } else {
      console.log('❌ Signin failed:', signinRes.data);
      return;
    }

    // 3. Create product with form data
    console.log('\n3. Creating product...');
    const formData = new URLSearchParams({
      name: 'Test Book Product',
      description: 'This is a test book',
      category_id: '1',
      price: '29.99',
    });

    const createRes = await makeRequest('POST', '/products', formData, 'application/x-www-form-urlencoded');
    console.log(`Status: ${createRes.status}`);
    console.log('Response:', JSON.stringify(createRes.data, null, 2));

    if (createRes.status === 201) {
      console.log('✅ Product created successfully!');
      
      // 4. Check if product appears in list
      console.log('\n4. Fetching all products...');
      const allRes = await makeRequest('GET', '/products');
      console.log(`Total products: ${allRes.data?.data?.total}`);
      console.log('Products:', allRes.data?.data?.data);

      // 5. Filter by category
      if (allRes.data?.data?.total > 0) {
        console.log('\n5. Filtering by category_id=1...');
        const filterRes = await makeRequest('GET', '/products?category_id=1');
        console.log(`Filtered products: ${filterRes.data?.data?.total}`);
        console.log('Filtered:', filterRes.data?.data?.data);
      }
    } else {
      console.log('❌ Product creation failed');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

console.log('Waiting for backend to be available...');
setTimeout(testCreateProduct, 2000);
