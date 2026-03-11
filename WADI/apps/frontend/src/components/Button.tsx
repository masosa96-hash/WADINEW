import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-wadi-accent-end/50 inline-flex items-center justify-center";
  
  const variants = {
    primary: "bg-wadi-black text-white hover:bg-wadi-gray-900",
    secondary: "bg-wadi-card text-wadi-gray-100 hover:bg-wadi-card/80",
    outline: "border border-wadi-gray-300 text-wadi-gray-700 hover:bg-wadi-gray-100 hover:border-wadi-gray-400",
    ghost: "text-wadi-gray-700 hover:bg-wadi-gray-100"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${props.className || ''}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
