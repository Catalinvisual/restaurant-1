import React, { useEffect, useState, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import ProductCard from "../components/ProductCard";
import "../assets/styles/Home.css";
import '../assets/styles/ProductCard.css';
import { API_URL } from "../apiConfig";

export default function Home() {
  const [specialItems, setSpecialItems] = useState([]);
  const [message, setMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselImages = [
    "dish1.jpg",
    "dish2.jpg",
    "dish3.jpg",
    "dish4.jpg",
    "dish5.jpg",
    "bbq-sous.jpg",
    "kitchen1.jpg",
    "kitchen2.jpg",
  ];

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch(`${API_URL}/menu`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((item) => item.isNew || item.isPromo);
        setSpecialItems(filtered);
      })
      .catch((err) => {
        console.error("❌ Eroare la încărcarea meniului:", err);
        setMessage("❌ Nu s-au putut încărca produsele evidențiate.");
      });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  }, [carouselImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  }, [carouselImages.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const visibleImages = [
    carouselImages[currentIndex],
    carouselImages[(currentIndex + 1) % carouselImages.length],
    carouselImages[(currentIndex + 2) % carouselImages.length],
  ];

  const handlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <main className="main-content">
      <div className="home-page">
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-overlay d-flex align-items-center">
            <div className="container d-flex justify-content-between align-items-center flex-wrap">
              <div className="hero-text">
                <h1 className="hero-title">Enjoy Our Delicious Meal</h1>
                <p className="hero-subtitle">
                  Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit.
                  Aliqu diam amet diam et eos.
                </p>
                <a href="/menu" className="btn btn-book mt-3">
                  Book a Table
                </a>
              </div>
              <div className="grill-container">
                <img
                  src="assets/images/grill-round.png"
                  alt="Grătar rotund"
                  className="rotating-grill-small"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container mt-5">
          {/* Oferte Speciale */}
          <section className="special-offers my-5 text-center">
            <h3 className="text-success">🎉 Oferte Speciale</h3>
            <ul className="list-unstyled offer-list">
              <li>🍕 2x Pizza + 1 Cola gratis</li>
              <li>🍔 Burger + Cartofi la doar €9.99</li>
              <li>🍝 Happy Hour: -20% la paste între 14:00 - 16:00</li>
            </ul>
          </section>

          {/* Carusel Imagini */}
          <section className="image-carousel my-5 text-center">
            <h3 className="text-primary mb-4">📸 Din Bucătăria Noastră</h3>

            <div {...handlers} className="carousel-wrapper">
              <button className="btn btn-outline-secondary" onClick={prevSlide}>
                ◀
              </button>

              {visibleImages.map((img, index) => (
  <img
    key={index}
    src={`/assets/images/${img}`}
    alt={`Imagine ${index + 1}`}
    className="carousel-img"
  />
))}





              <button className="btn btn-outline-secondary" onClick={nextSlide}>
                ▶
              </button>
            </div>

           
          </section>
          {/* Produse Evidențiate */}
          {message && (
            <div className="alert alert-warning text-center">{message}</div>
          )}

          {specialItems.length > 0 && (
            <section className="featured-products my-5">
              <h3 className="text-warning text-center">
                🌟 Produse Evidențiate
              </h3>
              <div className="row justify-content-center">
                {specialItems.map((item) => (
                  <div
                    key={item.id}
                    className="col-md-4 d-flex justify-content-center"
                  >
                    <ProductCard product={item} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Echipa Noastră */}
          <section className="team-section my-5 text-center">
            <h3 className="text-danger">👨‍🍳 Echipa Noastră</h3>
            <div className="row justify-content-center mt-4">
              <div className="col-md-4">
                <img
                  src="assets/images/cheftom.jpg"
                  alt="Chef Tom"
                  className="rounded-circle shadow"
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
                <h5 className="mt-3">Chef Tom</h5>
                <p>
                  Maestru al bucătăriei franțuzești, pasionat de sosuri fine și
                  plating artistic.
                </p>
              </div>
              <div className="col-md-4">
                <img
                  src="assets/images/chefalexandra.jpg"
                  alt="Chef Alexandra"
                  className="rounded-circle shadow"
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
                <h5 className="mt-3">Chef Alexandra</h5>
                <p>
                  Expertă în deserturi rafinate, cu o pasiune pentru ciocolată
                  belgiană și decoruri spectaculoase.
                </p>
              </div>
              <div className="col-md-4">
                <img
                  src="assets/images/chefcristina.jpg"
                  alt="Chef Ana"
                  className="rounded-circle shadow"
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
                <h5 className="mt-3">Chef Ana</h5>
                <p>
                  Creatoare de rețete vegane inovatoare, iubitoare de
                  ingrediente locale și sustenabile.
                </p>
              </div>
            </div>
          </section>

          {/* Despre Noi */}
          <section className="about-section my-5">
            <h3 className="text-info text-center">📍 Despre Noi</h3>
            <p className="lead text-center">
              Cu tradiție din 2005, oferim preparate autentice și servicii de
              calitate. Ne găsești în <strong>Emmeloord</strong>, Strada
              Gustului nr. 10 — locul unde fiecare masă spune o poveste.
            </p>

            <div className="row align-items-center mt-4">
              <div className="col-md-6">
                <ul className="list-unstyled about-values">
                  <li>🍷 Atmosferă caldă și primitoare</li>
                  <li>👨‍🍳 Bucătari pasionați de gastronomie</li>
                  <li>🌿 Ingrediente locale și proaspete</li>
                  <li>🎶 Muzică ambientală și decor rustic</li>
                </ul>
              </div>
              <div className="col-md-6 text-center">
                <img
                  src="assets/images/our-restaurant.jpg"
                  alt="Interiorul restaurantului"
                  className="img-fluid rounded shadow-lg"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
