import React, { useEffect, useState, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import ProductCard from "../components/ProductCard";

import "../assets/styles/ProductCard.css";
import "../assets/styles/Home.css";
import { API_URL } from "../apiConfig";

export default function Home() {
  const [specialItems, setSpecialItems] = useState([]);
  const [message, setMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Static images served by frontend — no /api needed
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

    // Backend endpoint — requires /api
    fetch(`${API_URL}/api/menu`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text || res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        const filtered = data.filter((item) => item.isNew || item.isPromo);
        setSpecialItems(filtered);
      })
      .catch((err) => {
        console.error("❌ Error loading menu:", err);
        setMessage("❌ Could not load featured products.");
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
                {/* Frontend route — no /api needed */}
                <a href="/menu" className="btn btn-book mt-3">
                  Book a Table
                </a>
              </div>
              <div className="grill-container">
                {/* Static image — no /api needed */}
                <img
                  src="assets/images/grill-round.png"
                  alt="Round Grill"
                  className="rotating-grill-small"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container mt-5">
          {/* Special Offers */}
          <section className="special-offers my-5 text-center">
            <h3 className="text-success">🎉 Special Offers</h3>
            <ul className="list-unstyled offer-list">
              <li>🍕 2x Pizza + 1 Free Cola</li>
              <li>🍔 Burger + Fries for only €9.99</li>
              <li>🍝 Happy Hour: -20% on pasta between 14:00 - 16:00</li>
            </ul>
          </section>

          {/* Image Carousel */}
          <section className="image-carousel my-5 text-center">
            <h3 className="text-primary mb-4">📸 From Our Kitchen</h3>

            <div {...handlers} className="carousel-wrapper">
              <button className="btn btn-outline-secondary" onClick={prevSlide}>
                ◀
              </button>

              {visibleImages.map((img, index) => (
                <img
                  key={index}
                  src={`/assets/images/${img}`} // static — no /api
                  alt={`Image ${index + 1}`}
                  className="carousel-img"
                />
              ))}

              <button className="btn btn-outline-secondary" onClick={nextSlide}>
                ▶
              </button>
            </div>
          </section>

          {/* Featured Products */}
          {message && (
            <div className="alert alert-warning text-center">{message}</div>
          )}

          {specialItems.length > 0 && (
            <section className="featured-products my-5">
              <h3 className="text-warning text-center">🌟 Featured Products</h3>

              <div className="card-container">
                {specialItems.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          )}

          {/* Our Team */}
          <section className="team-section my-5 text-center">
            <h3 className="text-danger">👨‍🍳 Our Team</h3>
            <div className="row justify-content-center mt-4">
              <div className="col-md-4">
                <img
                  src="assets/images/cheftom.jpg"
                  alt="Chef Tom"
                  className="rounded-circle shadow"
                  style={{ width: "200px", height: "200px", objectFit: "cover" }}
                />
                <h5 className="mt-3">Chef Tom</h5>
                <p>
                  Master of French cuisine, passionate about fine sauces and artistic plating.
                </p>
              </div>
              <div className="col-md-4">
                <img
                  src="assets/images/chefalexandra.jpg"
                  alt="Chef Alexandra"
                  className="rounded-circle shadow"
                  style={{ width: "200px", height: "200px", objectFit: "cover" }}
                />
                <h5 className="mt-3">Chef Alexandra</h5>
                <p>
                  Expert in refined desserts, with a passion for Belgian chocolate and spectacular decorations.
                </p>
              </div>
              <div className="col-md-4">
                <img
                  src="assets/images/chefcristina.jpg"
                  alt="Chef Ana"
                  className="rounded-circle shadow"
                  style={{ width: "200px", height: "200px", objectFit: "cover" }}
                />
                <h5 className="mt-3">Chef Ana</h5>
                <p>
                  Creator of innovative vegan recipes, passionate about local and sustainable ingredients.
                </p>
              </div>
            </div>
          </section>

          {/* About Us */}
          <section className="about-section my-5">
            <h3 className="text-info text-center">📍 About Us</h3>
            <p className="lead text-center">
              With tradition since 2005, we offer authentic dishes and quality service. You can find us in <strong>Emmeloord</strong>, Gustului Street no. 10 — the place where every meal tells a story.
            </p>

            <div className="row align-items-center mt-4">
              <div className="col-md-6">
                <ul className="list-unstyled about-values">
                  <li>🍷 Warm and welcoming atmosphere</li>
                  <li>👨‍🍳 Chefs passionate about gastronomy</li>
                  <li>🌿 Fresh and local ingredients</li>
                  <li>🎶 Ambient music and rustic decor</li>
                </ul>
              </div>
              <div className="col-md-6 text-center">
                <img
                  src="assets/images/our-restaurant.jpg"
                  alt="Restaurant Interior"
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
