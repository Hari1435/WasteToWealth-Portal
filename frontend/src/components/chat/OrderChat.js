import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  User,
  Phone,
  Mail,
  Package,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/helpers';

const OrderChat = ({ orderId, orderData, otherParty, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, isFarmer } = useAuth();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = useCallback(() => {
    const welcomeMessages = [
      {
        id: 1,
        type: 'system',
        message: `Chat started for Order #${orderId}`,
        timestamp: new Date(),
        isSystem: true
      },
      {
        id: 2,
        type: 'system',
        message: `You are now connected with ${otherParty?.name || (isFarmer() ? 'the buyer' : 'the farmer')}. You can discuss order details, shipping, and any questions about this transaction.`,
        timestamp: new Date(),
        isSystem: true
      }
    ];
    setMessages(welcomeMessages);
    setIsConnected(true);
  }, [orderId, otherParty?.name, isFarmer]);

  // Initialize chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, messages.length, initializeChat]);

  // Quick message templates
  const quickMessages = isFarmer() ? [
    "Your order has been confirmed and is being prepared.",
    "The order is ready for pickup/shipping.",
    "Tracking information has been updated.",
    "Is there anything specific you'd like to know about your order?"
  ] : [
    "When will my order be ready?",
    "Can you provide tracking information?",
    "Is there any update on the delivery?",
    "Thank you for the quick service!"
  ];

  const addMessage = (message, type = 'user') => {
    const newMsg = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date(),
      sender: type === 'user' ? user?.name : otherParty?.name,
      isSystem: type === 'system'
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    addMessage(newMessage.trim());
    setNewMessage('');

    // Simulate other party response (in real app, this would be WebSocket)
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const responses = [
          "Thanks for the update!",
          "Got it, I'll check on that.",
          "Sounds good, thank you.",
          "I appreciate the information.",
          "Perfect, thanks for letting me know."
        ];
        addMessage(responses[Math.floor(Math.random() * responses.length)], 'other');
      }, 2000 + Math.random() * 3000);
    }
  };

  const handleQuickMessage = (message) => {
    addMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold">Order Chat</h3>
              <p className="text-sm text-primary-100">
                Order #{orderId} • {otherParty?.name || (isFarmer() ? 'Buyer' : 'Farmer')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 text-xs ${isConnected ? 'text-green-200' : 'text-red-200'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Package size={16} className="text-primary-600" />
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{orderData?.status || 'Pending'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-primary-600" />
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{formatCurrency(orderData?.totalAmount || 0)}</span>
            </div>
            <div className="flex items-center space-x-2">
              {orderData?.paymentStatus === 'completed' ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <AlertCircle size={16} className="text-yellow-600" />
              )}
              <span className="text-gray-600">Payment:</span>
              <span className="font-medium">{orderData?.paymentStatus || 'Pending'}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 
                message.type === 'system' ? 'justify-center' : 'justify-start'
              }`}
            >
              {message.type === 'system' ? (
                <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm border border-blue-200">
                  {message.message}
                </div>
              ) : (
                <div className={`flex items-start space-x-2 max-w-xs ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    <User size={14} />
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${
                        message.type === 'user' 
                          ? 'text-primary-100' 
                          : 'text-gray-500'
                      }`}>
                        {message.sender}
                      </p>
                      <p className={`text-xs ${
                        message.type === 'user' 
                          ? 'text-primary-100' 
                          : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Quick messages:</p>
          <div className="flex flex-wrap gap-2">
            {quickMessages.map((msg, index) => (
              <button
                key={index}
                onClick={() => handleQuickMessage(msg)}
                className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200 transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4"
            >
              <Send size={16} />
            </Button>
          </div>
          
          {/* Contact Info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Need immediate help? Contact {otherParty?.name || (isFarmer() ? 'buyer' : 'farmer')}:
            </div>
            <div className="flex space-x-2">
              {otherParty?.email && (
                <a
                  href={`mailto:${otherParty.email}`}
                  className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Send Email"
                >
                  <Mail size={16} />
                </a>
              )}
              {otherParty?.phone && (
                <a
                  href={`tel:${otherParty.phone}`}
                  className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Call"
                >
                  <Phone size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderChat;