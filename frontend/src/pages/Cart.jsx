import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../assets/styles/Cart.css";
import Header from "../components/Header";
import { API_URL } from "../apiConfig";

export default function Cart() {
  const { cartItems, dispatch } = useCart();
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleRemove = (index) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      dispatch({ type: "REMOVE_BY_INDEX", payload: index });
    }
  };

  const handleQuantityChange = (index, newQty) => {
    if (newQty < 1) return;
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { index, quantity: newQty },
    });
  };

  const handleCheckout = () => {
    setShowForm(true);
  };

  const handleSubmitOrder = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token || token === "undefined") {
      setMessage(<p className="cart-message warning">❗ Please log in to continue.</p>);
      return;
    }

    if (cartItems.length === 0) {
      setMessage(<p className="cart-message warning">❗ Your cart is empty.</p>);
      return;
    }

    if (!firstName || !lastName || !street || !number || !postalCode || !city) {
      setMessage(<p className="cart-message warning">❗ Please fill in all fields.</p>);
      return;
    }

    const customer_name = `${firstName.trim()} ${lastName.trim()}`;
    const address = `${street.trim()} ${number.trim()}, ${postalCode.trim()} ${city.trim()}`;

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name,
          address,
          items: cartItems.map((item) => ({
            product_id: item.product_id || item.id,
            id: item.id,
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "❌ Error submitting order.");
      }

      const data = await res.json();
      console.log("✅ Order submitted:", data);
      setMessage(<p className="cart-message success">✅ Your order has been placed!</p>);
      dispatch({ type: "CLEAR_CART" });
      setShowForm(false);
      setFirstName('');
      setLastName('');
      setStreet('');
      setNumber('');
      setPostalCode('');
      setCity('');
    } catch (err) {
      setMessage(<p className="cart-message error">{err.message}</p>);
    }
  };

  return (
    <>
      <Header />
      <div className="cart-container container">
        <h2 className="cart-title">My Shopping Cart</h2>

        {message && <div>{message}</div>}

        {cartItems.length === 0 ? (
          <p className="cart-message warning">Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map((item, index) => (
                <li className="cart-item" key={index}>
                  <img
                    src={item.image || "https://via.placeholder.com/80?text=Image"}
                    alt={item.name}
                  />
                  <div className="cart-item-details">
                    <h5 className="mb-1">{item.name}</h5>
                    <div className="qty-price">
                      <button
                        className="btn btn-sm btn-outline-secondary qty-button"
                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="btn btn-sm btn-outline-secondary qty-button"
                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <p className="mb-0">
                      Price:{" "}
                      <strong>
                        {(item.price * item.quantity).toLocaleString("en-GB", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </strong>
                    </p>
                  </div>
                  <button className="remove-button" onClick={() => handleRemove(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-summary mt-4 text-end">
              <div className="total-label">
                <span>Total: </span>
                <strong>
                  {total.toLocaleString("en-GB", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </strong>
              </div>
              <button className="btn btn-success mt-3" onClick={handleCheckout}>
                ✅ Confirm Order
              </button>
            </div>

            {showForm && (
              <div className="card mt-5 shadow-sm">
                <div className="card-header bg-light">
                  <h5 className="mb-0 text-primary fw-bold">📦 Delivery Details</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="No."
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button className="btn btn-primary w-100 mt-4" onClick={handleSubmitOrder}>
                    📤 Submit Order
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
