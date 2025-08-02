import React from 'react';
import '../assets/styles/Home.css'; // Stilul separat pentru fundal

export default function Home() {
  return (
    <div>
      {/* HERO pe tot ecranul */}
      <section className="hero-section">
        <div className="overlay-text text-center">
          <h1 className="hero-title">Bun venit la Restaurantul Gustos!</h1>
          <p className="hero-subtitle">
            Descoperă savoarea într-un decor elegant și primitor.
          </p>
          <a href="/menu" className="btn btn-outline-light mt-3">
            Vezi Meniul
          </a>
        </div>
      </section>

      {/* Conținutul principal */}
      <div className="container mt-5">
        <section className="my-5 text-center">
          <h3 className="text-success">🎉 Oferte Speciale</h3>
          <ul className="list-unstyled">
            <li>🍕 2x Pizza + 1 Cola gratis</li>
            <li>🍔 Burger + Cartofi la doar €9.99</li>
            <li>🍝 Happy Hour: -20% la paste între 14:00 - 16:00</li>
          </ul>
        </section>

        <section className="my-5">
          <h3 className="text-info">📍 Despre Noi</h3>
          <p>
            Cu tradiție din 2005, oferim preparate autentice și servicii de calitate.
            Ne găsești în Luttelgeest, Strada Gustului nr. 10.
          </p>
          <img
            src="https://source.unsplash.com/800x400/?restaurant,interior"
            alt="Interiorul restaurantului"
            className="img-fluid rounded shadow mt-3"
          />
        </section>
      </div>
    </div>
  );
}