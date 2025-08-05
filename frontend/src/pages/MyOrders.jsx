import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { API_URL } from '../apiConfig';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/orders/user`) // Asumăm că acest endpoint returnează comenzile utilizatorului
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error('❌ Eroare la încărcarea comenzilor mele:', err);
      });
  }, []);

  return (
    <>
      <Header />

      <div className="container mt-5">
        <h2 className="text-primary mb-4">Comenzile Mele</h2>
        {orders.length === 0 ? (
          <p>Nu ai comenzi înregistrate.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card mb-3">
              <div className="card-header">
                <strong>Comandă #{order.id}</strong> – {order.date}
                <span className="badge bg-secondary float-end">{order.status}</span>
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