import { Sun } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [showAbout, setShowAbout] = useState(false);

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  return (
    <header className="app-header">
      <a href="/" className="app-logo" aria-label="WebPify home">
        <img src="/webpify.png" alt="WebPify" />
      </a>

      <nav className="header-nav">
        <a href="#" className="header-nav-active">Home</a>
        <button onClick={toggleAbout}>About</button>
      </nav>

      <div className="flex items-center gap-5">
        <button type="button" className="theme-button" aria-label="Toggle theme">
          <Sun size={18} strokeWidth={1.6} />
        </button>
        <button className="primary-header-button">
          Feel Free To Use
        </button>
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
              <h3 className="text-xl font-bold text-[#2c2d2a]">
                About WebPify
              </h3>
              <p className="text-sm text-[#6b7280] mt-1">
                Built by Rokib
              </p>
            </div>

            <p className="text-[#2c2d2a] text-sm leading-relaxed mb-4 text-center">
              WebPify is a fast, privacy-friendly image converter built to make
              image optimization simple.
            </p>

            <div className="flex justify-center space-x-4 mt-6">
              <a
                href="https://rokib.dev"
                target="_blank"
                rel="noreferrer"
                className="text-[#0267ff] hover:underline text-sm"
              >
                Visit rokib.dev
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
