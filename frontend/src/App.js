import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import LoadingScreen from './components/common/LoadingScreen';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OTPVerificationPage from './pages/auth/OTPVerificationPage';

// Error Pages
import NotFoundPage from './pages/error/NotFoundPage';

// Protected Pages
import ProfilePage from './pages/profile/ProfilePage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Protection Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Hooks
import usePersistentNavigation from './hooks/usePersistentNavigation';

// Shared Pages
import OrderDetails from './pages/orders/OrderDetails';
import WasteDetails from './pages/waste/WasteDetails';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import CreateWasteListing from './pages/farmer/CreateWasteListing';
import MyListings from './pages/farmer/MyListings';
import FarmerOrders from './pages/farmer/FarmerOrders';
import TruckRecommendation from './components/farmer/TruckRecommendation';


// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BrowseListings from './pages/buyer/BrowseListings';
import BuyerOrders from './pages/buyer/BuyerOrders';

// Order Management - Using old system only
import OrdersRedirect from './components/orders/OrdersRedirect';

// Test Components (development only)
import GeoapifyTest from './components/test/GeoapifyTest';



const AppContent = () => {
  const { isLoading, loadingMessage } = useLoading();
  
  // Use persistent navigation hook to handle page refresh navigation
  usePersistentNavigation();

  return (
    <>
      {isLoading && <LoadingScreen message={loadingMessage} />}
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Routes (only accessible when not logged in) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<OTPVerificationPage />} />

            {/* Protected Routes (require authentication) */}
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/waste/:id" element={<ProtectedRoute><WasteDetails /></ProtectedRoute>} />

            {/* Farmer Routes */}
            <Route path="/farmer/dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
            <Route path="/farmer/create-listing" element={<ProtectedRoute><CreateWasteListing /></ProtectedRoute>} />
            <Route path="/farmer/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/farmer/truck-recommendation" element={<ProtectedRoute><TruckRecommendation /></ProtectedRoute>} />
            <Route path="/farmer/orders" element={<ProtectedRoute><FarmerOrders /></ProtectedRoute>} />

            {/* Buyer Routes */}
            <Route path="/buyer/dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/buyer/browse" element={<ProtectedRoute><BrowseListings /></ProtectedRoute>} />
            <Route path="/buyer/orders" element={<ProtectedRoute><BuyerOrders /></ProtectedRoute>} />

            {/* Order Management - Using old system only */}
            <Route path="/orders" element={<ProtectedRoute><OrdersRedirect /></ProtectedRoute>} />

            {/* Test Routes (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <Route path="/test/geoapify" element={
                  <div className="min-h-screen bg-gray-50 py-8">
                    <GeoapifyTest />
                  </div>
                } />

              </>
            )}

            {/* Catch all route - 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#22c55e',
              secondary: '#black',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#ef4444',
              secondary: '#black',
            },
          },
        }}
      />
    </>
  );
};

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AppContent />
        </Router>
      </AuthProvider>
    </LoadingProvider>
  );
}

export default App;