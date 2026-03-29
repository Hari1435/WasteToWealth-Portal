import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Leaf
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Leaf size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold">
                Waste<span className="text-primary-400">2</span>Wealth
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connecting farmers with waste buyers to create a sustainable circular economy. 
              Turn agricultural waste into valuable resources and contribute to environmental conservation.
            </p>
            <div className="flex space-x-4">
              <button 
                type="button"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </button>
              <button 
                type="button"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </button>
              <button 
                type="button"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </button>
              <button 
                type="button"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/marketplace" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Join as Farmer
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Join as Buyer
                </Link>
              </li>
              <li>
                <button 
                  type="button"
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  How it Works
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  Success Stories
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="text-gray-300 hover:text-primary-400 transition-colors text-sm"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-primary-400 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  123 Green Street,<br />
                  Eco City, EC 12345<br />
                  India
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-primary-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">+91 98765 43210</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-primary-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">info@waste2wealth.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Waste2Wealth. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <button 
                type="button"
                className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
              >
                Privacy Policy
              </button>
              <button 
                type="button"
                className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
              >
                Terms of Service
              </button>
              <button 
                type="button"
                className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
              >
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;