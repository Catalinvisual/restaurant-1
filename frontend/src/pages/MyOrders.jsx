import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_URL } from '../apiConfig';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('🔐 Token în MyOrders:', token);

    if (!token || token === 'undefined') {
      setMessage('❗ Trebuie să fii autentificat pentru a vedea comenzile.');
      return;
    }

    axios
      .get(`${API_URL}/orders/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error('❌ Eroare la încărcarea comenzilor mele:', err);
        setMessage('❌ Nu s-au putut prelua comenzile.');
      });
  }, []);

  return (
    <>
      <Header />

      <div className="container mt-5">
        <h2 className="text-primary mb-4">Comenzile Mele</h2>

        {message && <div className="alert alert-info">{message}</div>}

        {orders.length === 0 ? (
          <p>Nu ai comenzi înregistrate.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card mb-4">
              <div className="card-header">
                <strong>Comandă #{order.id}</strong> – {order.date}
                <span className="badge bg-secondary float-end">{order.status}</span>
              </div>

              <ul className="list-group list-group-flush">
                {order.OrderItems.map((item, idx) => {
                  const product = item.Product;
                  const imageSrc = product?.image?.startsWith('http')
                    ? product.image
                    : 'https://via.placeholder.com/60x60';

                  return (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <img
                          src={imageSrc}
                          alt={product?.name || 'fără imagine'}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            marginRight: '10px',
                          }}
                        />
                        <div>
                          <div className="fw-bold">{product?.name}</div>
                          <small className="text-muted">{product?.description}</small>
                        </div>
                      </div>

                      <div className="text-end">
                        <span>{item.quantity} x €{item.price.toFixed(2)}</span><br />
                        <strong>€{(item.quantity * item.price).toFixed(2)}</strong>
                      </div>
                    </li>
                  );
                })}

                <li className="list-group-item text-end">
                  <strong>Total: €{order.total?.toFixed(2) || 'calculat pe client'}</strong>
                </li>
              </ul>
            </div>
          ))
        )}
      </div>
    </>
  );
}