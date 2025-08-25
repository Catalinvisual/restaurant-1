import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../apiConfig';
import { getToken, isAdmin } from '../utils/auth';
import '../assets/styles/Orders.css';

export default function Orders({ onOrderUpdated }) {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // format YYYY-MM-DD
  };

  const getDayName = (dateStr) => {
    const todayStr = getToday();
    if (dateStr === todayStr) return 'Azi';

    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ro-RO', { weekday: 'long' }).format(date);
    } catch {
      return 'Zi necunoscută';
    }
  };

  const [selectedDate, setSelectedDate] = useState(getToday());

 useEffect(() => {
  const token = getToken();

  if (!token || !isAdmin()) {
    setMessage('⛔ Acces interzis. Trebuie să fii autentificat ca admin.');
    setLoading(false);
    return;
  }

  setLoading(true);
  const query = selectedDate ? `?date=${selectedDate}` : '';

  axios
    .get(`${API_URL}/api/orders${query}`, {   // 🔹 adăugat /api/
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const normalizedOrders = res.data.map(order => ({
        ...order,
        created_at: order.created_at,
        total_price: Number(order.totalPrice || 0),
        items: order.items || [],
        customer_name: order.customer_name || 'Client necunoscut',
      }));

      setOrders(normalizedOrders);

      if (normalizedOrders.length === 0) {
        setMessage(`ℹ️ Nu au fost înregistrate comenzi în data de ${selectedDate || 'toate zilele'}.`);
      } else {
        setMessage('');
      }
    })
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
}, [selectedDate]);

const handleStatusChange = async (orderId, newStatus) => {
  const token = getToken();

  if (!isAdmin()) {
    setMessage('⛔ Doar adminii pot schimba statusul comenzilor.');
    return;
  }

  try {
    const response = await axios.put(
      `${API_URL}/api/orders/${orderId}`,       // 🔹 adăugat /api/
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updatedOrder = {
      ...response.data,
      total_price: Number(response.data.totalPrice || 0),
      items: response.data.items || [],
      customer_name: response.data.customer_name || 'Client necunoscut',
    };

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
      <div className="filter-bar mb-4">
        <label htmlFor="dateFilter" className="form-label me-2">Filtrează după dată:</label>
        <input
          type="date"
          id="dateFilter"
          className="form-control d-inline-block w-auto"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button
          className="btn btn-secondary ms-2"
          onClick={() => setSelectedDate(getToday())}
        >
          {getDayName(selectedDate)}
        </button>
        <button
          className="btn btn-outline-primary ms-2"
          onClick={() => setSelectedDate('')}
        >
          Toate comenzile
        </button>
      </div>

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
            <p><strong>👤 Client:</strong> {order.customer_name}</p>
            <p><strong>📍 Adresă:</strong> {order.address || 'N/A'}</p>
            <p><strong>🕒 Plasată la:</strong> 
  {order.created_at && !isNaN(new Date(order.created_at))
    ? new Date(order.created_at).toLocaleString('ro-RO')
    : 'Data indisponibilă'}
</p>

          </div>

          <ul className="list-group list-group-flush">
            {order.items.map((item, idx) => (
              <li key={idx} className="list-group-item">
                <span className="product-desc">
                  {item.product?.name || 'Produs'} x {item.quantity}
                </span>
                <span className="product-price">
                  €{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </span>
              </li>
            ))}
            <li className="list-group-item text-end">
              <strong>Total: €{order.total_price.toFixed(2)}</strong>
            </li>
          </ul>
        </div>
      ))}
    </div>
  );
}
