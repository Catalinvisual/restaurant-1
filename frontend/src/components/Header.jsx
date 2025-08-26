import { NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import '../assets/styles/Header.css';
import { FaUserCircle } from 'react-icons/fa';

export default function Header() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);
  const handleLinkClick = () => setIsCollapsed(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 60) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollY = window.scrollY;
    };

    const onScroll = () => requestAnimationFrame(handleScroll);
    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const token = localStorage.getItem('accessToken');

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top transparent-header ${
        isHidden ? 'hidden' : ''
      }`}
    >
      <div className="container">
        <NavLink
          className={({ isActive }) =>
            `navbar-brand text-white ${isActive ? 'active' : ''}`
          }
          to="/"
          onClick={handleLinkClick}
        >
          Restaurant
        </NavLink>
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

        <div
          className={`collapse navbar-collapse ${
            !isCollapsed ? 'show' : ''
          }`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? 'active' : ''}`
                }
                onClick={handleLinkClick}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/menu"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? 'active' : ''}`
                }
                onClick={handleLinkClick}
              >
                Menu
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? 'active' : ''}`
                }
                onClick={handleLinkClick}
              >
                Cart
              </NavLink>
            </li>
            {token && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/my-orders"
                    className={({ isActive }) =>
                      `nav-link text-white ${isActive ? 'active' : ''}`
                    }
                    onClick={handleLinkClick}
                  >
                    My Orders
                  </NavLink>
                </li>
                <li className="nav-item">{/* Reserved for future links */}</li>
              </>
            )}
            <li className="nav-item login-icon">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `nav-link text-white d-flex align-items-center justify-content-center ${
                    isActive ? 'active' : ''
                  }`
                }
                onClick={handleLinkClick}
              >
                <FaUserCircle size={24} />
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
