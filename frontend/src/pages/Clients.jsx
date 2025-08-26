import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../apiConfig';
import { getToken } from '../utils/auth';
import '../assets/styles/Clients.css';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    .then(res => {
      setClients(res.data);
    })
    .catch(err => {
      console.error(err);
      setError('Failed to load clients.');
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading clients...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="clients-page">
      <h2>👥 Clients</h2>
      <table className="table table-striped clients-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Registration Date</th>
            <th>Order Count</th>
            <th>Total Spent</th>
            <th>Last Order</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td data-label="Email">{client.email}</td>
              <td data-label="Registration Date">{new Date(client.createdAt).toLocaleDateString()}</td>
              <td data-label="Order Count">{client.orderCount || 0}</td>
              <td data-label="Total Spent">€{(client.totalSpent || 0).toFixed(2)}</td>
              <td data-label="Last Order">
                {client.lastOrder
                  ? `${client.lastOrder.status} - ${new Date(client.lastOrder.created_at).toLocaleDateString()}`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
