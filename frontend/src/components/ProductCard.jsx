import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/ProductCard.css";
import "../assets/styles/Menu.css";

const ProductCard = ({ product = {} }) => {
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();
  const [buying, setBuying] = useState(false);

  const handleBuyClick = () => {
    if (!product?.id || quantity < 1 || buying) return;
    dispatch({ type: "ADD_TO_CART", payload: { ...product, quantity } });
    toast.success(`${product.name || "Produs"} a fost adăugat în coș! 🛒`, {
      position: "top-right",
      autoClose: 2000,
    });
    setBuying(true);
    setTimeout(() => setBuying(false), 1500);
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const imageSrc =
    typeof product?.image === "string" && product.image.trim().startsWith("https://")
      ? product.image
      : "https://via.placeholder.com/320x200?text=Fara+imagine";

  const priceValue = Number.isFinite(Number(product.price)) ? Number(product.price) : 0;

  const categoryLabel =
    typeof product.category === "string" && product.category.trim().length > 0
      ? product.category[0].toUpperCase() + product.category.slice(1).toLowerCase()
      : null;

  return (
  <article className="card product-card narrow-card h-100">
  <div className="product-media">
    <img
      src={imageSrc}
      className="card-img-top"
      alt={product.name || "Fără nume"}
      loading="lazy"
    />

    {product.isNew && <span className="product-badge badge-new">Nou</span>}
    {product.isPromo && <span className="product-badge badge-promo">Promo</span>}
    {categoryLabel && <span className="category-label bottom-right">{categoryLabel}</span>}
  </div>

  <div className="card-body">
    <div className="card-content">
      <h5 className="card-title">{product.name || "Produs fără nume"}</h5>

      <p className="card-text product-description">
        {product.description || "Fără descriere disponibilă."}
      </p>

      {/* Grupare preț + cantitate + buton */}
      <div className="action-row">
        <p className="card-text fw-bold">€{priceValue.toFixed(2)}</p>

        {product.id !== "preview" && (
          <div className="quantity-controls">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleDecrement}
              aria-label="Scade cantitatea"
            >
              −
            </button>
            <span className="qty" aria-live="polite">{quantity}</span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleIncrement}
              aria-label="Crește cantitatea"
            >
              +
            </button>
          </div>
        )}

        {product.id !== "preview" && (
          <button
            className={`btn btn-success btn-xs ${buying ? "btn-added" : ""}`}
            onClick={handleBuyClick}
            disabled={buying || quantity < 1}
          >
            {buying ? "✔ Adăugat!" : "Add to cart"}
          </button>
        )}
      </div>

      {/* Rating + link */}
      {typeof product.rating === "number" && (
        <div className="rating mt-2">
          {"★".repeat(Math.round(product.rating))}
          <span>({product.rating.toFixed(1)})</span>
        </div>
      )}

      {product.link && (
        <a href={product.link} className="btn btn-outline-primary btn-sm mt-2">
          Detalii produs
        </a>
      )}
    </div>
  </div>
</article>
);

};

export default ProductCard;
