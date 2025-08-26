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
    if (dateStr === todayStr) return 'Today';

    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(date);
    } catch {
      return 'Unknown day';
    }
  };

  const [selectedDate, setSelectedDate] = useState(getToday());

  useEffect(() => {
    const token = getToken();

    if (!token || !isAdmin()) {
      setMessage('⛔ Access denied. You must be logged in as admin.');
      setLoading(false);
      return;
    }

    setLoading(true);
    const query = selectedDate ? `?date=${selectedDate}` : '';

    axios
      .get(`${API_URL}/api/orders${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const normalizedOrders = res.data.map(order => ({
          ...order,
          created_at: order.created_at,
          total_price: Number(order.totalPrice || 0),
          items: order.items || [],
          customer_name: order.customer_name || 'Unknown client',
        }));

        setOrders(normalizedOrders);

        if (normalizedOrders.length === 0) {
          setMessage(`ℹ️ No orders recorded on ${selectedDate || 'all dates'}.`);
        } else {
          setMessage('');
        }
      })
      .catch(err => {
        const status = err?.response?.status;
        if (status === 401) {
          setMessage('🔒 Authentication required.');
        } else if (status === 403) {
          setMessage('⛔ Only admins can access orders.');
        } else {
          setMessage('❌ Failed to retrieve orders.');
        }
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = getToken();

    if (!isAdmin()) {
      setMessage('⛔ Only admins can change order status.');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrder = {
        ...response.data,
        total_price: Number(response.data.totalPrice || 0),
        items: response.data.items || [],
        customer_name: response.data.customer_name || 'Unknown client',
      };

      const updatedOrders = orders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      );

      setOrders(updatedOrders);

      if (typeof onOrderUpdated === 'function') {
        onOrderUpdated();
      }
    } catch (error) {
      setMessage('❌ Error updating order status.');
    }
  };

  return (
    <div className="orders-list">
      <div className="filter-bar mb-4">
        <label htmlFor="dateFilter" className="form-label me-2">Filter by date:</label>
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
          All Orders
        </button>
      </div>

      {loading && <p>Loading orders...</p>}

      {!loading && message && (
        <div className="alert alert-warning">{message}</div>
      )}

      {!loading && !message && orders.length === 0 && (
        <p>No orders recorded.</p>
      )}

      {!loading && !message && orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="card-header">
            <strong>Order #{order.id}</strong>
            <span className={`status-badge ${order.status}`}>{order.status}</span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              className="form-select w-auto ms-2"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="card-body">
            <p><strong>👤 Client:</strong> {order.customer_name}</p>
            <p><strong>📍 Address:</strong> {order.address || 'N/A'}</p>
            <p><strong>🕒 Placed at:</strong> 
              {order.created_at && !isNaN(new Date(order.created_at))
                ? new Date(order.created_at).toLocaleString('en-GB')
                : 'Date unavailable'}
            </p>
          </div>

          <ul className="list-group list-group-flush">
            {order.items.map((item, idx) => (
              <li key={idx} className="list-group-item">
                <span className="product-desc">
                  {item.product?.name || 'Product'} x {item.quantity}
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
