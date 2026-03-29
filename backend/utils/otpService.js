const nodemailer = require('nodemailer');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email
const sendOTPEmail = async (user, otp, purpose = 'Account Verification') => {
  try {
    const transporter = createTransporter();
    
    const isPasswordReset = purpose === 'Password Reset';
    
    const mailOptions = {
      from: `"Waste2Wealth" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: isPasswordReset ? 'Reset Your Waste2Wealth Password' : 'Your OTP for Waste2Wealth Registration',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #22c55e; margin: 0;">Waste2Wealth</h1>
            <p style="color: #666; margin: 5px 0;">Agricultural Waste Marketplace</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">
              ${isPasswordReset ? '🔒 Password Reset Request' : `Welcome ${user.name}!`}
            </h2>
            <p style="color: #666; line-height: 1.6;">
              ${isPasswordReset 
                ? `You requested to reset your password for your Waste2Wealth account. Use the OTP below to proceed:` 
                : `Thank you for registering as a ${user.userType} on Waste2Wealth. To complete your registration, please use the OTP below:`
              }
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: ${isPasswordReset ? '#ef4444' : '#22c55e'}; color: white; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 5px; display: inline-block;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              This OTP will expire in 10 minutes for security reasons.
            </p>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              ${isPasswordReset 
                ? 'If you didn\'t request a password reset, please ignore this email and your password will remain unchanged.' 
                : 'If you didn\'t request this OTP, please ignore this email.'
              }
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>&copy; 2024 Waste2Wealth. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('OTP email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const dashboardUrl = `${process.env.FRONTEND_URL}/${user.userType}/dashboard`;
    
    const mailOptions = {
      from: `"Waste2Wealth" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to Waste2Wealth - Account Verified!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #22c55e; margin: 0;">Waste2Wealth</h1>
            <p style="color: #666; margin: 5px 0;">Agricultural Waste Marketplace</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">🎉 Account Verified Successfully!</h2>
            <p style="color: #666; line-height: 1.6;">
              Congratulations ${user.name}! Your account has been verified and is now active.
            </p>
            
            ${user.userType === 'farmer' ? `
              <p style="color: #666; line-height: 1.6;">
                As a farmer, you can now:
                <br>• Create waste listings to sell your agricultural waste
                <br>• Manage your listings and track orders
                <br>• Connect with buyers and earn from your waste
              </p>
            ` : `
              <p style="color: #666; line-height: 1.6;">
                As a buyer, you can now:
                <br>• Browse available agricultural waste listings
                <br>• Place orders and make secure payments
                <br>• Connect with farmers and manage your purchases
              </p>
            `}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                 style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>Thank you for joining our sustainable agriculture community!</p>
            <p>&copy; 2024 Waste2Wealth. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
};