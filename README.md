# 🌾 Agricultural Waste Marketplace

A full-stack marketplace platform connecting farmers with agricultural waste to buyers who need it for various purposes like fertilizer production, biogas generation, composting, and more.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Agricultural Waste Marketplace is a B2B platform that addresses the dual challenge of agricultural waste management and resource optimization. Farmers can list their agricultural waste products, while buyers from various industries can browse, purchase, and arrange delivery of these materials.

### Key Benefits

- **For Farmers**: Convert waste into revenue, reduce disposal costs
- **For Buyers**: Access affordable raw materials for production
- **For Environment**: Promote circular economy and reduce waste

## ✨ Features

### User Management
- 👤 Dual user roles: Farmers and Buyers
- 📧 Email-based OTP verification
- 🔐 JWT authentication with secure password hashing
- 📍 Location-based user profiles with geospatial coordinates
- ⭐ Rating and review system

### Waste Listings
- 📝 Create detailed waste listings with images
- 🗂️ Multiple waste categories (crop residue, fruit peels, vegetable waste, etc.)
- 📊 Quantity and pricing management
- 📅 Availability date ranges
- 🔍 Advanced search and filtering
- 👁️ View tracking

### Order Management
- 🔄 Complete order lifecycle tracking
- 📦 Delivery options: pickup or delivery
- 🚚 Intelligent truck recommendation system
- 📏 Distance calculation using multiple APIs
- 💬 Real-time order chat between farmers and buyers
- 📜 Order history and status tracking

### Payment System
- 💳 Razorpay payment gateway integration
- 💰 Secure transaction processing
- 🧾 Transaction history and receipts
- 🔄 Refund support
- 📊 Platform fee calculation

### Additional Features
- 🔔 Real-time notifications
- 💬 ChatBot for customer support
- 🗺️ Interactive maps with Leaflet
- 📱 Responsive design for all devices
- 🎨 Beautiful UI with Tailwind CSS
- 🎭 Custom loading animations

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **HTTP Client**: Axios
- **Maps**: Leaflet, React Leaflet
- **Notifications**: React Hot Toast
- **Animations**: Lottie React
- **Real-time**: Socket.io Client
- **Forms**: React Hook Form
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer, Cloudinary
- **Payment**: Razorpay
- **Email**: Nodemailer
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Express Rate Limit
- **Validation**: Express Validator

### ML Model
- **Language**: Python
- **Purpose**: Delivery cost prediction and truck recommendations

## 📁 Project Structure

```
agricultural-waste-marketplace/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── chat/       # Chat and messaging
│   │   │   ├── common/     # Shared components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── orders/     # Order-related components
│   │   │   └── payments/   # Payment components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Login, Register, OTP
│   │   │   ├── buyer/      # Buyer dashboard and features
│   │   │   ├── farmer/     # Farmer dashboard and features
│   │   │   ├── orders/     # Order management
│   │   │   ├── profile/    # User profile
│   │   │   └── public/     # Public pages
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main app component
│   └── package.json
│
├── backend/                 # Node.js backend application
│   ├── config/             # Configuration files
│   │   ├── cloudinary.js   # Cloudinary setup
│   │   ├── config.js       # App configuration
│   │   └── database.js     # MongoDB connection
│   ├── middleware/         # Express middleware
│   │   ├── auth.js         # Authentication middleware
│   │   ├── upload.js       # File upload middleware
│   │   └── validation.js   # Input validation
│   ├── models/             # Mongoose models
│   │   ├── User.js         # User model
│   │   ├── Waste.js        # Waste listing model
│   │   ├── Order.js        # Order model
│   │   ├── Payment.js      # Payment model
│   │   ├── Notification.js # Notification model
│   │   └── Review.js       # Review model
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── users.js        # User management
│   │   ├── waste.js        # Waste listings
│   │   ├── orders.js       # Order management
│   │   ├── payments.js     # Payment processing
│   │   └── notifications.js # Notifications
│   ├── services/           # Business logic
│   │   └── mlService.js    # ML model integration
│   ├── utils/              # Utility functions
│   │   ├── generateToken.js # JWT token generation
│   │   ├── otpService.js   # OTP generation/validation
│   │   └── dbHealthCheck.js # Database monitoring
│   ├── server.js           # Express app entry point
│   └── package.json
│
├── ml-model/               # Python ML model (optional)
│   ├── models/            # Trained models
│   ├── data/              # Training data
│   └── requirements.txt   # Python dependencies
│
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Python 3.8+ (for ML model, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agricultural-waste-marketplace
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install ML Model Dependencies (Optional)**
   ```bash
   cd ../ml-model
   pip install -r requirements.txt
   ```

### Configuration

1. **Backend Environment Variables**
   
   Create `backend/.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   
   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Geoapify Configuration
   GEOAPIFY_API_KEY=your_geoapify_api_key
   ```

2. **Frontend Environment Variables**
   
   Create `frontend/.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
   REACT_APP_GEOAPIFY_API_KEY=your_geoapify_api_key
   REACT_APP_RAPIDAPI_KEY=your_rapidapi_key
   REACT_APP_RAPIDAPI_HOST=distance-calculator.p.rapidapi.com
   REACT_APP_OPENROUTE_API_KEY=your_openroute_api_key
   GENERATE_SOURCEMAP=false
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on `http://localhost:3000`

