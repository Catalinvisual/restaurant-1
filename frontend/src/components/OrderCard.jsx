import React from 'react';
import { useCart } from '../context/CartContext';

export default function OrderCard({ order }) {
  const { updateOrderStatus } = useCart();

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateOrderStatus(order.id, newStatus);
    } catch (err) {
      alert('Eroare la actualizarea statusului comenzii');
    }
  };

  return (
    <div className="order-card">
      <div className="card-header">
        <strong>Comandă #{order.id}</strong>
        <select
          value={order.status}
          onChange={handleStatusChange}
          className="form-select w-auto ms-2"
        >
          <option value="pending">În așteptare</option>
          <option value="confirmed">Confirmată</option>
          <option value="shipped">Expediată</option>
          <option value="delivered">Livrată</option>
          <option value="cancelled">Anulată</option>
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
          <strong className="order-total">
            Total: €{Number(order.total_price).toFixed(2)}
          </strong>
        </li>
      </ul>
    </div>
  );
}
