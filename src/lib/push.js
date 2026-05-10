import webpush from 'web-push';
import { getCollection } from './db';

let configured = false;

function configureWebPush() {
  if (configured) return;
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('[Push] VAPID keys not set, push notifications disabled');
    return;
  }
  webpush.setVapidDetails(
    'mailto:oatbitesbysej@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  configured = true;
}

// Save a push subscription for a user
export async function savePushSubscription(userEmail, subscription) {
  const subs = await getCollection('push_subscriptions');
  // Upsert by endpoint
  await subs.updateOne(
    { endpoint: subscription.endpoint },
    { $set: { userEmail, subscription, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
  return true;
}

// Remove a push subscription
export async function removePushSubscription(endpoint) {
  const subs = await getCollection('push_subscriptions');
  await subs.deleteOne({ endpoint });
  return true;
}

// Get all push subscriptions for a user
export async function getUserPushSubscriptions(userEmail) {
  const subs = await getCollection('push_subscriptions');
  return await subs.find({ userEmail }).toArray();
}

// Send push notification to a specific user
export async function sendPushToUser(userEmail, payload) {
  configureWebPush();
  if (!configured) return;

  const subscriptions = await getUserPushSubscriptions(userEmail);
  if (subscriptions.length === 0) return;

  const message = JSON.stringify(payload);

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub.subscription, message);
      console.log(`[Push] Sent to ${userEmail}`);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired, remove it
        await removePushSubscription(sub.endpoint);
        console.log(`[Push] Removed expired subscription for ${userEmail}`);
      } else {
        console.error(`[Push] Failed to send to ${userEmail}:`, err.message);
      }
    }
  }
}

// Send push to multiple users
export async function sendPushToUsers(emails, payload) {
  for (const email of emails) {
    await sendPushToUser(email, payload);
  }
}

// ==========================================
// PUSH NOTIFICATION PAYLOADS
// ==========================================

export function orderConfirmationPush(order) {
  return {
    title: '✅ Order Confirmed!',
    body: `Order #${(order.id || order._id)?.toString().slice(-8)} — ₹${order.total?.toLocaleString('en-IN')}. We're preparing your items!`,
    url: '/dashboard',
    tag: 'order-confirmed',
  };
}

export function shippingUpdatePush(order, status) {
  const messages = {
    Processing: {
      title: '⚙️ Order Processing',
      body: `Your order #${(order.id || order._id)?.toString().slice(-8)} is being prepared.`,
    },
    Shipped: {
      title: '🚚 Order Shipped!',
      body: `Your order #${(order.id || order._id)?.toString().slice(-8)} is on its way!`,
    },
    Delivered: {
      title: '🎉 Order Delivered!',
      body: `Your order #${(order.id || order._id)?.toString().slice(-8)} has been delivered. Enjoy!`,
    },
  };

  const msg = messages[status] || { title: 'Order Update', body: `Status: ${status}` };
  return {
    ...msg,
    url: '/dashboard',
    tag: `order-${status.toLowerCase()}`,
  };
}

export function backInStockPush(product) {
  return {
    title: '🔔 Back in Stock!',
    body: `${product.name} is available again — ₹${product.price?.toLocaleString('en-IN')}. Grab it before it's gone!`,
    url: `/products/${product.id}`,
    tag: `restock-${product.id}`,
  };
}
