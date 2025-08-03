import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/styles/Cart.css'; // poți muta stilul în Home.css dacă vrei

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();
  const [buying, setBuying] = useState(false);

  const handleBuyClick = () => {
    if (!product || !product.id) return;

    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
    toast.success(`${product.name || 'Produs'} a fost adăugat în coș! 🛒`, {
      position: 'top-right',
      autoClose: 2000
    });
    setBuying(true);
    setTimeout(() => setBuying(false), 1500);
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const imageSrc =
    product?.image?.startsWith('https://') && product.image.trim()
      ? product.image
      : 'https://via.placeholder.com/320x200?text=Fara+imagine';

  return (
    <div className="card m-3 shadow-sm position-relative" style={{ maxWidth: '320px' }}>
      {/* 🔖 Badge promoție/nou */}
      {product.isNew && (
        <span className="badge bg-success position-absolute top-0 start-0 m-2">Nou</span>
      )}
      {product.isPromo && (
        <span className="badge bg-danger position-absolute top-0 end-0 m-2">Promoție</span>
      )}

      <img
        src={imageSrc}
        className="card-img-top"
        alt={product.name || 'Item fără nume'}
        style={{
          height: '200px',
          objectFit: 'cover',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}
      />

      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h5 className="card-title text-primary mb-2">
            {product.name || 'Produs fără nume'}
          </h5>
          <p className="card-text small">
            {product.description || 'Fără descriere disponibilă.'}
          </p>
          <p className="card-text fw-bold mt-2">
            €{Number(product.price || 0).toFixed(2)}
          </p>

          {/* ⭐ Rating fake pentru Home */}
          {product.rating && (
            <div className="text-warning small">
              {'★'.repeat(Math.round(product.rating))}{' '}
              <span className="text-muted">({product.rating.toFixed(1)})</span>
            </div>
          )}

          {/* 🔍 Detalii produs */}
          {product.link && (
            <a href={product.link} className="btn btn-outline-primary btn-sm mt-2">
              Detalii produs
            </a>
          )}
        </div>

        {product.id !== 'preview' && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-2"
                onClick={handleDecrement}
              >
                −
              </button>
              <span className="mx-2">{quantity}</span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-2"
                onClick={handleIncrement}
              >
                +
              </button>
            </div>

            <button
              className="btn btn-success btn-sm"
              onClick={handleBuyClick}
              disabled={buying}
            >
              {buying ? '✔ Adăugat!' : 'Adaugă în coș'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;