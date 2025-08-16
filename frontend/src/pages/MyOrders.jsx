import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_URL } from '../apiConfig';
import '../assets/styles/MyOrders.css';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('🔐 Token în MyOrders:', token);

    if (!token || token === 'undefined') {
      setMessage(
        <p className="cart-message warning">
          ❗ Trebuie să fii autentificat pentru a vedea comenzile.
        </p>
      );
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
        setMessage(
          <p className="cart-message error">
            ❌ Nu s-au putut prelua comenzile.
          </p>
        );
      });
  }, []);

  return (
    <>
      <Header />

      <div className="container">
        <h2 className="my-orders-title">Comenzile Mele</h2>

        {message && <div>{message}</div>}

        {orders.length === 0 ? (
          <p className="cart-message warning">Nu ai comenzi înregistrate.</p>
        ) : (
          orders.map((order) => {
            const orderTotal = order.OrderItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0
            );

            const formattedDate = new Date(order.created_at).toLocaleDateString('ro-RO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div key={order.id} className="card mb-4">
                <div className="card-header">
                  <strong>Comandă #{order.id}</strong> – {formattedDate}
                  <span className="badge bg-secondary float-end">{order.status}</span>
                </div>

                <div className="card-body">
                  <p><strong>👤 Nume:</strong> {order.customer_name || 'N/A'}</p>
                  <p><strong>📍 Adresă:</strong> {order.address || 'N/A'}</p>
                </div>

                <ul className="list-group list-group-flush">
                  {order.OrderItems.map((item, idx) => {
                    const product = item.Product;

                    const imageSrc =
                      typeof product?.image === 'string' &&
                      product.image.trim().startsWith('https://')
                        ? product.image
                        : 'https://via.placeholder.com/80?text=Imagine';

                    return (
                      <li
                        key={idx}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div className="d-flex align-items-center">
                          <img
                            src={imageSrc}
                            alt={product?.name || 'Fără imagine'}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              marginRight: '10px',
                            }}
                            loading="lazy"
                          />
                          <div>
                            <div className="fw-bold">{product?.name}</div>
                            <small className="text-muted">{product?.description}</small>
                          </div>
                        </div>

                        <div className="text-end">
                          <span>
                            {item.quantity} x €{item.price.toFixed(2)}
                          </span>
                          <br />
                          <strong>
                            €{(item.quantity * item.price).toFixed(2)}
                          </strong>
                        </div>
                      </li>
                    );
                  })}

                  <li className="list-group-item text-end">
                    <strong>Total: €{orderTotal.toFixed(2)}</strong>
                  </li>
                </ul>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
