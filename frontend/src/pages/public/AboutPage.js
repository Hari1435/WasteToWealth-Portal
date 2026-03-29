import React from 'react';
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Award, 
  Leaf,
  TrendingUp,
  Globe,
  CheckCircle
} from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'We are committed to creating a sustainable future by transforming waste into valuable resources.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building strong connections between farmers and industries to create mutual benefits.',
    },
    {
      icon: Heart,
      title: 'Impact',
      description: 'Making a positive impact on the environment and rural communities across India.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Striving for excellence in everything we do, from platform quality to customer service.',
    },
  ];

  const team = [
    {
      name: 'Rajesh Patel',
      role: 'CEO & Founder',
      image: '/api/placeholder/150/150',
      description: 'Former agricultural scientist with 15+ years of experience in sustainable farming.',
    },
    {
      name: 'Priya Sharma',
      role: 'CTO',
      image: '/api/placeholder/150/150',
      description: 'Tech entrepreneur passionate about using technology for environmental solutions.',
    },
    {
      name: 'Amit Kumar',
      role: 'Head of Operations',
      image: '/api/placeholder/150/150',
      description: 'Supply chain expert with deep understanding of agricultural markets.',
    },
    {
      name: 'Sneha Gupta',
      role: 'Head of Marketing',
      image: '/api/placeholder/150/150',
      description: 'Marketing professional focused on building sustainable business communities.',
    },
  ];

  const milestones = [
    {
      year: '2022',
      title: 'Company Founded',
      description: 'Started with a vision to solve agricultural waste management problems.',
    },
    {
      year: '2023',
      title: 'First 100 Users',
      description: 'Reached our first milestone of 100 registered farmers and buyers.',
    },
    {
      year: '2023',
      title: 'Series A Funding',
      description: 'Raised ₹5 crores in Series A funding to expand operations.',
    },
    {
      year: '2024',
      title: '1000+ Active Users',
      description: 'Crossed 1000 active users and processed over 10,000 tons of waste.',
    },
  ];

  const achievements = [
    { number: '1000+', label: 'Active Users' },
    { number: '10K+', label: 'Tons Processed' },
    { number: '₹50L+', label: 'Revenue Generated' },
    { number: '15+', label: 'States Covered' },
  ];

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-12 sm:py-16 lg:py-20">
        <div className="responsive-container">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <h1 className="responsive-title text-gray-900">
              About Waste2Wealth
            </h1>
            <p className="responsive-text text-gray-600 leading-relaxed">
              We are on a mission to transform agricultural waste management in India by creating 
              a sustainable marketplace that benefits farmers, industries, and the environment.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="responsive-container">
          <div className="responsive-grid-2 responsive-gap items-center">
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Target size={20} className="text-primary-600 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="responsive-subtitle text-gray-900">Our Mission</h2>
                </div>
                <p className="responsive-text text-gray-600 leading-relaxed">
                  To create a sustainable circular economy by connecting farmers with industries, 
                  transforming agricultural waste into valuable resources while generating additional 
                  income for farming communities and reducing environmental impact.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Eye size={20} className="text-secondary-600 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="responsive-subtitle text-gray-900">Our Vision</h2>
                </div>
                <p className="responsive-text text-gray-600 leading-relaxed">
                  To become India's leading platform for agricultural waste management, 
                  empowering millions of farmers to turn their waste into wealth while 
                  contributing to a cleaner and more sustainable future.
                </p>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <img
                src="/api/placeholder/600/400"
                alt="Agricultural sustainability"
                className="responsive-image rounded-2xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="responsive-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-subtitle text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="responsive-text text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="responsive-grid-4 responsive-gap">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="responsive-card text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon size={24} className="text-primary-600 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{value.title}</h3>
                  <p className="responsive-text-sm text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary-600">
        <div className="responsive-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-subtitle text-white mb-4">
              Our Achievements
            </h2>
            <p className="responsive-text text-primary-100 max-w-3xl mx-auto">
              Numbers that reflect our impact on the agricultural community
            </p>
          </div>

          <div className="responsive-stats responsive-gap">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2">{achievement.number}</div>
                <div className="text-primary-100 responsive-text-sm">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="responsive-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-subtitle text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="responsive-text text-gray-600 max-w-3xl mx-auto">
              Key milestones in our mission to transform agricultural waste management
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 sm:left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-primary-200" />

              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center mb-8 sm:mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  {/* Timeline dot */}
                  <div className="absolute left-3 sm:left-4 md:left-1/2 transform md:-translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center z-10">
                    <CheckCircle size={12} className="text-white sm:w-4 sm:h-4" />
                  </div>

                  {/* Content */}
                  <div className={`ml-12 sm:ml-16 md:ml-0 md:w-1/2 ${
                    index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                  }`}>
                    <div className="responsive-card-sm space-y-3">
                      <div className="text-primary-600 font-bold text-base sm:text-lg">{milestone.year}</div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{milestone.title}</h3>
                      <p className="responsive-text-sm text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="responsive-container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="responsive-subtitle text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="responsive-text text-gray-600 max-w-3xl mx-auto">
              The passionate individuals working to make agricultural waste management sustainable
            </p>
          </div>

          <div className="responsive-grid-4 responsive-gap">
            {team.map((member, index) => (
              <div key={index} className="responsive-card text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto object-cover"
                />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 font-medium responsive-text-sm">{member.role}</p>
                </div>
                <p className="responsive-text-sm text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="responsive-container">
          <div className="responsive-grid-2 responsive-gap items-center">
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <h2 className="responsive-subtitle text-gray-900">
                Our Environmental Impact
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe size={12} className="text-green-600 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Reduced Carbon Footprint</h3>
                    <p className="responsive-text-sm text-gray-600">Prevented burning of over 10,000 tons of agricultural waste, significantly reducing CO2 emissions.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp size={12} className="text-blue-600 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Economic Growth</h3>
                    <p className="responsive-text-sm text-gray-600">Generated over ₹50 lakhs in additional income for farming communities across India.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users size={12} className="text-purple-600 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Community Building</h3>
                    <p className="responsive-text-sm text-gray-600">Connected over 1000 farmers with industries, creating sustainable business relationships.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <img
                src="/api/placeholder/600/400"
                alt="Environmental impact"
                className="responsive-image rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;