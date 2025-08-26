import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../apiConfig"; // changed: using apiFetch instead of API_URL
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

  const queryParams = new URLSearchParams(location.search);
  const expired = queryParams.get("expired") === "true";

  const token = localStorage.getItem("accessToken");

  const validateToken = (token) => {
    try {
      if (token && token !== "undefined") {
        const payload = parseJwt(token);
        const now = Date.now() / 1000;
        return payload?.exp && payload.exp > now;
      }
    } catch {
      return false;
    }
    return false;
  };

  const isAuthenticated = validateToken(token);
  const from = location.state?.from || redirectTo || "/";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      try {
        const response = await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ username: name, email, password }),
        });

        const result = await response.json();

        if (response.ok) {
          setIsRegistering(false);
          setError("✅ Registration successful. You can now log in.");
        } else {
          setError(result.error || "Registration failed");
        }
      } catch (err) {
        console.error("❌ Registration error:", err);
        setError("Server is not responding");
      }
      return;
    }

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        const { accessToken, refreshToken } = result;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        const decoded = parseJwt(accessToken);

        const isAdmin = decoded.isAdmin === true || decoded.isAdmin === "true";
        const role = decoded.role === "admin" || isAdmin ? "admin" : "client";

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: decoded.id,
            email: decoded.email,
            role,
            isAdmin,
          })
        );

        if (from === "/admin" && role !== "admin") {
          setError("This account does not have admin privileges.");
          return;
        }

        navigate(from, { replace: true });
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Server is not responding");
    }
  };

  return (
    <>
      <Header />
      <div className="login-wrapper">
        <div className="login-card">
          <h2>{isRegistering ? "Register" : "Login"}</h2>

          {expired && (
            <div className="alert alert-warning">
              🔒 Your token has expired. Please log in again.
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {isAuthenticated ? (
            <>
              <div className="alert alert-success text-center">
                ✅ You are logged in
              </div>
              <div className="text-center mt-3">
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                {isRegistering && (
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Full name"
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
                    placeholder="e.g. admin@restaurant.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={isRegistering ? "Create a password" : "Password"}
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
                      <path d="M8 1a4 4 0 0 0-4 4v2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V5a4 4 0 0 0-4-4zM5 5a3 3 0 1 1 6 0v2H5V5zm3 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                    </svg>
                  )}
                  {isRegistering ? "Register" : "Login"}
                </button>
              </form>

              <p className="text-center">
                <button
                  className="register-link"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError("");
                  }}
                >
                  {isRegistering
                    ? "Already have an account? Log in"
                    : "Don't have an account? Register"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

