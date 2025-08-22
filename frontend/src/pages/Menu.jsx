import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import '../assets/styles/Menu.css';
import { API_URL } from '../apiConfig';
import '../assets/styles/ProductCard.css';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    fetch(`${API_URL}/menu`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          setFilteredProducts(data);
        } else {
          setProducts([]);
          setFilteredProducts([]);
          setMessage('⚠️ Nu s-au putut încărca produsele.');
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setFilteredProducts([]);
        setMessage('❌ Eroare de conexiune cu serverul.');
        setLoading(false);
      });
  }, []);

  const handleFilter = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.category?.toLowerCase() === category
      );
      setFilteredProducts(filtered);
    }
  };

  return (
    <>
      <BannerSection />

      <div className="container pt-2">
        <h2 className="text-center mb-3">Meniu</h2>


        <div className="filter-buttons text-center mb-4">
          <button
            className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleFilter('all')}
          >
            Toate
          </button>
          <button
            className={`filter-btn ${activeCategory === 'mancare' ? 'active' : ''}`}
            onClick={() => handleFilter('mancare')}
          >
            🥘 Mâncăruri
          </button>
          <button
            className={`filter-btn ${activeCategory === 'bautura' ? 'active' : ''}`}
            onClick={() => handleFilter('bautura')}
          >
            🍹 Băuturi
          </button>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="table-loader">
              <div className="food"></div>
              <div className="steam"></div>
              <div className="steam delay"></div>
              <div className="steam delay2"></div>
              <div className="cutlery fork">🍴</div>
              <div className="cutlery knife">🔪</div>
            </div>
            <p className="text-muted mt-3">Gătim cu grijă pentru tine...</p>
          </div>
        ) : message ? (
          <div className="alert alert-warning text-center">{message}</div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-muted text-center">Nu există produse în această categorie.</p>
        ) : (
          <div className="card-container">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function BannerSection() {
  const defaultUrl = '/assets/images/signeture-bg.jpg';
  const fallbackUrl = 'https://via.placeholder.com/1600x900?text=Banner+Unavailable';
  const [bgUrl, setBgUrl] = React.useState(defaultUrl);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => setBgUrl(defaultUrl);
    img.onerror = () => setBgUrl(fallbackUrl);
    img.src = defaultUrl;
  }, []);


  return (
   <div className="menu-banner-fullscreen">
  <img
    src="/assets/images/signeture-bg.jpg"
    alt="Banner Signeture"
    className="banner-img"
    onError={(e) => {
      e.target.src = 'https://via.placeholder.com/1600x900?text=Banner+Unavailable';
    }}
  />
  <h2 className="banner-title">Every Plate Tells a Story</h2>
</div>

  );
}