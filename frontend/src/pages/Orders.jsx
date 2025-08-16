import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../apiConfig';
import { getToken, isAdmin } from '../utils/auth';
import '../assets/styles/Orders.css';
import OrderCard from '../components/OrderCard'; // ✅ Import adăugat

export default function Orders({ onOrderUpdated }) {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setMessage('❗ Trebuie să fii autentificat pentru a vedea comenzile.');
      setLoading(false);
      return;
    }

    if (!isAdmin()) {
      setMessage('⛔ Acces interzis. Doar adminii pot vedea această pagină.');
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setOrders(res.data))
      .catch(err => {
        const status = err?.response?.status;
        if (status === 401) {
          setMessage('🔒 Autentificare necesară.');
        } else if (status === 403) {
          setMessage('⛔ Doar adminii pot accesa comenzile.');
        } else {
          setMessage('❌ Nu s-au putut prelua comenzile.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    console.log('PUT ▶', orderId, newStatus); // log frontend
    const token = getToken();

    if (!isAdmin()) {
      setMessage('⛔ Doar adminii pot schimba statusul comenzilor.');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrder = response.data;
      const updatedOrders = orders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      );

      setOrders(updatedOrders);

      if (typeof onOrderUpdated === 'function') {
        onOrderUpdated();
      }
    } catch (error) {
      setMessage('❌ Eroare la actualizarea statusului comenzii.');
    }
  };

  return (
    <div className="orders-list">
      {loading && <p>Se încarcă comenzile...</p>}

      {!loading && message && (
        <div className="alert alert-warning">{message}</div>
      )}

      {!loading && !message && orders.length === 0 && (
        <p>Nu există comenzi înregistrate.</p>
      )}

      {!loading && !message && orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="card-header">
            <strong>Comandă #{order.id}</strong>
            <span className={`status-badge ${order.status}`}>{order.status}</span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              className="form-select w-auto ms-2"
            >
              <option value="pending">În așteptare</option>
              <option value="confirmed">Confirmată</option>
              <option value="shipped">În curs de livrare</option>
              <option value="delivered">Livrat</option>
              <option value="cancelled">Anulat</option>
            </select>
          </div>

          <div className="card-body">
            <p><strong>👤 Client:</strong> {order.customer_name || 'N/A'}</p>
            <p><strong>📍 Adresă:</strong> {order.address || 'N/A'}</p>
          </div>

          <ul className="list-group list-group-flush">
            {order.OrderItems?.map((item, idx) => (
              <li key={idx} className="list-group-item">
                <span className="product-desc">
                  {item.Product?.name || 'Produs'} x {item.quantity}
                </span>
                <span className="product-price">
                  €{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </span>
              </li>
            ))}
            <li className="list-group-item text-end">
              <strong>Total: €{Number(order.total_price).toFixed(2)}</strong>
            </li>
          </ul>
        </div>
      ))}

      {/* ✅ Exemplu de folosire OrderCard în paralel */}
      {!loading && !message && orders.map(order => (
        <OrderCard
          key={`card-${order.id}`}
          order={order}
          handleStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
