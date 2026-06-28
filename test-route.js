require('dotenv').config({ path: '.env.local' });
const { POST } = require('./src/app/api/orders/create/route.js');

(async () => {
  try {
    const req = {
      json: async () => ({
        items: [{ id: '1', name: 'Test', price: 100, quantity: 1 }],
        total: 100,
        shippingAddress: { fullName: 'Test', phone: '1234567890', street: 'Test St', city: 'Test', state: 'Test', pincode: '123456' },
        paymentMethod: 'COD'
      })
    };
    
    // Mock auth
    jest.mock('@/auth', () => ({
      auth: async () => ({ user: { email: 'test@example.com', name: 'Test User' } })
    }));

    const res = await POST(req);
    console.log(await res.json());
  } catch (err) {
    console.error('Script Error:', err);
  }
})();
