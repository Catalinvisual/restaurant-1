import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import '../assets/styles/Header.css';
import { FaUserCircle } from 'react-icons/fa';

export default function Header() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLinkClick = () => {
    setIsCollapsed(true); // Închide meniul la click pe link
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');

    const handleScroll = () => {
      if (!navbar) return;

      if (window.scrollY > lastScrollY && window.scrollY > 60) {
        // Scroll în jos — ascundem navbar-ul
        navbar.classList.add('hidden');
      } else {
        // Scroll în sus — îl arătăm
        navbar.classList.remove('hidden');
      }

      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg fixed-top transparent-header">
      <div className="container">
        <Link className="navbar-brand text-white" to="/" onClick={handleLinkClick}>Restaurant</Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link text-white" to="/" onClick={handleLinkClick}>Home</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/menu" onClick={handleLinkClick}>Meniu</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/cart" onClick={handleLinkClick}>Coș</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/my-orders" onClick={handleLinkClick}>Comenzile mele</Link></li>
            <li className="nav-item"><Link className="nav-link text-white" to="/orders" onClick={handleLinkClick}>Toate comenzile</Link></li>
            <li className="nav-item">
              <Link className="nav-link text-white d-flex align-items-center" to="/login" onClick={handleLinkClick}>
                <FaUserCircle size={24} />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}