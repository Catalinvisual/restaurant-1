import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../assets/styles/Menu.css';

export default function Menu() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;
    console.log('🌐 Valoarea API_URL este:', API_URL);

    fetch(`${API_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('❌ Eroare la preluarea produselor:', err));
  }, []);

  return (
    <>
      {/* 🔽 Banner fullscreen sub Header */}
      <div className="menu-banner-fullscreen">
        <img
          src="/assets/images/signeture-bg.jpg"
          alt="Banner Signeture"
          className="banner-img"
        />
      </div>

      {/* 🔽 Conținutul paginii */}
      <div className="container pt-2">
        <h2 className="text-primary text-center mb-3">Meniu</h2>

        <div className="row">
          {products.length === 0 && (
            <p className="text-muted text-center">Nu există produse disponibile.</p>
          )}

          {products.map((product) => (
            <div key={product.id} className="col-md-4">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}