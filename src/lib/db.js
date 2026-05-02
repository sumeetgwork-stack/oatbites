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
    gender: userData.gender || 'Not Specified',
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
  const result = await orders.find({ userEmail: email }).sort({ createdAt: -1 }).toArray();
  return result.map(order => ({
    ...order,
    id: order.id || order._id.toString()
  }));
}

export async function getAllOrders() {
  const orders = await getCollection('orders');
  const result = await orders.find({}).sort({ createdAt: -1 }).toArray();
  return result.map(order => ({
    ...order,
    id: order.id || order._id.toString()
  }));
}

export async function updateOrderStatus(orderId, status) {
  const orders = await getCollection('orders');
  const update = { status };
  if (status === 'Paid') {
    update.paidAt = new Date().toISOString();
  }
  
  // Try finding by custom string ID (id) or MongoDB _id
  let query = { id: orderId };
  try { query = { $or: [{ id: orderId }, { _id: new ObjectId(orderId) }] }; } catch(e) {}

  const result = await orders.findOneAndUpdate(
    query,
    { $set: update },
    { returnDocument: 'after' }
  );
  return result;
}

export async function updateOrderPayment(orderId, paymentData) {
  const orders = await getCollection('orders');
  
  let query = { id: orderId };
  try { query = { $or: [{ id: orderId }, { _id: new ObjectId(orderId) }] }; } catch(e) {}
  
  // Find the order first to get the items
  const order = await orders.findOne(query);
  if (!order) return null;

  const update = {
    status: 'Paid',
    paidAt: new Date().toISOString(),
    razorpayPaymentId: paymentData.razorpay_payment_id,
    razorpayOrderId: paymentData.razorpay_order_id,
    razorpaySignature: paymentData.razorpay_signature,
  };
  
  const result = await orders.findOneAndUpdate(
    query,
    { $set: update },
    { returnDocument: 'after' }
  );

  // Reduce stock for each item in the order
  if (result && order.items && order.items.length > 0) {
    const products = await getCollection('products');
    for (const item of order.items) {
      await products.updateOne(
        { $or: [{ id: item.id }, { _id: item.id }] },
        { $inc: { stock: -item.quantity } }
      );
    }
  }

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

export async function updateUserProfile(email, updates) {
  const users = await getCollection('users');
  const allowedUpdates = {};
  if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;
  if (updates.address !== undefined) allowedUpdates.address = updates.address;
  if (updates.name !== undefined) allowedUpdates.name = updates.name;
  if (updates.gender !== undefined) allowedUpdates.gender = updates.gender;
  if (updates.addresses !== undefined) allowedUpdates.addresses = updates.addresses;
  
  const result = await users.findOneAndUpdate(
    { email },
    { $set: allowedUpdates },
    { returnDocument: 'after' }
  );
  return result;
}

// Analytics helpers
export async function logPageView(path, sessionId, email = null) {
  const views = await getCollection('page_views');
  const view = {
    path,
    sessionId,
    email,
    timestamp: new Date().toISOString()
  };
  await views.insertOne(view);
  return view;
}

export async function getAnalyticsStats() {
  const views = await getCollection('page_views');
  const totalViews = await views.countDocuments();
  
  // Calculate unique sessions
  const uniqueSessions = await views.aggregate([
    { $group: { _id: "$sessionId" } },
    { $count: "total" }
  ]).toArray();
  const uniqueVisitors = uniqueSessions.length > 0 ? uniqueSessions[0].total : 0;
  
  // Get views over last 7 days for the graph
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyViews = await views.aggregate([
    { $match: { timestamp: { $gte: sevenDaysAgo.toISOString() } } },
    {
      $project: {
        date: { $substr: ["$timestamp", 5, 5] } // MM-DD
      }
    },
    { $group: { _id: "$date", views: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]).toArray();

  // Get unique visitors distribution by Gender
  const stats = await views.aggregate([
    { $match: { email: { $ne: null } } },
    { $group: { _id: "$email" } },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "email",
        as: "user"
      }
    },
    { $unwind: "$user" },
    { $group: { _id: "$user.gender", count: { $sum: 1 } } }
  ]).toArray();

  // Ensure we always have Men and Women in the result for the chart legend
  const distributionMap = { 'Men': 0, 'Women': 0 };
  stats.forEach(s => {
    if (s._id === 'Men' || s._id === 'Women') {
      distributionMap[s._id] = s.count;
    }
  });

  const finalDistribution = [
    { _id: 'Men', count: distributionMap['Men'] },
    { _id: 'Women', count: distributionMap['Women'] }
  ];

  return { totalViews, uniqueVisitors, dailyViews, visitorDistribution: finalDistribution };
}

// Legacy helpers (can be removed later)
export function readJSON(filename) { return []; }
export function writeJSON(filename, data) { return true; }
