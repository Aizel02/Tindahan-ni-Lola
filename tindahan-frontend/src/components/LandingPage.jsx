import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo">🏪Tindahan ni Lola</div>
        <button className="get-started" onClick={() => navigate("/products")}>
          Get Started
        </button>
      </nav>

      <section className="hero">
        <h1>
          Manage Your Sari-Sari Store <br /> with Ease
        </h1>
        <p>
          Keep track of your inventory, manage prices, and grow your business
          with our simple and powerful store management tool.
        </p>
        <button className="primary-btn" onClick={() => navigate("/products")}>
          Start Managing Now
        </button>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>🧾 Easy Inventory</h3>
          <p>Add, edit, and organize your products in seconds.</p>
        </div>

        <div className="feature-card">
          <h3>⚡ Quick Search</h3>
          <p>Find products instantly with powerful search and filters.</p>
        </div>

        <div className="feature-card">
          <h3>📊 Price Management</h3>
          <p>Update prices and track your product catalog effortlessly.</p>
        </div>

        <div className="feature-card">
          <h3>👥 For Everyone</h3>
          <p>Simple interface designed for all skill levels.</p>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to grow your business?</h2>
        <p>
          Join thousands of sari-sari store owners who trust Tindahan ni Lola to
          manage their inventory.
        </p>
        <button className="secondary-btn" onClick={() => navigate("/products")}>
          Enter Your Store
        </button>
      </section>

      <footer>
        <p>© 2025 Tindahan ni Lola. Developed by Aizel Joy Lopez 🎬</p>
      </footer>
    </div>
  );
}

export default LandingPage;
