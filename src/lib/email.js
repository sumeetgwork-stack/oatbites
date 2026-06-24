import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

function orderItemsHtml(items) {
  return items.map(item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">
        <strong>${item.name}</strong>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; text-align: right;">
        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');
}

function baseTemplate(title, bodyContent) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin: 0; padding: 0; background: #f1f3f6; font-family: 'Segoe UI', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #2c1810 0%, #4a2c20 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #d4a574; margin: 0; font-size: 28px; letter-spacing: 2px;">OATBITES <span style="color: #fff; font-weight: 300;">BY SEJ</span></h1>
        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px;">Premium Oat-Based Products</p>
      </div>
      
      <!-- Body -->
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h2 style="color: #2c1810; margin: 0 0 24px; font-size: 22px;">${title}</h2>
        ${bodyContent}
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 24px; color: #888; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} Oatbites by SEJ. All rights reserved.</p>
        <p style="margin: 4px 0 0;">Crafted with ❤️ for your health</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export async function sendOrderConfirmationEmail(order) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log('[Email] Gmail credentials not set, skipping email');
    return null;
  }

  const shippingHtml = order.shippingAddress ? `
    <div style="background: #faf7f4; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Shipping to:</p>
      <p style="margin: 0; font-weight: 600; color: #2c1810;">${order.shippingAddress.fullName}</p>
      <p style="margin: 4px 0 0; color: #555; font-size: 13px;">${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
      <p style="margin: 4px 0 0; color: #555; font-size: 13px;">📞 ${order.shippingAddress.phone}</p>
    </div>
  ` : '';

  const bodyContent = `
    <p style="color: #555; line-height: 1.6;">
      Thank you for your order! We've received your payment and are preparing your items with care.
    </p>
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #166534; font-weight: 600;">✅ Payment Successful</p>
      <p style="margin: 4px 0 0; color: #166534; font-size: 13px;">Order ID: <strong>#${(order.id || order._id)?.toString().slice(-8)}</strong></p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #faf7f4;">
          <th style="padding: 12px 16px; text-align: left; font-size: 13px; color: #888;">Item</th>
          <th style="padding: 12px 16px; text-align: center; font-size: 13px; color: #888;">Qty</th>
          <th style="padding: 12px 16px; text-align: right; font-size: 13px; color: #888;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml(order.items || [])}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 16px 16px 8px; text-align: right; color: #555;">Subtotal:</td>
          <td style="padding: 16px 16px 8px; text-align: right; color: #555;">₹${(order.total - 30)?.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 8px 16px 16px; text-align: right; color: #555;">Shipping:</td>
          <td style="padding: 8px 16px 16px; text-align: right; color: #555;">₹30</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 16px; text-align: right; font-weight: 600; color: #2c1810; border-top: 2px solid #f0f0f0;">Total:</td>
          <td style="padding: 16px; text-align: right; font-weight: 800; font-size: 18px; color: #2c1810; border-top: 2px solid #f0f0f0;">₹${order.total?.toLocaleString('en-IN')}</td>
        </tr>
      </tfoot>
    </table>

    ${shippingHtml}

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://oatbites.in/dashboard" 
         style="background: #2c1810; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Track Your Order →
      </a>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: `"Oatbites by SEJ" <${process.env.GMAIL_USER}>`,
      to: order.userEmail,
      subject: `Order Confirmed! #${(order.id || order._id)?.toString().slice(-8)} — Oatbites by SEJ`,
      html: baseTemplate('Order Confirmed! 🎉', bodyContent),
    });

    console.log('[Email] Order confirmation sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('[Email] Error sending order confirmation:', err);
    return null;
  }
}

