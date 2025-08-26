import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../assets/styles/Cart.css';
import Header from '../components/Header';
import { API_URL } from '../apiConfig';

export default function Checkout() {
  const { cartItems, dispatch } = useCart();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [lastOrderTotal, setLastOrderTotal] = useState(null);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken');
    console.log('🔐 Token:', token); // DEBUG

    if (!token || token === 'undefined') {
      setMessage('❗ Token is missing or invalid. Please log in.');
      return;
    }

    if (cartItems.length === 0) {
      setMessage('❌ Your cart is empty. Add items before placing an order.');
      return;
    }

    const itemsPayload = cartItems.map(item => ({
      product_id: item.id, // matches backend
      quantity: Number(item.quantity),
      price: Number(item.price) // force numeric
    }));

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: name.trim(),
          address: address.trim(),
          items: itemsPayload,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Order submitted:', result);

        // store total from response
        setLastOrderTotal(result.order?.total_price || null);

        setMessage(`✅ Your order has been placed successfully!`);
        setName('');
        setAddress('');
        dispatch({ type: 'CLEAR_CART' });
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || '❌ Error submitting order.');
      }
    } catch (error) {
      console.error('❌ Connection error:', error);
      setMessage('❌ Server is not responding. Please try again later.');
    }
  };

  return (
    <>
      <Header />
      <div className="container mt-5">
        <h2 className="text-primary mb-4">Checkout</h2>

        {message && (
          <div className="alert alert-info">
            {message}
            {lastOrderTotal !== null && (
              <div><strong>Order Total: </strong>€{Number(lastOrderTotal).toFixed(2)}</div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Delivery Address</label>
            <textarea
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            ></textarea>
          </div>

          <h4 className="mt-4">🧾 Order Summary</h4>
          <ul className="list-group mb-3">
            {cartItems.map((item) => (
              <li
                className="list-group-item d-flex justify-content-between align-items-center"
                key={item.id}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={item.image || 'https://via.placeholder.com/40?text=Img'}
                    alt={item.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginRight: '10px',
                    }}
                  />
                  <span>{item.name} x {item.quantity}</span>
                </div>
                <span>
                  {(item.price * item.quantity).toLocaleString('en-GB', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </li>
            ))}
          </ul>

          <div className="mb-3 text-end">
            <strong>
              Total:{' '}
              {total.toLocaleString('en-GB', {
                style: 'currency',
                currency: 'EUR',
              })}
            </strong>
          </div>

          <button type="submit" className="btn btn-success w-100">
            ✅ Confirm Order
          </button>
        </form>
      </div>
    </>
  );
}