4. **Start ML Model Service (Optional)**
   ```bash
   cd ml-model
   python app.py
   ```

## 🔐 Environment Variables

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/waste2wealth` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_xxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | `your-razorpay-secret` |
| `EMAIL_USER` | Email for sending OTPs | `your-email@gmail.com` |
| `EMAIL_PASS` | Email app password | `your-app-password` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `REACT_APP_RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_xxxxx` |
| `REACT_APP_GEOAPIFY_API_KEY` | Geoapify API key | `your-geoapify-key` |

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/verify-otp        - Verify OTP
POST   /api/auth/login             - User login
POST   /api/auth/resend-otp        - Resend OTP
GET    /api/auth/me                - Get current user
```

### Waste Listing Endpoints

```
GET    /api/waste                  - Get all waste listings
GET    /api/waste/:id              - Get single waste listing
POST   /api/waste                  - Create waste listing (Farmer)
PUT    /api/waste/:id              - Update waste listing (Farmer)
DELETE /api/waste/:id              - Delete waste listing (Farmer)
GET    /api/waste/farmer/my-listings - Get farmer's listings
```

### Order Endpoints

```
GET    /api/orders                 - Get user orders
GET    /api/orders/:id             - Get single order
POST   /api/orders                 - Create new order (Buyer)
PUT    /api/orders/:id/status      - Update order status
PUT    /api/orders/:id/delivery    - Update delivery details
```

### Payment Endpoints

```
POST   /api/payments/create-order  - Create Razorpay order
POST   /api/payments/verify        - Verify payment
GET    /api/payments/history       - Get payment history
```

### User Endpoints

```
GET    /api/users/profile          - Get user profile
PUT    /api/users/profile          - Update user profile
GET    /api/users/:id              - Get user by ID
```

### Notification Endpoints

```
GET    /api/notifications          - Get user notifications
PUT    /api/notifications/:id/read - Mark notification as read
DELETE /api/notifications/:id      - Delete notification
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🏗️ Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Production
```bash
cd backend
NODE_ENV=production npm start
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS configuration
- Helmet for security headers
- Rate limiting on API endpoints
- XSS protection
- SQL injection prevention (NoSQL)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by circular economy principles
- Built with modern web technologies

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Admin dashboard for platform management
- [ ] Advanced analytics and reporting
- [ ] Mobile application (React Native)
- [ ] Multi-language support
- [ ] Bulk order management
- [ ] Automated quality verification
- [ ] Integration with logistics providers
- [ ] AI-powered price recommendations
- [ ] Blockchain for transaction transparency

---

Made with ❤️ for sustainable agriculture
