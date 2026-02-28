#!/usr/bin/env node
/**
 * Comprehensive API Test Script
 * Tests all endpoints including Google login, Khmer text, product management,
 * activity logging, and edge cases.
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000/api';
let TOKEN = '';
let testUserId = 0;
let categoryId = 0;
let productId = 0;
let passed = 0;
let failed = 0;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
      },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function test(name, fn) {
  return fn()
    .then((result) => {
      if (result) {
        console.log(`  ✅ ${name}`);
        passed++;
      } else {
        console.log(`  ❌ ${name}`);
        failed++;
      }
    })
    .catch((err) => {
      console.log(`  ❌ ${name} - Error: ${err.message}`);
      failed++;
    });
}

async function runTests() {
  console.log('\n🧪 ===== COMPREHENSIVE API TESTS =====\n');

  // ──────────────────────────────────────────────────────
  console.log('📋 1. HEALTH CHECK');
  // ──────────────────────────────────────────────────────
  await test('Health endpoint returns ok', async () => {
    const res = await request('GET', `${BASE_URL}/health`);
    return res.status === 200 && res.body.status === 'ok';
  });

  // ──────────────────────────────────────────────────────
  console.log('\n📋 2. AUTH - SIGNUP');
  // ──────────────────────────────────────────────────────
  await test('Signup with valid data', async () => {
    const res = await request('POST', `${BASE_URL}/auth/signup`, {
      name: 'Test User',
      email: 'testuser_api@test.com',
      password: 'Test1234',
    });
    return res.status === 201 && res.body.success === true;
  });

  await test('Signup with duplicate email returns 409', async () => {
    const res = await request('POST', `${BASE_URL}/auth/signup`, {
      name: 'Test User 2',
      email: 'testuser_api@test.com',
      password: 'Test1234',
    });
    return res.status === 409;
  });

  await test('Signup with invalid email returns 422', async () => {
    const res = await request('POST', `${BASE_URL}/auth/signup`, {
      name: 'Test',
      email: 'invalid-email',
      password: 'Test1234',
    });
    return res.status === 422;
  });

  await test('Signup with weak password returns 422', async () => {
    const res = await request('POST', `${BASE_URL}/auth/signup`, {
      name: 'Test',
      email: 'new@test.com',
      password: 'weak',
    });
    return res.status === 422;
  });

  await test('Signup with Khmer name', async () => {
    const res = await request('POST', `${BASE_URL}/auth/signup`, {
      name: 'សុខ សាន្ត',
      email: 'khmer_user@test.com',
      password: 'Test1234',
    });
    return (
      res.status === 201 &&
      res.body.data.name === 'សុខ សាន្ត'
    );
  });

  // ──────────────────────────────────────────────────────
  console.log('\n📋 3. AUTH - LOGIN');
  // ──────────────────────────────────────────────────────
  await test('Login with valid credentials', async () => {
    const res = await request('POST', `${BASE_URL}/auth/login`, {
      email: 'testuser_api@test.com',
      password: 'Test1234',
    });
    if (res.status === 200 && res.body.data?.token) {
      TOKEN = res.body.data.token;
      testUserId = res.body.data.user.id;
      return true;
    }
    return false;
  });

  await test('Login with wrong password returns 401', async () => {
    const res = await request('POST', `${BASE_URL}/auth/login`, {
      email: 'testuser_api@test.com',
      password: 'WrongPass1',
    });
    return res.status === 401;
  });

  await test('Login with non-existent email returns 401', async () => {
    const res = await request('POST', `${BASE_URL}/auth/login`, {
      email: 'nonexistent@test.com',
      password: 'Test1234',
    });
    return res.status === 401;
  });

  await test('Login response includes auth_provider', async () => {
    const res = await request('POST', `${BASE_URL}/auth/login`, {
      email: 'testuser_api@test.com',
      password: 'Test1234',
    });
    return res.body.data?.user?.auth_provider === 'local';
  });

  // ──────────────────────────────────────────────────────
  console.log('\n📋 4. GOOGLE AUTH');
  // ──────────────────────────────────────────────────────
  await test('Google login with new user creates account', async () => {
    const res = await request('POST', `${BASE_URL}/auth/google`, {
      google_id: 'google-test-id-12345',
      email: 'googleuser@gmail.com',
      name: 'Google Test User',
    });
    return res.status === 200 && res.body.data?.token && res.body.data?.user?.auth_provider === 'google';
  });

  await test('Google login with existing Google user returns token', async () => {
    const res = await request('POST', `${BASE_URL}/auth/google`, {
      google_id: 'google-test-id-12345',
      email: 'googleuser@gmail.com',
      name: 'Google Test User',
    });
    return res.status === 200 && res.body.data?.token;
  });

  await test('Google login links to existing email account', async () => {
    const res = await request('POST', `${BASE_URL}/auth/google`, {
      google_id: 'google-link-id-67890',
      email: 'testuser_api@test.com',
      name: 'Test User',
    });
    return res.status === 200 && res.body.data?.token;
  });

  await test('Google login with missing fields returns 422', async () => {
    const res = await request('POST', `${BASE_URL}/auth/google`, {
      google_id: 'some-id',
    });
    return res.status === 422;
  });

  await test('Google login with Khmer name', async () => {
    const res = await request('POST', `${BASE_URL}/auth/google`, {
      google_id: 'google-khmer-id-99999',
      email: 'khmer_google@gmail.com',
      name: 'បូរាណ វិបុល',
    });
    return (
      res.status === 200 &&
      res.body.data?.user?.name === 'បូរាណ វិបុល'
    );
  });

  // ──────────────────────────────────────────────────────
  console.log('\n📋 5. CATEGORIES (Authenticated)');
  // ──────────────────────────────────────────────────────
  await test('Create category (English)', async () => {
    const res = await request(
      'POST',
      `${BASE_URL}/categories`,
      { name: 'Electronics', description: 'Electronic devices' },
      TOKEN
    );
    if (res.status === 201) {
      categoryId = res.body.data.id;
      return true;
    }
    return false;
  });

  await test('Create category (Khmer)', async () => {
    const res = await request(
      'POST',
      `${BASE_URL}/categories`,
      { name: 'អេឡិចត្រូនិច', description: 'ផលិតផលអេឡិចត្រូនិច' },
      TOKEN
    );
    return (
      res.status === 201 &&
      res.body.data.name === 'អេឡិចត្រូនិច' &&
      res.body.data.description === 'ផលិតផលអេឡិចត្រូនិច'
    );
  });

  await test('List all categories', async () => {
    const res = await request('GET', `${BASE_URL}/categories`, null, TOKEN);
    return res.status === 200 && Array.isArray(res.body.data);
  });

  await test('Get category by ID', async () => {
    const res = await request('GET', `${BASE_URL}/categories/${categoryId}`, null, TOKEN);
    return res.status === 200 && res.body.data.id === categoryId;
  });

  await test('Search categories with Khmer text', async () => {
    const res = await request('GET', `${BASE_URL}/categories?search=អេឡិចត្រូនិច`, null, TOKEN);
    return res.status === 200 && res.body.data.length > 0;
  });

  await test('Update category', async () => {
    const res = await request(
      'PUT',
      `${BASE_URL}/categories/${categoryId}`,
      { name: 'Updated Electronics', description: 'Updated desc' },
      TOKEN
    );
    return res.status === 200 && res.body.data.name === 'Updated Electronics';
  });

  await test('Category without auth returns 401', async () => {
    const res = await request('GET', `${BASE_URL}/categories`);
    return res.status === 401;
  });

  // ──────────────────────────────────────────────────────
  console.log('\n📋 6. PRODUCTS (Authenticated)');
  // ──────────────────────────────────────────────────────
  await test('List products (empty or existing)', async () => {
    const res = await request('GET', `${BASE_URL}/products`, null, TOKEN);
    return res.status === 200 && res.body.data?.data !== undefined;
  });

  await test('Product without auth returns 401', async () => {
    const res = await request('GET', `${BASE_URL}/products`);
    return res.status === 401;
  });

  await test('Get non-existent product returns 404', async () => {
    const res = await request('GET', `${BASE_URL}/products/99999`, null, TOKEN);
    return res.status === 404;
  });

  await test('Products with search filter', async () => {
    const res = await request('GET', `${BASE_URL}/products?search=test`, null, TOKEN);
    return res.status === 200;
  });

  await test('Products with category filter', async () => {
    const res = await request('GET', `${BASE_URL}/products?category_id=${categoryId}`, null, TOKEN);
    return res.status === 200;
  });

  await test('Products with sort', async () => {
    const res = await request('GET', `${BASE_URL}/products?sort_by=price&sort_order=desc`, null, TOKEN);
    return res.status === 200;
  });

  await test('Products with pagination', async () => {
    const res = await request('GET', `${BASE_URL}/products?page=1&limit=5`, null, TOKEN);
    return res.status === 200 && res.body.data?.page === 1 && res.body.data?.limit === 5;
  });

  // ──────────────────────────────────────────────────────
  console.log('\n📋 7. ACTIVITY LOGS');
  // ──────────────────────────────────────────────────────
  await test('Get activity logs', async () => {
    const res = await request('GET', `${BASE_URL}/activity/logs`, null, TOKEN);
    return res.status === 200 && Array.isArray(res.body.data);
  });

  await test('Activity logs contain recent requests', async () => {
    const res = await request('GET', `${BASE_URL}/activity/logs?limit=5`, null, TOKEN);
    return res.status === 200 && res.body.data.length > 0;
  });

  await test('Activity logs filter by method', async () => {
    const res = await request('GET', `${BASE_URL}/activity/logs?method=POST`, null, TOKEN);
    return res.status === 200;
  });

  await test('Get activity summary', async () => {
    const res = await request('GET', `${BASE_URL}/activity/summary`, null, TOKEN);
    return (
      res.status === 200 &&
      res.body.data?.total_requests !== undefined
    );
  });

  await test('Activity logs without auth returns 401', async () => {
    const res = await request('GET', `${BASE_URL}/activity/logs`);
    return res.status === 401;
  });

  // ──────────────────────────────────────────────────────
  console.log('\n📋 8. KHMER TEXT SUPPORT');
  // ──────────────────────────────────────────────────────
  await test('Khmer text in user name preserved after login', async () => {
    const res = await request('POST', `${BASE_URL}/auth/login`, {
      email: 'khmer_user@test.com',
      password: 'Test1234',
    });
    return (
      res.status === 200 &&
      res.body.data?.user?.name === 'សុខ សាន្ត'
    );
  });

  await test('Khmer text in category search works', async () => {
    const res = await request('GET', `${BASE_URL}/categories?search=ផលិតផល`, null, TOKEN);
    return res.status === 200;
  });

  // ──────────────────────────────────────────────────────
  console.log('\n📋 9. EDGE CASES');
  // ──────────────────────────────────────────────────────
  await test('Invalid JWT token returns 401', async () => {
    const res = await request('GET', `${BASE_URL}/categories`, null, 'invalid-token');
    return res.status === 401;
  });

  await test('Invalid product ID returns 400', async () => {
    const res = await request('GET', `${BASE_URL}/products/abc`, null, TOKEN);
    return res.status === 400;
  });

  await test('Invalid category ID returns 400', async () => {
    const res = await request('GET', `${BASE_URL}/categories/abc`, null, TOKEN);
    return res.status === 400;
  });

  // ──────────────────────────────────────────────────────
  console.log('\n📋 10. CLEANUP');
  // ──────────────────────────────────────────────────────
  await test('Delete category', async () => {
    const res = await request('DELETE', `${BASE_URL}/categories/${categoryId}`, null, TOKEN);
    return res.status === 200;
  });

  await test('Deleted category returns 404', async () => {
    const res = await request('GET', `${BASE_URL}/categories/${categoryId}`, null, TOKEN);
    return res.status === 404;
  });

  // ──────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log(`🧪 Test Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('='.repeat(50));

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Review the output above.\n');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
