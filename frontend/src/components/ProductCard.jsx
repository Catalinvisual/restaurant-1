import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../assets/styles/Cart.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();
  const [buying, setBuying] = useState(false);

  const handleBuyClick = () => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
    toast.success(`${product.name} a fost adăugat în coș! 🛒`, {
      position: 'top-right',
      autoClose: 2000,
    });
    setBuying(true);
    setTimeout(() => setBuying(false), 1500);
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const imageSrc = product.imageUrl.startsWith('/uploads/')
    ? `http://localhost:3001${product.imageUrl}`
    : product.imageUrl;

  return (
    <div className="card m-3 shadow-sm" style={{ width: '18rem' }}>
      <img
        src={imageSrc}
        className="card-img-top"
        alt={product.name}
        style={{ height: '180px', objectFit: 'cover' }}
      />
      <div className="card-body">
        <h5 className="card-title text-primary">{product.name}</h5>
        <p className="card-text">{product.description}</p>
        <p className="card-text fw-bold">€{product.price.toFixed(2)}</p>

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
            {buying ? '✔ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}