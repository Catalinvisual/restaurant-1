import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { API_URL } from "../apiConfig";
import "../assets/styles/Login.css";
import { parseJwt } from "../utils/auth";

export default function Login({ redirectTo = "/" }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("accessToken");
  const isAuthenticated = token && token !== "undefined";

  // Ruta de revenire după login
  const from = location.state?.from || redirectTo || "/";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, email, password }),
        });

        const result = await response.json();

        if (response.ok) {
          setIsRegistering(false);
          setError("✅ Înregistrare reușită. Te poți autentifica.");
        } else {
          setError(result.error || "Înregistrare eșuată");
        }
      } catch (err) {
        console.error("❌ Eroare la înregistrare:", err);
        setError("Serverul nu răspunde");
      }
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        const { accessToken, refreshToken } = result;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        const role = parseJwt(accessToken)?.role;

        if (from === "/admin" && role !== "admin") {
          setError("Acest cont nu are rol de admin.");
          return;
        }

        navigate(from, { replace: true });
      } else {
        setError(result.error || "Autentificare eșuată");
      }
    } catch (err) {
      console.error("❌ Eroare la login:", err);
      setError("Serverul nu răspunde");
    }
  };

  return (
    <>
      <Header />
      <div className="login-wrapper">
        <div className="login-card">
          <h2>{isRegistering ? "Înregistrare" : "Autentificare"}</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          {isAuthenticated ? (
            <div className="text-center">
              <p className="mb-3">✅ Ești deja autentificat</p>
              <button className="btn btn-danger" onClick={handleLogout}>
                🔓 Logout
              </button>
            </div>
          ) : (
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
                  placeholder={isRegistering ? "Creează o parolă" : "Parola"}
                />
              </div>

              <button
                type="submit"
                className="btn btn-success d-flex align-items-center justify-content-center gap-2"
              >
                {!isRegistering && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="white"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zM5 5a3 3 0 1 1 6 0v2H5V5zm3 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                  </svg>
                )}
                {isRegistering ? "Înregistrează-te" : "Login"}
              </button>
            </form>
          )}

          {!isAuthenticated && (
            <p className="text-center">
              <button
                className="register-link"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                }}
              >
                {isRegistering
                  ? "Ai deja cont ? Autentifică-te"
                  : "Nu ai cont ? Înregistrează-te"}
              </button>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
