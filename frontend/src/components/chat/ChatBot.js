import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  User,
  Bot,
  Phone,
  Package,
  Truck,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/helpers';

const ChatBot = ({ orderId, orderData, isOpen, onToggle, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, isFarmer } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        message: `Hello! I'm here to help you with order #${orderId}. You can ask me about order details, shipping information, or connect with the ${isFarmer() ? 'buyer' : 'farmer'}.`,
        timestamp: new Date(),
        isSystem: true
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, orderId, isFarmer, messages.length]);

  // Quick action buttons
  const quickActions = [
    {
      label: 'Order Status',
      icon: Package,
      action: () => handleQuickAction('order_status')
    },
    {
      label: 'Shipping Info',
      icon: Truck,
      action: () => handleQuickAction('shipping_info')
    },
    {
      label: 'Payment Details',
      icon: DollarSign,
      action: () => handleQuickAction('payment_details')
    },
    {
      label: 'Contact Info',
      icon: Phone,
      action: () => handleQuickAction('contact_info')
    }
  ];

  const handleQuickAction = (action) => {
    let response = '';

    switch (action) {
      case 'order_status':
        response = `Order Status: ${orderData?.status || 'Pending'}\nQuantity: ${orderData?.quantity?.amount || 'N/A'} ${orderData?.quantity?.unit || ''}\nTotal Amount: ${formatCurrency(orderData?.totalAmount || 0)}`;
        break;
      case 'shipping_info':
        response = orderData?.shippingDetails ?
          `Vehicle Number: ${orderData.shippingDetails.trackingNumber || 'Not assigned'}\nVehicle Type: ${orderData.shippingDetails.courierService || 'Not selected'}\nDelivery Status: ${orderData.shippingDetails.deliveryStatus || 'Pending'}` :
          'Shipping information not available yet. The farmer will update this once the order is processed.';
        break;
      case 'payment_details':
        response = `Payment Status: ${orderData?.paymentStatus || 'Pending'}\nTotal Amount: ${formatCurrency(orderData?.totalAmount || 0)}\nPayment Method: ${orderData?.paymentMethod || 'Not specified'}`;
        break;
      case 'contact_info':
        const contactPerson = isFarmer() ? orderData?.buyer : orderData?.farmer;
        response = contactPerson ?
          `Contact: ${contactPerson.name}\nEmail: ${contactPerson.email}\nPhone: ${contactPerson.phone || 'Not provided'}` :
          'Contact information not available.';
        break;
      default:
        response = 'I can help you with order status, shipping info, payment details, and contact information.';
    }

    addBotMessage(response);
  };

  const addBotMessage = (message, isSystem = false) => {
    const botMessage = {
      id: Date.now(),
      type: 'bot',
      message,
      timestamp: new Date(),
      isSystem
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const addUserMessage = (message) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message,
      timestamp: new Date(),
      sender: user?.name || 'You'
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = newMessage.trim();
    addUserMessage(message);
    setNewMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      setIsTyping(false);
      handleBotResponse(message);
    }, 1000);
  };

  const handleBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    // Simple keyword-based responses
    if (lowerMessage.includes('status') || lowerMessage.includes('order')) {
      response = `Your order #${orderId} is currently ${orderData?.status || 'pending'}. ${orderData?.status === 'confirmed' ? 'The farmer is preparing your order.' : orderData?.status === 'shipped' ? 'Your order is on the way!' : 'We\'ll update you once there\'s progress.'}`;
    } else if (lowerMessage.includes('track') || lowerMessage.includes('shipping')) {
      response = orderData?.shippingDetails?.trackingNumber ?
        `Your vehicle number is: ${orderData.shippingDetails.trackingNumber}. Vehicle type: ${orderData.shippingDetails.courierService || 'Not specified'}.` :
        'Vehicle information is not available yet. The farmer will provide this once the order is shipped.';
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      response = `Payment status: ${orderData?.paymentStatus || 'Pending'}. Total amount: ${formatCurrency(orderData?.totalAmount || 0)}. ${orderData?.paymentStatus === 'completed' ? 'Your payment has been processed successfully.' : 'Payment is pending completion.'}`;
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      const contactPerson = isFarmer() ? orderData?.buyer : orderData?.farmer;
      response = contactPerson ?
        `You can contact ${contactPerson.name} at ${contactPerson.email}${contactPerson.phone ? ` or ${contactPerson.phone}` : ''}.` :
        'Contact information is not available at the moment.';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
      response = 'I can help you with:\n• Order status and details\n• Shipping and tracking information\n• Payment status\n• Contact information\n• General order inquiries\n\nJust ask me anything about your order!';
    } else if (lowerMessage.includes('cancel')) {
      response = 'To cancel your order, please contact the farmer directly or use the cancel option in your order details. Note that cancellation may not be possible if the order is already being processed.';
    } else if (lowerMessage.includes('delivery') || lowerMessage.includes('when')) {
      response = orderData?.shippingDetails?.estimatedDeliveryDate ?
        `Estimated delivery date: ${new Date(orderData.shippingDetails.estimatedDeliveryDate).toLocaleDateString()}` :
        'Delivery date is not available yet. The farmer will provide an estimate once the order is processed.';
    } else {
      response = `I understand you're asking about "${userMessage}". For specific inquiries about order #${orderId}, you can:\n\n• Check order status\n• View shipping information\n• Contact the ${isFarmer() ? 'buyer' : 'farmer'} directly\n\nIs there something specific I can help you with?`;
    }

    addBotMessage(response);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-80' : 'w-96'} max-w-[calc(100vw-2rem)]`}>
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <MessageCircle size={16} />
            </div>
            <div>
              <h3 className="font-semibold">Order Assistant</h3>
              <p className="text-xs text-primary-100">Order #{orderId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Quick Actions */}
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex items-center space-x-2 p-2 text-xs bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                      <Icon size={14} className="text-primary-600" />
                      <span className="text-gray-700">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                      }`}>
                      {message.type === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div className={`rounded-lg p-3 ${message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.isSystem
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      <p className="text-sm whitespace-pre-line">{message.message}</p>
                      <p className={`text-xs mt-1 ${message.type === 'user'
                        ? 'text-primary-100'
                        : 'text-gray-500'
                        }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center">
                      <Bot size={12} />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your order..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;