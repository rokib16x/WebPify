import { ImageIcon } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [showAbout, setShowAbout] = useState(false);

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  return (
    <header className="bg-white border-b border-[#f3f3f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <ImageIcon className="h-8 w-8 text-[#0267ff]" />
            <span className="ml-2 text-xl font-semibold text-[#2c2d2a] font-sans">WebPify</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-[#0267ff] hover:text-[#0255ff] font-medium">
              Home
            </a>
            <button 
              onClick={toggleAbout}
              className="text-[#6b7280] hover:text-[#2c2d2a] font-medium"
            >
              About
            </button>
          </nav>
          <button className="bg-[#0267ff] text-white px-4 py-2 rounded-lg hover:bg-[#0255ff] transition-colors font-medium">
            Feel Free To Use
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pb-5 text-center">
        <h1 className="text-4xl font-bold text-[#2c2d2a] mb-4 font-sans">WebP Image Converter</h1>
        <p className="text-[#6b7280] max-w-5xl mx-auto leading-relaxed">
          Convert your images to WebP format and reduce file size by up to 80% while maintaining high quality. 
          WebP offers superior compression and quality compared to traditional formats like JPEG and PNG.
        </p>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button 
              onClick={toggleAbout}
              className="absolute top-4 right-4 text-[#6b7280] hover:text-[#2c2d2a] text-xl"
            >
              ×
            </button>
            
            <div className="text-center mb-4">
              <div className="flex justify-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Root9 Solutions" 
                  className="h-24 w-24 object-cover rounded-full border-4 border-[#0267ff]"
                />
              </div>
              <h3 className="text-xl font-bold text-[#2c2d2a]">About WebPify</h3>
              <p className="text-sm text-[#6b7280] mt-1">A product of Root9 Solutions</p>
            </div>
            
            <p className="text-[#2c2d2a] text-sm leading-relaxed mb-4">
              Root9 Solutions is a forward-thinking technology company dedicated to delivering innovative solutions 
              that meet the evolving needs of businesses. We specialize in tools that enhance efficiency and enable 
              digital transformation.
            </p>
            
            <div className="flex justify-center space-x-4 mt-6">
              <a href="#" className="text-[#0267ff] hover:underline text-sm">Website</a>
              <a href="#" className="text-[#0267ff] hover:underline text-sm">Contact</a>
              <a href="#" className="text-[#0267ff] hover:underline text-sm">Privacy Policy</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;