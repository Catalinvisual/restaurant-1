import React, { useEffect, useState } from 'react';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulăm încărcarea comenzilor globale (pentru restaurant)
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(storedOrders);
  }, []);

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4">Comenzi Primite</h2>

      {orders.length === 0 ? (
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
  );
}