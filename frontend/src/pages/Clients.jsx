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
  axios.get(`${API_URL}/api/users`, {   // 🔹 adăugat /api/
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  .then(res => {
    setClients(res.data);
  })
  .catch(err => {
    console.error(err);
    setError('Nu s-au putut încărca clienții.');
  })
  .finally(() => setLoading(false));
}, []);


  if (loading) return <p>Se încarcă clienții...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="clients-page">
      <h2>👥 Clienți</h2>
      <table className="table table-striped clients-table">

        <thead>
          <tr>
            <th>Email</th>
            <th>Data înregistrării</th>
            <th>Număr comenzi</th>
            <th>Total cheltuit</th>
            <th>Ultima comandă</th>
          </tr>
        </thead>
       <tbody>
  {clients.map(client => (
    <tr key={client.id}>
      <td data-label="Email">{client.email}</td>
      <td data-label="Data înregistrării">{new Date(client.createdAt).toLocaleDateString()}</td>
      <td data-label="Număr comenzi">{client.orderCount || 0}</td>
      <td data-label="Total cheltuit">€{(client.totalSpent || 0).toFixed(2)}</td>
      <td data-label="Ultima comandă">
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
