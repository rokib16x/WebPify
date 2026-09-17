import { Sun } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [showAbout, setShowAbout] = useState(false);

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  return (
    <>
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
    </header>

      {showAbout && (
        <div className="about-overlay" onClick={toggleAbout}>
          <div className="about-dialog" onClick={(event) => event.stopPropagation()}>
            <button
              onClick={toggleAbout}
              className="about-close"
              aria-label="Close about dialog"
            >
              ×
            </button>

            <div className="text-center mb-5">
              <img src="/webpify.png" alt="WebPify" className="about-logo" />
              <h3 className="text-xl font-extrabold text-[#172033]">
                About WebPify
              </h3>
              <p className="text-sm text-[#788396] mt-1">
                Built by Rokib
              </p>
            </div>

            <p className="text-[#4e5a6d] text-sm leading-relaxed mb-5 text-center">
              WebPify is a fast, privacy-friendly image converter built to make
              image optimization simple.
            </p>

            <div className="flex justify-center">
              <a
                href="https://rokib.dev"
                target="_blank"
                rel="noreferrer"
                className="about-link"
              >
                Visit rokib.dev
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
