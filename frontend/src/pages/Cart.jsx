import React from 'react';
import { useCart } from '../context/CartContext';
import '../assets/styles/Cart.css';

export default function Cart() {
  const { cartItems, dispatch } = useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleRemove = (index) => {
    dispatch({ type: 'REMOVE_BY_INDEX', payload: index });
  };

  const handleQuantityChange = (index, newQty) => {
    if (newQty < 1) return;
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { index, quantity: newQty },
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4">Coșul meu de cumpărături</h2>

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
                <div>
                  <h5>{item.name}</h5>
                  <div className="d-flex align-items-center mb-2">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() =>
                        handleQuantityChange(index, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() =>
                        handleQuantityChange(index, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <p className="mb-0">
                    Preț: <strong>€{(item.price * item.quantity).toFixed(2)}</strong>
                  </p>
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
            <h4>Total: €{total.toFixed(2)}</h4>
            <button className="btn btn-success mt-3">Plată la livrare</button>
          </div>
        </>
      )}
    </div>
  );
}