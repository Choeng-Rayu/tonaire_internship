const http = require('http');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;

function makeRequest(method, path, data = null, isMultipart = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': isMultipart ? 'application/x-www-form-urlencoded' : 'application/json',
      },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      if (isMultipart) {
        const params = new URLSearchParams(data);
        req.write(params.toString());
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function testProductFiltering() {
  try {
    console.log('Starting product filtering test...\n');

    // 1. Sign up
    console.log('1. Signing up test user...');
    const signupResponse = await makeRequest('POST', '/auth/signup', {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'Password123!',
    });
    console.log('Signup response:', signupResponse.status, signupResponse.data?.message);

    if (signupResponse.status !== 201) {
      throw new Error('Signup failed');
    }

    // 2. Sign in
    console.log('\n2. Signing in...');
    const email = signupResponse.data?.data?.email;
    const signinResponse = await makeRequest('POST', '/auth/signin', {
      email,
      password: 'Password123!',
    });
    console.log('Signin response:', signinResponse.status);
    authToken = signinResponse.data?.data?.token;
    console.log('Token received:', authToken ? 'Yes' : 'No');

    if (!authToken) {
      throw new Error('Failed to get auth token');
    }

    // 3. Create a product
    console.log('\n3. Creating a product...');
    const productData = {
      name: 'Test Book',
      description: 'A test book product',
      category_id: '1', // Using the existing 'book' category
      price: '99.99',
    };
    const createResponse = await makeRequest('POST', '/products', productData, true);
    console.log('Create product response:', createResponse.status);
    console.log('Response data:', createResponse.data);

    if (createResponse.status === 201) {
      const productId = createResponse.data?.data?.id;
      console.log('Product created with ID:', productId);

      // 4. List all products
      console.log('\n4. Getting all products (no filter)...');
      const allResponse = await makeRequest('GET', '/products');
      console.log('All products count:', allResponse.data?.data?.total);
      console.log('Products:', allResponse.data?.data?.data?.map(p => ({ id: p.id, name: p.name, category_id: p.category_id })));

      // 5. Filter by category_id = 1
      console.log('\n5. Filtering products by category_id=1...');
      const filterResponse = await makeRequest('GET', '/products?category_id=1');
      console.log('Filtered products count:', filterResponse.data?.data?.total);
      console.log('Filtered products:', filterResponse.data?.data?.data?.map(p => ({ id: p.id, name: p.name, category_id: p.category_id })));
    } else {
      console.log('Failed to create product. Response:', createResponse.data);
    }

    console.log('\nTest complete!');
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Wait for server to start
setTimeout(testProductFiltering, 3000);
