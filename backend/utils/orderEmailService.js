const nodemailer = require('nodemailer');

// Create transporter (reusing from otpService)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send order creation notification to farmer
const sendOrderCreatedNotification = async (order, farmer, buyer, waste) => {
  try {
    const transporter = createTransporter();
    
    const orderUrl = `${process.env.FRONTEND_URL}/farmer/orders/${order._id}`;
    
    const mailOptions = {
      from: `"Waste2Wealth" <${process.env.EMAIL_USER}>`,
      to: farmer.email,
      subject: 'New Order Request - Waste2Wealth',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #22c55e; margin: 0;">Waste2Wealth</h1>
            <p style="color: #666; margin: 5px 0;">Agricultural Waste Marketplace</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">📦 New Order Request</h2>
            <p style="color: #666; line-height: 1.6;">
              Hello ${farmer.name},
            </p>
            <p style="color: #666; line-height: 1.6;">
              You have received a new order request from <strong>${buyer.name}</strong> for your waste listing.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
              <p style="margin: 5px 0;"><strong>Waste Type:</strong> ${waste.wasteType}</p>
              <p style="margin: 5px 0;"><strong>Quantity:</strong> ${order.quantity} ${order.unit}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
              <p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${order.deliveryDetails?.address || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Buyer Information:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${buyer.name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${buyer.email}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${buyer.phone || 'Not provided'}</p>
              ${buyer.companyDetails?.companyName ? `<p style="margin: 5px 0;"><strong>Company:</strong> ${buyer.companyDetails.companyName}</p>` : ''}
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Please review the order details and respond as soon as possible. You can accept or reject this order from your dashboard.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" 
                 style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View Order Details
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>Thank you for being part of our sustainable agriculture community!</p>
            <p>&copy; 2024 Waste2Wealth. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Order creation email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send order acceptance notification to buyer
const sendOrderAcceptedNotification = async (order, farmer, buyer, waste) => {
  try {
    const transporter = createTransporter();
    
    const orderUrl = `${process.env.FRONTEND_URL}/buyer/orders/${order._id}`;
    
    const mailOptions = {
      from: `"Waste2Wealth" <${process.env.EMAIL_USER}>`,
      to: buyer.email,
      subject: 'Order Accepted - Waste2Wealth',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #22c55e; margin: 0;">Waste2Wealth</h1>
            <p style="color: #666; margin: 5px 0;">Agricultural Waste Marketplace</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">✅ Order Accepted!</h2>
            <p style="color: #666; line-height: 1.6;">
              Hello ${buyer.name},
            </p>
            <p style="color: #666; line-height: 1.6;">
              Great news! Your order has been <strong style="color: #22c55e;">accepted</strong> by ${farmer.name}.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Waste Type:</strong> ${waste.wasteType}</p>
              <p style="margin: 5px 0;"><strong>Quantity:</strong> ${order.quantity} ${order.unit}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
              <p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${order.deliveryDetails?.address || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Accepted</span></p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Farmer Information:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${farmer.name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${farmer.email}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${farmer.phone || 'Not provided'}</p>
              ${farmer.farmDetails?.farmSize ? `<p style="margin: 5px 0;"><strong>Farm Size:</strong> ${farmer.farmDetails.farmSize} acres</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" 
                 style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Track Your Order
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>Thank you for choosing Waste2Wealth for your agricultural waste needs!</p>
            <p>&copy; 2024 Waste2Wealth. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Order acceptance email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send order rejection notification to buyer
const sendOrderRejectedNotification = async (order, farmer, buyer, waste) => {
  try {
    const transporter = createTransporter();
    
    const browseUrl = `${process.env.FRONTEND_URL}/buyer/browse`;
    
    const mailOptions = {
      from: `"Waste2Wealth" <${process.env.EMAIL_USER}>`,
      to: buyer.email,
      subject: 'Order Update - Waste2Wealth',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #22c55e; margin: 0;">Waste2Wealth</h1>
            <p style="color: #666; margin: 5px 0;">Agricultural Waste Marketplace</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">📋 Order Update</h2>
            <p style="color: #666; line-height: 1.6;">
              Hello ${buyer.name},
            </p>
            <p style="color: #666; line-height: 1.6;">
              We regret to inform you that your order has been declined by ${farmer.name}. This could be due to availability issues or other circumstances.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Waste Type:</strong> ${waste.wasteType}</p>
              <p style="margin: 5px 0;"><strong>Quantity:</strong> ${order.quantity} ${order.unit}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #ef4444; font-weight: bold;">Declined</span></p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Don't worry! There are many other farmers offering similar waste products. We encourage you to browse our marketplace for alternative options.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${browseUrl}" 
                 style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Browse Other Listings
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>Thank you for using Waste2Wealth!</p>
            <p>&copy; 2024 Waste2Wealth. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Order rejection email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderCreatedNotification,
  sendOrderAcceptedNotification,
  sendOrderRejectedNotification
};
