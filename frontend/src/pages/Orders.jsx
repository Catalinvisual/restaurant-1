import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_URL } from '../apiConfig';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    console.log('🔐 Token în Orders.jsx:', token); // DEBUG

    if (!token || token === 'undefined') {
      setMessage('❗ Trebuie să fii autentificat pentru a vedea comenzile.');
      return;
    }

    axios
      .get(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        setOrders(res.data);
      })
      .catch(err => {
        console.error('❌ Eroare la preluarea comenzilor:', err);
        setMessage('❌ Nu s-au putut prelua comenzile.');
      });
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.put(
        `${API_URL}/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedOrder = response.data;

      const updatedOrders = orders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      );

      setOrders(updatedOrders);
    } catch (error) {
      console.error('❌ Eroare la actualizarea statusului comenzii:', error);
    }
  };

  return (
    <>
      <Header />

      <div className="container mt-5">
        <h2 className="text-primary mb-4">Comenzi Primite</h2>

        {message && <div className="alert alert-warning">{message}</div>}

        {orders.length === 0 && !message ? (
          <p>Nu există comenzi înregistrate.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="card mb-3">
              <div className="card-header d-flex justify-content-between">
                <strong>Comandă #{order.id}</strong>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="form-select w-auto"
                >
                  <option value="În așteptare">În așteptare</option>
                  <option value="În curs de livrare">În curs de livrare</option>
                  <option value="Livrat">Livrat</option>
                  <option value="Anulat">Anulat</option>
                </select>
              </div>
              <ul className="list-group list-group-flush">
                {order.items.map((item, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
                <li className="list-group-item text-end">
                  <strong>Total: €{order.total.toFixed(2)}</strong>
                </li>
              </ul>
            </div>
          ))
        )}
      </div>
    </>
  );
}