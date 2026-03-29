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
import toast from 'react-hot-toast';

const RealTimeOrderChat = ({ orderId, orderData, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [otherPartyOnline, setOtherPartyOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, isFarmer } = useAuth();

  // Get other party info from order data
  const otherParty = isFarmer() ? orderData?.buyer : orderData?.farmer;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing messages from localStorage
  const loadOrderMessages = async (orderId) => {
    try {
      const storageKey = `order_chat_${orderId}`;
      const storedMessages = localStorage.getItem(storageKey);
      return storedMessages ? JSON.parse(storedMessages) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  // Save message to localStorage and broadcast to other users
  const saveMessage = useCallback(async (message) => {
    try {
      const storageKey = `order_chat_${orderId}`;
      const existingMessages = await loadOrderMessages(orderId);
      const updatedMessages = [...existingMessages, message];
      
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      
      // Trigger custom event for same-tab real-time updates
      window.dispatchEvent(new CustomEvent('chatMessageUpdate', {
        detail: {
          key: storageKey,
          newValue: JSON.stringify(updatedMessages),
          oldValue: JSON.stringify(existingMessages)
        }
      }));
      
      // Also trigger storage event for cross-tab updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: storageKey,
        newValue: JSON.stringify(updatedMessages),
        oldValue: JSON.stringify(existingMessages)
      }));
      
      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }, [orderId]);

  // Initialize chat and load existing messages
  const initializeChat = useCallback(async () => {
    try {
      setIsConnected(true);
      
      // Load existing messages for this order
      const existingMessages = await loadOrderMessages(orderId);
      const currentUserRole = isFarmer() ? 'farmer' : 'buyer';
      
      // Process messages to determine sent/received status
      const processedMessages = existingMessages.map(msg => {
        if (msg.isSystem) return msg;
        
        // Determine if message was sent by current user
        const isSentByCurrentUser = msg.senderRole === currentUserRole;
        
        return {
          ...msg,
          type: isSentByCurrentUser ? 'sent' : 'received',
          timestamp: new Date(msg.timestamp)
        };
      });
      
      setMessages(processedMessages);
      
      // Add welcome message if no existing messages
      if (existingMessages.length === 0) {
        const welcomeMessage = {
          id: Date.now(),
          type: 'system',
          message: `Chat started for Order #${orderId}. You can now communicate directly with ${otherParty?.name || (isFarmer() ? 'the buyer' : 'the farmer')}.`,
          timestamp: new Date(),
          isSystem: true
        };
        setMessages([welcomeMessage]);
        
        // Save welcome message to localStorage
        await saveMessage(welcomeMessage);
      }
      
      // Simulate checking if other party is online
      setOtherPartyOnline(Math.random() > 0.3);
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      toast.error('Failed to load chat messages');
    }
  }, [orderId, otherParty?.name, isFarmer, saveMessage]);



  // Initialize chat when opened
  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, initializeChat]);

  // Listen for real-time messages from localStorage
  useEffect(() => {
    if (!isConnected || !isOpen) return;

    const storageKey = `order_chat_${orderId}`;
    
    const processMessages = (updatedMessages) => {
      const currentUserRole = isFarmer() ? 'farmer' : 'buyer';
      
      // Update messages and determine message types based on sender role
      const processedMessages = updatedMessages.map(msg => {
        if (msg.isSystem) return msg;
        
        // Determine if message is sent by current user or received
        const isSentByCurrentUser = msg.senderRole === currentUserRole;
        
        return {
          ...msg,
          type: isSentByCurrentUser ? 'sent' : 'received',
          timestamp: new Date(msg.timestamp)
        };
      });
      
      setMessages(processedMessages);
    };
    
    const handleStorageChange = async (e) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const updatedMessages = JSON.parse(e.newValue);
          processMessages(updatedMessages);
        } catch (error) {
          console.error('Error processing storage change:', error);
        }
      }
    };

    const handleCustomStorageEvent = async (e) => {
      if (e.detail && e.detail.key === storageKey) {
        try {
          const updatedMessages = JSON.parse(e.detail.newValue);
          processMessages(updatedMessages);
        } catch (error) {
          console.error('Error processing custom storage event:', error);
        }
      }
    };

    // Polling fallback to ensure messages are synchronized
    const pollForMessages = async () => {
      try {
        const currentMessages = await loadOrderMessages(orderId);
        if (currentMessages.length !== messages.length) {
          processMessages(currentMessages);
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    };

    // Listen for storage events (cross-tab updates)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (same-tab updates)
    window.addEventListener('chatMessageUpdate', handleCustomStorageEvent);

    // Set up polling as fallback (every 2 seconds)
    const pollInterval = setInterval(pollForMessages, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chatMessageUpdate', handleCustomStorageEvent);
      clearInterval(pollInterval);
    };
  }, [isConnected, isOpen, orderId, isFarmer, messages.length]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const currentUserRole = isFarmer() ? 'farmer' : 'buyer';
    const messageToSend = {
      id: Date.now(),
      message: newMessage.trim(),
      timestamp: new Date(),
      sender: user?.name || (isFarmer() ? 'Farmer' : 'Buyer'),
      senderRole: currentUserRole,
      senderId: user?.id || currentUserRole,
      isSystem: false
    };

    // Add message to local state immediately as 'sent'
    setMessages(prev => [...prev, { ...messageToSend, type: 'sent' }]);
    setNewMessage('');

    try {
      // Save message to localStorage (this will trigger the storage event for other users)
      await saveMessage(messageToSend);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      
      // Remove message from local state if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== messageToSend.id));
    }
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
                Order #{orderId} • Chatting with {otherParty?.name || (isFarmer() ? 'Buyer' : 'Farmer')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 text-xs ${otherPartyOnline ? 'text-green-200' : 'text-gray-300'}`}>
              <div className={`w-2 h-2 rounded-full ${otherPartyOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
              <span>{otherPartyOnline ? 'Online' : 'Offline'}</span>
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
                message.type === 'sent' ? 'justify-end' : 
                message.type === 'system' ? 'justify-center' : 'justify-start'
              }`}
            >
              {message.type === 'system' ? (
                <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm border border-blue-200 max-w-md text-center">
                  {message.message}
                </div>
              ) : (
                <div className={`flex items-start space-x-2 max-w-xs ${
                  message.type === 'sent' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'sent' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    <User size={14} />
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'sent'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${
                        message.type === 'sent' 
                          ? 'text-primary-100' 
                          : 'text-gray-500'
                      }`}>
                        {message.sender}
                      </p>
                      <p className={`text-xs ${
                        message.type === 'sent' 
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



        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${otherParty?.name || (isFarmer() ? 'buyer' : 'farmer')}...`}
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
              Direct contact with {otherParty?.name || (isFarmer() ? 'buyer' : 'farmer')}:
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

export default RealTimeOrderChat;