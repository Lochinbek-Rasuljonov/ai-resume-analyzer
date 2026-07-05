import React from 'react';

export const Logo: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <img 
      src="/logo.png" 
      alt="AI Resume Analyzer Logo" 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: size * 0.2, // Gives it an Apple-like rounded rectangle look
        objectFit: 'cover',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }} 
    />
  );
};