export async function sendShippingUpdateEmail(order, newStatus) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log('[Email] Gmail credentials not set, skipping email');
    return null;
  }

  const statusConfig = {
    Shipped: {
      emoji: '🚚',
      title: 'Your Order Has Been Shipped!',
      message: 'Great news! Your order is on its way. You can expect delivery within 3-5 business days.',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
    },
    Delivered: {
      emoji: '🎉',
      title: 'Your Order Has Been Delivered!',
      message: 'Your order has been successfully delivered. We hope you enjoy your Oatbites products!',
      color: '#16a34a',
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
    },
    Processing: {
      emoji: '⚙️',
      title: 'Your Order is Being Processed',
      message: 'We are preparing your order. It will be shipped shortly.',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      borderColor: '#fde68a',
    },
  };

  const config = statusConfig[newStatus];
  if (!config) return null;

  const bodyContent = `
    <div style="background: ${config.bgColor}; border: 1px solid ${config.borderColor}; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">${config.emoji}</div>
      <p style="margin: 0; color: ${config.color}; font-weight: 600; font-size: 16px;">${config.title}</p>
    </div>

    <p style="color: #555; line-height: 1.6;">${config.message}</p>
    
    <div style="background: #faf7f4; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Order ID</p>
      <p style="margin: 0; font-weight: 600; color: #2c1810;">#${(order.id || order._id)?.toString().slice(-8)}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #faf7f4;">
          <th style="padding: 10px 16px; text-align: left; font-size: 13px; color: #888;">Item</th>
          <th style="padding: 10px 16px; text-align: center; font-size: 13px; color: #888;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${(order.items || []).map(item => `
          <tr>
            <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://oatbites.in/dashboard" 
         style="background: #2c1810; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        View Order Details →
      </a>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: `"Oatbites by SEJ" <${process.env.GMAIL_USER}>`,
      to: order.userEmail,
      subject: `${config.emoji} ${config.title} — Oatbites by SEJ`,
      html: baseTemplate(config.title, bodyContent),
    });

    console.log('[Email] Shipping update sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('[Email] Error sending shipping update:', err);
    return null;
  }
}

export async function sendBackInStockEmail(userEmail, product) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log('[Email] Gmail credentials not set, skipping email');
    return null;
  }

  const bodyContent = `
    <div style="text-align: center; margin: 20px 0;">
      <div style="font-size: 48px; margin-bottom: 8px;">🔔</div>
      <p style="margin: 0; color: #2e7d32; font-weight: 600; font-size: 18px;">Good News!</p>
    </div>

    <p style="color: #555; line-height: 1.6;">
      <strong>${product.name}</strong> is back in stock! You asked us to notify you, so here we are.
    </p>

    ${product.image ? `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${product.image}" alt="${product.name}" style="max-width: 200px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
    </div>
    ` : ''}
    
    <div style="background: #faf7f4; padding: 16px; border-radius: 8px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <p style="margin: 0; font-weight: 600; color: #2c1810; font-size: 16px;">${product.name}</p>
        <p style="margin: 4px 0 0; color: #888; font-size: 13px;">${product.category || 'Oat Product'}</p>
      </div>
      <p style="margin: 0; font-weight: 800; color: #2c1810; font-size: 20px;">₹${product.price?.toLocaleString('en-IN')}</p>
    </div>

    <p style="color: #888; font-size: 13px; line-height: 1.5;">
      Hurry — popular items sell out fast! Grab yours before it's gone again.
    </p>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://oatbites.in/products/${product.id}" 
         style="background: #2c1810; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
        Shop Now →
      </a>
    </div>
  `;

  try {
    const info = await mailer.sendMail({
      from: `"Oatbites by SEJ" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `🔔 ${product.name} is Back in Stock! — Oatbites by SEJ`,
      html: baseTemplate("It's Back in Stock! 🎉", bodyContent),
    });

    console.log(`[Email] Back-in-stock notification sent to ${userEmail}:`, info.messageId);
    return info;
  } catch (err) {
    console.error(`[Email] Error sending back-in-stock email to ${userEmail}:`, err);
    return null;
  }
}
