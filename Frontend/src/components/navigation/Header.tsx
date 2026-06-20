import { Link } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="header">
        <div className="header-container">
          <button 
            className="burger-button" 
            onClick={toggleMenu}
            aria-label="Меню"
          >
            <span className={`burger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`burger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`burger-line ${isMenuOpen ? 'open' : ''}`}></span>
          </button>

          <Link to="/" className="header-logo">
            <span className="header-logo-icon">🎩</span>
            <div className="header-logo-text">
              <span className="header-logo-title">MAFIA</span>
              <span className="header-logo-subtitle">ONLINE</span>
            </div>
          </Link>

          <div style={{ width: 40 }}></div>
        </div>
      </header>

      <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />
      {isMenuOpen && <div className="overlay" onClick={closeMenu}></div>}
    </>
  );
}