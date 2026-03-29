import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Leaf, 
  Users, 
  TrendingUp, 
  Shield,
  Star,
  Quote
} from 'lucide-react';
import Lottie from 'lottie-react';
import Button from '../../components/common/Button';
import farmerAnimation from '../../Animations/Afro man farmer online agriculture service application wheat fields growth.json';
import cornGrowingAnimation from '../../Animations/Corn Growing.json';

const HomePage = () => {
  const features = [
    {
      icon: Leaf,
      title: 'Sustainable Solution',
      description: 'Convert agricultural waste into valuable resources, reducing environmental impact and promoting circular economy.',
    },
    {
      icon: Users,
      title: 'Connect Communities',
      description: 'Bridge the gap between farmers and industries, creating mutually beneficial partnerships.',
    },
    {
      icon: TrendingUp,
      title: 'Increase Income',
      description: 'Help farmers generate additional revenue from waste materials that would otherwise be discarded.',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Safe and secure transactions with verified users and transparent pricing mechanisms.',
    },
  ];

  const stats = [
    { number: '1000+', label: 'Active Farmers' },
    { number: '500+', label: 'Registered Buyers' },
    { number: '₹50L+', label: 'Revenue Generated' },
    { number: '10K+', label: 'Tons Waste Processed' },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Farmer from Punjab',
      content: 'This platform has transformed my farming business. I now earn extra income from rice straw that I used to burn.',
      rating: 5,
    },
    {
      name: 'Green Energy Ltd',
      role: 'Biogas Company',
      content: 'Excellent platform to source quality agricultural waste. The verification process ensures we get genuine suppliers.',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Organic Farmer',
      content: 'Easy to use interface and quick payments. I have been selling my crop residues here for over a year now.',
      rating: 5,
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Register',
      description: 'Sign up as a farmer or buyer with your details and get verified.',
    },
    {
      step: '2',
      title: 'List/Browse',
      description: 'Farmers list their waste, buyers browse available materials.',
    },
    {
      step: '3',
      title: 'Connect',
      description: 'Direct communication between farmers and buyers for negotiations.',
    },
    {
      step: '4',
      title: 'Transact',
      description: 'Secure transactions with transparent pricing and delivery options.',
    },
  ];

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12 sm:py-16 lg:py-20">
        <div className="responsive-container">
          <div className="responsive-grid-2 responsive-gap items-center">
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <h1 className="responsive-title text-gray-900 leading-tight">
                  Turn Your
                  <span className="text-primary-600"> Agricultural Waste </span>
                  Into Wealth
                </h1>
                <p className="responsive-text text-gray-600 leading-relaxed">
                  Connect farmers with industries to create a sustainable circular economy. 
                  Transform waste into valuable resources while protecting our environment.
                </p>
              </div>
              
              <div className="responsive-button-group">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="responsive-button">
                    Get Started
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link to="/about" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="responsive-button">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="responsive-stats pt-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary-600">1000+</div>
                  <div className="responsive-text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary-600">₹50L+</div>
                  <div className="responsive-text-sm text-gray-600">Revenue Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary-600">10K+</div>
                  <div className="responsive-text-sm text-gray-600">Tons Processed</div>
                </div>
                <div className="text-center sm:hidden">
                  <div className="text-xl sm:text-2xl font-bold text-primary-600">24/7</div>
                  <div className="responsive-text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center order-1 lg:order-2">
              <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
                <Lottie 
                  animationData={farmerAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    minHeight: '300px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="responsive-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-subtitle text-gray-900 mb-4">
              Why Choose Waste2Wealth?
            </h2>
            <p className="responsive-text text-gray-600 max-w-3xl mx-auto">
              Our platform provides a comprehensive solution for agricultural waste management, 
              benefiting both farmers and industries.
            </p>
          </div>

          <div className="responsive-grid-4 responsive-gap">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center space-y-4 responsive-padding-sm rounded-lg hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon size={24} className="text-primary-600 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="responsive-text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="responsive-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-subtitle text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="responsive-text text-gray-600 max-w-3xl mx-auto">
              Simple steps to start your journey from waste to wealth
            </p>
          </div>

          <div className="responsive-grid-2 responsive-gap items-center mb-12 sm:mb-16">
            {/* Steps */}
            <div className="responsive-grid-2 responsive-gap order-2 lg:order-1">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-lg sm:text-2xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="responsive-text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Corn Growing Animation */}
            <div className="flex items-center justify-center order-1 lg:order-2">
              <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                <Lottie 
                  animationData={cornGrowingAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    minHeight: '250px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary-600">
        <div className="responsive-container">
          <div className="responsive-stats responsive-gap">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="responsive-text-sm text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="responsive-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-subtitle text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="responsive-text text-gray-600 max-w-3xl mx-auto">
              Real stories from farmers and buyers who have transformed their business with our platform
            </p>
          </div>

          <div className="responsive-grid-3 responsive-gap">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg responsive-padding-sm space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="relative">
                  <Quote size={20} className="text-primary-200 absolute -top-2 -left-2" />
                  <p className="responsive-text-sm text-gray-700 italic pl-6">{testimonial.content}</p>
                </div>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="responsive-text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="responsive-container text-center">
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="responsive-subtitle text-white">
              Ready to Transform Your Agricultural Waste?
            </h2>
            <p className="responsive-text text-primary-100">
              Join thousands of farmers and buyers who are already benefiting from our platform. 
              Start your journey towards sustainable agriculture today.
            </p>
            <div className="responsive-button-group justify-center">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="responsive-button">
                  Join as Farmer
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="responsive-button text-white border-white hover:bg-white hover:text-primary-600">
                  Join as Buyer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;