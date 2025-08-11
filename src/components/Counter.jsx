import { useState, useEffect } from 'react';
import { TrendingUp, Shield, Zap } from 'lucide-react';

const Counter = ({ count, isLoading = false }) => {
  const [displayCount, setDisplayCount] = useState(count);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (count !== displayCount) {
      setIsUpdating(true);
      setDisplayCount(count);
      
      // Remove updating state after animation
      const timer = setTimeout(() => setIsUpdating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [count, displayCount]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            {/* Main counter with icon */}
            <div className="flex items-center justify-center space-x-3">
              <TrendingUp className="w-7 h-7 text-blue-500 animate-pulse" />
              <div className="flex items-center space-x-3 text-xl text-gray-700">
                <span className="font-medium">Helping creators convert over</span>
                <div className="w-24 h-12 bg-gray-200 rounded animate-pulse"></div>
                <span className="font-medium">images to WebP</span>
              </div>
            </div>
            
            {/* Subtitle */}
            <div className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              — and we're just getting started! Here at WebPify, we don't store any data, we just convert your photos.
            </div>
            
            {/* Feature highlights */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/70 hover:scale-105">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="font-medium">Privacy-focused</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/70 hover:scale-105">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="font-medium">No data storage</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/70 hover:scale-105">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Instant conversion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6">
          {/* Main counter with icon */}
          <div className="flex items-center justify-center space-x-3">
            <TrendingUp className="w-7 h-7 text-blue-500 animate-pulse" />
            <div className="flex items-center space-x-3 text-xl text-gray-700">
              <span className="font-medium">Helping creators convert over</span>
              <span 
                className={`font-bold text-4xl text-blue-600 transition-all duration-500 ${
                  isUpdating ? 'scale-110 text-blue-700 drop-shadow-lg' : ''
                }`}
              >
                {displayCount.toLocaleString()}
              </span>
              <span className="font-medium">images to WebP</span>
            </div>
          </div>
          
          {/* Subtitle */}
          <div className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            — and we're just getting started! Here at WebPify, we don't store any data, we just convert your photos.
          </div>
          
          {/* Feature highlights */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/70 hover:scale-105">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="font-medium">Privacy-focused</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/70 hover:scale-105">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="font-medium">No data storage</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/70 hover:scale-105">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">Instant conversion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counter;
