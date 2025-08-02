import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../assets/styles/Menu.css';

export default function Menu() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // 📦 Folosește variabila de mediu pentru a accesa backend-ul
    const API_URL = process.env.REACT_APP_API_URL;
    console.log("🌐 Valoarea API_URL este:", API_URL);

    fetch(`${API_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) =>
        console.error('❌ Eroare la preluarea produselor:', err)
      );
  }, []);

  return (
    <>
      {/* 🔽 Imaginea fullscreen sub Header */}
      <div className="menu-banner-fullscreen">
        <img
          src="/assets/images/rest.jpg"
          alt="Banner Restaurant"
          className="banner-img"
        />
      </div>

      {/* 🔽 Conținutul paginii */}
      <div className="container mt-5">
        <h2 className="text-primary mb-4">Meniu</h2>
        <div className="row">
          {products.length === 0 && (
    <p className="text-muted">Nu există produse disponibile.</p>
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