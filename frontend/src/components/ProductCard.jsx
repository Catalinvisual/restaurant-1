import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../assets/styles/Cart.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BASE_URL = 'http://localhost:3001'; // 🔁 Poți folosi process.env.REACT_APP_API_URL

export default function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();
  const [buying, setBuying] = useState(false);

  const handleBuyClick = () => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
    toast.success(`${product.name || 'Produs'} a fost adăugat în coș! 🛒`, {
      position: 'top-right',
      autoClose: 2000,
    });
    setBuying(true);
    setTimeout(() => setBuying(false), 1500);
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // 🖼️ Sursă imagine cu fallback și normalizare
  let imageSrc = 'https://via.placeholder.com/180?text=Fără+imagine';
  if (product.image && typeof product.image === 'string') {
    try {
      imageSrc = product.image.startsWith('http')
        ? product.image
        : new URL(product.image, BASE_URL).href;
    } catch {
      // dacă URL-ul nu e valid, păstrează fallback
    }
  }

  return (
    <div className="card m-3 shadow-sm" style={{ width: '18rem' }}>
      <img
        src={imageSrc}
        className="card-img-top"
        alt={product.name || 'Item fără nume'}
        style={{ height: '180px', objectFit: 'cover', borderRadius: '8px' }}
      />
      <div className="card-body">
        <h5 className="card-title text-primary">{product.name || 'Produs fără nume'}</h5>
        <p className="card-text">{product.description || 'Fără descriere disponibilă.'}</p>
        <p className="card-text fw-bold">€{Number(product.price).toFixed(2)}</p>

        {/* 🔄 Ascundem butoanele dacă e previzualizare */}
        {product.id !== 'preview' && (
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleDecrement}
              >
                −
              </button>
              <span className="mx-3">{quantity}</span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleIncrement}
              >
                +
              </button>
            </div>

            <button className="btn btn-success" onClick={handleBuyClick}>
              {buying ? '✔ Adăugat!' : 'Adaugă în coș'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}