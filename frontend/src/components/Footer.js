import React from 'react';
import '../assets/styles/Footer.css'; // Stiluri personalizate

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row">

          {/* Adresă */}
          <div className="col-md-4 mb-4">
            <h5>📍 Adresă</h5>
            <p>
              Str. Gustului nr. 10<br />
              Luttelgeest, NL 8309<br />
              Tel: +31 612 345 678
            </p>
          </div>

          {/* Formular Contact */}
          <div className="col-md-4 mb-4">
            <h5>✉️ Contactează-ne</h5>
            <form className="contact-form">
              <input type="text" className="form-control mb-2" placeholder="Nume" />
              <input type="email" className="form-control mb-2" placeholder="Email" />
              <textarea className="form-control mb-2" rows="3" placeholder="Mesajul tău" />
              <button type="submit" className="btn btn-outline-light btn-sm">Trimite</button>
            </form>
          </div>

          {/* Social Media */}
          <div className="col-md-4 mb-4">
            <h5>🌐 Social Media</h5>
            <ul className="list-unstyled d-flex gap-3">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link">Instagram</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link">Twitter</a></li>
            </ul>
          </div>

        </div>

        {/* Drepturi */}
        <div className="text-center mt-3">
          <p>&copy; {new Date().getFullYear()} Restaurantul Meu. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;