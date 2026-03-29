import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import RealTimeOrderChat from './RealTimeOrderChat';
import { useAuth } from '../../context/AuthContext';

const ChatButton = ({ orderId, orderData, className = '' }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isFarmer } = useAuth();

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  // Get the other party's name for display
  const otherPartyName = isFarmer() ? orderData?.buyer?.name : orderData?.farmer?.name;

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`
          inline-flex items-center space-x-2 px-4 py-2 
          bg-primary-600 hover:bg-primary-700 
          text-white font-medium rounded-lg 
          transition-colors duration-200 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${className}
        `}
      >
        <MessageCircle size={16} />
        <span>
          Chat with {otherPartyName || (isFarmer() ? 'Buyer' : 'Farmer')}
        </span>
        {isChatOpen && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* Real-Time Chat Component */}
      <RealTimeOrderChat
        orderId={orderId}
        orderData={orderData}
        isOpen={isChatOpen}
        onClose={closeChat}
      />
    </>
  );
};

export default ChatButton;