import React from 'react';

const ProductCard = ({ title, img }) => {
  return (
    <div className="flex flex-col items-center text-center p-2 border rounded-md bg-yellow-50 hover:shadow">
      <img src={img} alt={title} className="w-full h-24 object-contain mb-2" />
      <span className="text-xs font-medium">{title}</span>
    </div>
  );
};

export default ProductCard;
