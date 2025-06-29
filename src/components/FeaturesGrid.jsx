import React from 'react';

const features = [
  {
    title: 'Selection',
    description: 'Choose from more than 13 million titles including classics and new releases.',
    icon: '📚'
  },
  {
    title: 'Purchasing Power',
    description: 'Get notified when rare titles appear or go on sale.',
    icon: '💰'
  },
  {
    title: 'Used & New Books',
    description: 'Buy used, new, or recycled books with confidence.',
    icon: '🔄'
  },
  {
    title: 'Shipping & More',
    description: 'Free delivery on qualifying orders, directly to your door.',
    icon: '🚚'
  }
];

const FeaturesGrid = () => {
  return (
    <div className="bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {features.map((feature, idx) => (
          <div key={idx} className="flex flex-col items-center space-y-3">
            <div className="text-5xl">{feature.icon}</div>
            <h3 className="font-bold text-lg">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesGrid;
