import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../assets/styles/Cart.css';
import Header from '../components/Header';
import { API_URL } from '../apiConfig';

export default function Cart() {
  const { cartItems, dispatch } = useCart();
  const [message, setMessage] = useState('');

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleRemove = (index) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest produs?')) {
      dispatch({ type: 'REMOVE_BY_INDEX', payload: index });
    }
  };

  const handleQuantityChange = (index, newQty) => {
    if (newQty < 1) return;
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { index, quantity: newQty },
    });
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Dacă folosești token: Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ items: cartItems, total }),
      });

      if (response.ok) {
        setMessage('✅ Comanda a fost înregistrată!');
        dispatch({ type: 'CLEAR_CART' });
      } else {
        const error = await response.json();
        setMessage(error.message || '❌ Eroare la plasarea comenzii');
      }
    } catch (err) {
      console.error('❌ Eroare de rețea:', err);
      setMessage('Serverul nu răspunde.');
    }
  };

  return (
    <>
      <Header />

      <div className="container mt-5">
        <h2 className="text-primary mb-4">Coșul meu de cumpărături</h2>

        {message && <div className="alert alert-info">{message}</div>}

        {cartItems.length === 0 ? (
          <p>Coșul este gol.</p>
        ) : (
          <>
            <ul className="list-group">
              {cartItems.map((item, index) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={index}
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={item.image || 'https://via.placeholder.com/60?text=Imagine'}
                      alt={item.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        marginRight: '15px',
                      }}
                    />
                    <div>
                      <h5 className="mb-1">{item.name}</h5>
                      <div className="d-flex align-items-center mb-2">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => handleQuantityChange(index, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary ms-2"
                          onClick={() => handleQuantityChange(index, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <p className="mb-0">
                        Preț:{' '}
                        <strong>
                          {(item.price * item.quantity).toLocaleString('ro-RO', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleRemove(index)}
                  >
                    Șterge
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-end">
              <h4>
                Total:{' '}
                {total.toLocaleString('ro-RO', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </h4>
              <button className="btn btn-success mt-3" onClick={handleCheckout}>
                Plată la livrare
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}