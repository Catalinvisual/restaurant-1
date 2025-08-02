import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../assets/styles/Cart.css'; // Assuming you have some styles for the cart
export default function Checkout() {
  const { cartItems } = useCart();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulează trimiterea comenzii
    console.log('Comandă trimisă:', { name, address, cartItems });
    setMessage('Comanda ta a fost plasată cu succes!');
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4">Finalizare comandă</h2>
      {message && <div className="alert alert-success">{message}</div>}

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

        <h4 className="mt-4">Sumar comandă</h4>
        <ul className="list-group mb-3">
          {cartItems.map((item) => (
            <li className="list-group-item d-flex justify-content-between" key={item.id}>
              <span>{item.name} x {item.quantity}</span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="mb-3 text-end">
          <strong>Total: €{total.toFixed(2)}</strong>
        </div>

        <button type="submit" className="btn btn-success w-100">
          Confirmă comanda
        </button>
      </form>
    </div>
  );
}