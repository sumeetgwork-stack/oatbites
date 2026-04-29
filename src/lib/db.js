import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

// Helper to get collection
async function getCollection(collectionName) {
  const client = await clientPromise;
  const db = client.db();
  return db.collection(collectionName);
}

// User helpers
export async function findUserByEmail(email) {
  const users = await getCollection('users');
  return await users.findOne({ email });
}

export async function createUser(userData) {
  const users = await getCollection('users');
  const newUser = {
    name: userData.name,
    email: userData.email,
    image: userData.image || null,
    password: userData.password || null,
    role: userData.email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };
  const result = await users.insertOne(newUser);
  return { ...newUser, _id: result.insertedId };
}

// Order helpers
export async function createOrder(orderData) {
  const orders = await getCollection('orders');
  const newOrder = {
    ...orderData,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  const result = await orders.insertOne(newOrder);
  return { ...newOrder, _id: result.insertedId };
}

export async function getOrdersByUserId(email) {
  const orders = await getCollection('orders');
  return await orders.find({ userEmail: email }).sort({ createdAt: -1 }).toArray();
}

export async function getAllOrders() {
  const orders = await getCollection('orders');
  return await orders.find({}).sort({ createdAt: -1 }).toArray();
}

export async function updateOrderStatus(orderId, status) {
  const orders = await getCollection('orders');
  const update = { status };
  if (status === 'Paid') {
    update.paidAt = new Date().toISOString();
  }
  
  // Try finding by custom string ID (id) or MongoDB _id
  const result = await orders.findOneAndUpdate(
    { $or: [{ id: orderId }, { _id: orderId }] },
    { $set: update },
    { returnDocument: 'after' }
  );
  return result;
}

export async function updateOrderPayment(orderId, paymentData) {
  const orders = await getCollection('orders');
  const update = {
    status: 'Paid',
    paidAt: new Date().toISOString(),
    razorpayPaymentId: paymentData.razorpay_payment_id,
    razorpayOrderId: paymentData.razorpay_order_id,
    razorpaySignature: paymentData.razorpay_signature,
  };
  
  const result = await orders.findOneAndUpdate(
    { $or: [{ id: orderId }, { _id: orderId }] },
    { $set: update },
    { returnDocument: 'after' }
  );
  return result;
}

// Product helpers
export async function getAllProducts() {
  const products = await getCollection('products');
  return await products.find({}).toArray();
}

export async function getProductById(id) {
  const products = await getCollection('products');
  return await products.findOne({ $or: [{ id: id }, { _id: id }] });
}

export async function addProduct(productData) {
  const products = await getCollection('products');
  const newProduct = {
    ...productData,
    id: `p-${Date.now()}`,
  };
  const result = await products.insertOne(newProduct);
  return { ...newProduct, _id: result.insertedId };
}

export async function updateProduct(id, updates) {
  const products = await getCollection('products');
  const result = await products.findOneAndUpdate(
    { $or: [{ id: id }, { _id: id }] },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result;
}

export async function deleteProduct(id) {
  const products = await getCollection('products');
  await products.deleteOne({ $or: [{ id: id }, { _id: id }] });
  return true;
}

export async function getAllUsers() {
  const users = await getCollection('users');
  return await users.find({}).toArray();
}

// Legacy helpers (can be removed later)
export function readJSON(filename) { return []; }
export function writeJSON(filename, data) { return true; }
