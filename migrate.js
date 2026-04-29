const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Error: MONGODB_URI not found in .env');
  process.exit(1);
}

const dataDir = path.join(process.cwd(), 'src', 'data');

async function migrate() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    const db = client.db();

    // Migrate Products
    const productsPath = path.join(dataDir, 'products.json');
    if (fs.existsSync(productsPath)) {
      const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      if (products.length > 0) {
        await db.collection('products').deleteMany({});
        await db.collection('products').insertMany(products);
        console.log(`Migrated ${products.length} products`);
      }
    }

    // Migrate Users
    const usersPath = path.join(dataDir, 'users.json');
    if (fs.existsSync(usersPath)) {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      if (users.length > 0) {
        await db.collection('users').deleteMany({});
        await db.collection('users').insertMany(users);
        console.log(`Migrated ${users.length} users`);
      }
    }

    // Migrate Orders
    const ordersPath = path.join(dataDir, 'orders.json');
    if (fs.existsSync(ordersPath)) {
      const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
      if (orders.length > 0) {
        await db.collection('orders').deleteMany({});
        await db.collection('orders').insertMany(orders);
        console.log(`Migrated ${orders.length} orders`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrate();
