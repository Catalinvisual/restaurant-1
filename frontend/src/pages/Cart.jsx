import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import "../assets/styles/Cart.css";
import Header from "../components/Header";
import { API_URL } from "../apiConfig";

export default function Cart() {
  const { cartItems, dispatch } = useCart();
  const [message, setMessage] = useState("");

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleRemove = (index) => {
    if (window.confirm("Ești sigur că vrei să ștergi acest produs?")) {
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

  const handleCheckout = async () => {
    const token = localStorage.getItem("accessToken");
    const address =
      localStorage.getItem("deliveryAddress") || "Strada Florilor 12";

    if (!token || token === "undefined") {
      setMessage(
        "❗ Token-ul de autentificare lipsește. Te rugăm să te loghezi din nou."
      );
      return;
    }

    if (cartItems.length === 0) {
      setMessage("❗ Coșul este gol.");
      return;
    }

    const mainItem = cartItems[0];

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address,
          items: [
            {
              id: mainItem.id,
              quantity: mainItem.quantity,
              price: mainItem.price,
            },
          ],
        }),
      });

      if (response.ok) {
        setMessage("✅ Comanda a fost înregistrată cu succes!");
        dispatch({ type: "CLEAR_CART" });
      } else {
        const error = await response.json();
        setMessage(
          `❌ Eroare: ${error.error || "Nu s-a putut plasa comanda."}`
        );
      }
    } catch (err) {
      console.error("❌ Eroare de rețea:", err);
      setMessage("❌ Serverul nu răspunde. Încearcă din nou mai târziu.");
    }
  };

  return (
    <>
      <Header />
      <div className="cart-container container">
        <h2 className="cart-title">Coșul meu de cumpărături</h2>

        {message && <div className="alert alert-info">{message}</div>}

        {cartItems.length === 0 ? (
          <p>Coșul este gol.</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map((item, index) => (
                <li className="cart-item" key={index}>
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/80?text=Imagine"
                    }
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
                      Preț:{" "}
                      <strong>
                        {(item.price * item.quantity).toLocaleString("ro-RO", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </strong>
                    </p>
                  </div>
                  <button
                    className="remove-button"
                    onClick={() => handleRemove(index)}
                  >
                    Șterge
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-summary mt-4 text-end">
  <div className="total-label">
    <span>Total de plată: </span>
    <strong>
      {total.toLocaleString('ro-RO', {
        style: 'currency',
        currency: 'EUR',
      })}
    </strong>
  </div>
  <button className="btn btn-success mt-3" onClick={handleCheckout}>
    Plata la livrare
  </button>
</div>

          </>
        )}
      </div>
    </>
  );
}
