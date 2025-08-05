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

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setMessage('❌ Coșul este gol. Adaugă produse înainte de a comanda.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Dacă folosești token: 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, address, items: cartItems, total }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Comandă trimisă:', result);
        setMessage('✅ Comanda ta a fost plasată cu succes!');
        setName('');
        setAddress('');
        dispatch({ type: 'CLEAR_CART' });
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || '❌ Eroare la trimiterea comenzii.');
      }
    } catch (error) {
      console.error('❌ Eroare conexiune:', error);
      setMessage('Serverul nu răspunde. Încearcă mai târziu.');
    }
  };

  return (
    <>
      <Header />

      <div className="container mt-5">
        <h2 className="text-primary mb-4">Finalizare comandă</h2>
        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nume</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Adresă de livrare</label>
            <textarea
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            ></textarea>
          </div>

          <h4 className="mt-4">🧾 Sumar comandă</h4>
          <ul className="list-group mb-3">
            {cartItems.map((item) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
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
                  {(item.price * item.quantity).toLocaleString('ro-RO', {
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
              {total.toLocaleString('ro-RO', {
                style: 'currency',
                currency: 'EUR',
              })}
            </strong>
          </div>

          <button type="submit" className="btn btn-success w-100">
            ✅ Confirmă comanda
          </button>
        </form>
      </div>
    </>
  );
}