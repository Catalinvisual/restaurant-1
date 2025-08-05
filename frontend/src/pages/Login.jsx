import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { API_URL } from '../apiConfig'; // 👈 Importăm valoarea centralizată

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering) {
      if (name.trim() === '') {
        setError('Introduceți un nume valid');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: name, email, password }),
        });

        if (response.ok) {
          const user = await response.json();
          console.log('✅ Utilizator creat:', user);
          navigate('/');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Eroare la înregistrare');
        }
      } catch (error) {
        console.error('❌ Eroare conexiune:', error);
        setError('Serverul nu răspunde');
      }

    } else {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
          localStorage.setItem('token', result.token);
          console.log('✅ Login cu succes:', result);
          navigate('/');
        } else {
          setError(result.error || 'Autentificare eșuată');
        }
      } catch (error) {
        console.error('❌ Eroare la login:', error);
        setError('Serverul nu răspunde');
      }
    }
  };

  return (
    <>
      <Header />

      <div className="container mt-5" style={{ maxWidth: '500px' }}>
        <h2 className="text-primary mb-4">
          {isRegistering ? 'Înregistrare' : 'Autentificare'}
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="mb-3">
              <label className="form-label">Nume</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Numele complet"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ex: admin@restaurant.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Parolă</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={isRegistering ? 'Creează o parolă' : 'Parola'}
            />
          </div>

          <button type="submit" className="btn btn-success w-100">
            {isRegistering ? 'Înregistrează-te' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            className="btn btn-link"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
          >
            {isRegistering ? 'Ai deja cont? Autentifică-te' : 'Nu ai cont? Înregistrează-te'}
          </button>
        </div>
      </div>
    </>
  );
}