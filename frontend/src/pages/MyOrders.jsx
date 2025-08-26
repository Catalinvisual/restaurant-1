import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_URL } from '../apiConfig';
import '../assets/styles/MyOrders.css';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('🔐 Token in MyOrders:', token);

    if (!token || token === 'undefined') {
      setMessage(
        <p className="cart-message warning">
          ❗ You must be logged in to view your orders.
        </p>
      );
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/api/orders/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const normalized = (res.data || []).map(order => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : []
        }));
        setOrders(normalized);
      })
      .catch((err) => {
        console.error('❌ Error loading your orders:', err);
        setMessage(
          <p className="cart-message error">
            ❌ Failed to retrieve orders.
          </p>
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your orders...</p>;

  return (
    <>
      <Header />

      <div className="container">
        <h2 className="my-orders-title">My Orders</h2>

        {message && <div>{message}</div>}

        {!message && orders.length === 0 && (
          <p className="cart-message warning">You have no recorded orders.</p>
        )}

        {orders.map((order) => {
          const orderTotal = order.items.reduce(
            (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
            0
          );

          const formattedDate = order.created_at
            ? new Date(order.created_at).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Date unavailable';

          return (
            <div key={order.id} className="card mb-4">
              <div className="card-header">
                <strong>Order #{order.id}</strong> – {formattedDate}
                <span className="badge bg-secondary float-end">{order.status}</span>
              </div>

              <div className="card-body">
                <p><strong>👤 Name:</strong> {order.customer_name || 'N/A'}</p>
                <p><strong>📍 Address:</strong> {order.address || 'N/A'}</p>
              </div>

              <ul className="list-group list-group-flush">
                {order.items.map((item, idx) => {
                  const product = item.product || {};
                  const imageSrc =
                    typeof product.image === 'string' &&
                    product.image.trim().startsWith('https://')
                      ? product.image
                      : 'https://via.placeholder.com/80?text=Image';

                  return (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={imageSrc}
                          alt={product.name || 'No image'}
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
                          <div className="fw-bold">{product.name}</div>
                          <small className="text-muted">{product.description}</small>
                        </div>
                      </div>

                      <div className="text-end">
                        <span>
                          {item.quantity} x €{Number(item.price).toFixed(2)}
                        </span>
                        <br />
                        <strong>
                          €{(Number(item.quantity) * Number(item.price)).toFixed(2)}
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
        })}
      </div>
    </>
  );
}
