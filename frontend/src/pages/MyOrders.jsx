import React, { useEffect, useState } from 'react';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Simulare: Încarcă comenzile din localStorage sau mock
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [
      {
        id: 1,
        date: '2024-07-01',
        items: [
          { name: 'Pizza Margherita', quantity: 2, price: 8.5 },
          { name: 'Burger de vită', quantity: 1, price: 10.0 }
        ],
        total: 27.0,
        status: 'Livrat'
      },
      {
        id: 2,
        date: '2024-06-25',
        items: [
          { name: 'Paste Carbonara', quantity: 1, price: 9.0 }
        ],
        total: 9.0,
        status: 'În curs de livrare'
      }
    ];

    setOrders(storedOrders);
  }, []);

  return (
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
  );
}