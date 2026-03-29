import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  Users
} from 'lucide-react';
// import Button from '../../components/common/Button'; // Temporarily removed
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        userType: 'general'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'info@waste2wealth.com',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+91 98765 43210',
      description: 'Mon-Fri from 9am to 6pm',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Green Street, Eco City, EC 12345',
      description: 'Come say hello at our office',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: 'Mon-Fri: 9:00 AM - 6:00 PM',
      description: 'Saturday: 10:00 AM - 4:00 PM',
    },
  ];

  const faqItems = [
    {
      question: 'How do I register as a farmer?',
      answer: 'Click on the Register button and select "Farmer" as your user type. Fill in your details including farm information and get verified.',
    },
    {
      question: 'What types of waste can I sell?',
      answer: 'You can sell various types of agricultural waste including crop residues, fruit peels, vegetable waste, grain husks, leaves, and stems.',
    },
    {
      question: 'How are payments processed?',
      answer: 'Payments are processed securely through our platform after successful delivery and confirmation from both parties.',
    },
    {
      question: 'Is there a commission fee?',
      answer: 'We charge a small platform fee to maintain and improve our services. Details are provided during registration.',
    },
  ];

  const supportCategories = [
    {
      icon: Users,
      title: 'For Farmers',
      description: 'Get help with listing your waste, managing orders, and maximizing your earnings.',
      email: 'farmers@waste2wealth.com',
    },
    {
      icon: MessageCircle,
      title: 'For Buyers',
      description: 'Assistance with finding quality waste materials and managing your purchases.',
      email: 'buyers@waste2wealth.com',
    },
    {
      icon: HelpCircle,
      title: 'Technical Support',
      description: 'Having trouble with the platform? Our tech team is here to help.',
      email: 'support@waste2wealth.com',
    },
  ];

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12 sm:py-16 lg:py-20">
        <div className="responsive-container">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <h1 className="responsive-title text-gray-900">
              Get In Touch
            </h1>
            <p className="responsive-text text-gray-600 leading-relaxed">
              Have questions about our platform? Need help getting started? 
              We're here to help you turn your agricultural waste into wealth.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="responsive-container">
          <div className="responsive-grid-2 responsive-gap">
            {/* Contact Form */}
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div>
                <h2 className="responsive-subtitle text-gray-900 mb-4">
                  Send Us a Message
                </h2>
                <p className="responsive-text-sm text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="responsive-form-grid">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                      I am a
                    </label>
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="farmer">Farmer</option>
                      <option value="buyer">Buyer/Company</option>
                      <option value="partner">Potential Partner</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="What's this about?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={20} />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
              <div>
                <h2 className="responsive-subtitle text-gray-900 mb-4">
                  Contact Information
                </h2>
                <p className="responsive-text-sm text-gray-600">
                  Reach out to us through any of these channels. We're always happy to help!
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 sm:space-x-4 responsive-padding-sm bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary-600 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{info.title}</h3>
                        <p className="text-primary-600 font-medium responsive-text-sm">{info.details}</p>
                        <p className="responsive-text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map placeholder */}
              <div className="bg-gray-200 rounded-lg h-48 sm:h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin size={32} className="mx-auto mb-2 sm:w-12 sm:h-12" />
                  <p className="responsive-text-sm">Interactive Map Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="responsive-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-subtitle text-gray-900 mb-4">
              Specialized Support
            </h2>
            <p className="responsive-text text-gray-600 max-w-3xl mx-auto">
              Get targeted help based on your specific needs
            </p>
          </div>

          <div className="responsive-grid-3 responsive-gap">
            {supportCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="responsive-card text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon size={24} className="text-primary-600 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{category.title}</h3>
                  <p className="responsive-text-sm text-gray-600">{category.description}</p>
                  <a
                    href={`mailto:${category.email}`}
                    className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium responsive-text-sm"
                  >
                    <Mail size={14} className="sm:w-4 sm:h-4" />
                    <span>{category.email}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="responsive-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-subtitle text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="responsive-text text-gray-600 max-w-3xl mx-auto">
              Quick answers to common questions about our platform
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {faqItems.map((faq, index) => (
              <div key={index} className="responsive-card-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h3>
                <p className="responsive-text-sm text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <p className="responsive-text-sm text-gray-600 mb-4">
              Can't find what you're looking for?
            </p>
            <button className="border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium py-2 px-4 sm:px-6 rounded-lg transition-colors duration-200 responsive-text-sm">
              View All FAQs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;