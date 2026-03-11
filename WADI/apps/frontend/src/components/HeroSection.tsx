import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const HeroSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-20 bg-white min-h-[80vh]">
      <span className="bg-wadi-gray-100 text-wadi-accent-start font-wadi-mono text-xs px-3 py-1 rounded-full mb-6 uppercase tracking-widest border border-wadi-gray-300 shadow-sm">
        Autonomous Venture Studio
      </span>
      
      <h1 className="text-5xl md:text-7xl font-bold font-wadi-sans leading-tight text-wadi-gray-900 mb-6 max-w-4xl tracking-tight">
        Turn ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-wadi-accent-start to-wadi-accent-end">evolving startups.</span>
      </h1>
      
      <p className="text-lg md:text-xl text-wadi-gray-500 max-w-2xl mb-12 font-wadi-sans leading-relaxed">
        Stop writing boilerplate. Wadi generates your startup, deploys the code, 
        monitors metrics, and codes revenue-generating features automatically.
      </p>
      
      <Link to="/register">
        <Button variant="primary" className="flex items-center gap-2 group text-base px-8 py-4 shadow-xl hover:shadow-2xl hover:-translate-y-1">
          Get Started
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Button>
      </Link>
    </div>
  );
};

export default HeroSection;
