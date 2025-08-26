import React from 'react';
import { useCart } from '../context/CartContext';

export default function OrderCard({ order }) {
  const { updateOrderStatus } = useCart();

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateOrderStatus(order.id, newStatus);
    } catch (err) {
      alert('Error updating order status');
    }
  };

  return (
    <div className="order-card">
      <div className="card-header">
        <strong>Order #{order.id}</strong>
        <select
          value={order.status}
          onChange={handleStatusChange}
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
        <p><strong>👤 Customer:</strong> {order.customer_name || 'N/A'}</p>
        <p><strong>📍 Address:</strong> {order.address || 'N/A'}</p>
      </div>

      <ul className="list-group list-group-flush">
        {order.OrderItems?.map((item, idx) => (
          <li key={idx} className="list-group-item">
            <span className="product-desc">
              {item.Product?.name || 'Product'} x {item.quantity}
            </span>
            <span className="product-price">
              €{(Number(item.price) * Number(item.quantity)).toFixed(2)}
            </span>
          </li>
        ))}
        <li className="list-group-item text-end">
          <strong className="order-total">
            Total: €{Number(order.total_price || order.totalPrice || 0).toFixed(2)}
          </strong>
        </li>
      </ul>
    </div>
  );
}
