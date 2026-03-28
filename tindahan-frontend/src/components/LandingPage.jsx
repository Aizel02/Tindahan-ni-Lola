import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { BarChart3, CheckSquare, Users, Zap, Moon, Sun } from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="landing-container">

      <nav className="navbar glass">
        <div className="logo">🏪 Tindahan ni Lola</div>

        <div className="nav-actions">
          <button
            className="icon-btn"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>

          <button
            className="login-register glass-btn"
            onClick={() => navigate("/auth")}
          >
            Login / Register
          </button>
        </div>
      </nav>

      <section className="hero">
        <h1>
          Manage Your Sari-Sari Store <br/>
          with Ease
        </h1>

        <p>
          Smart inventory. Faster search. Smooth operations.
          Built for modern sari-sari store owners.
        </p>

        <button
          className="primary-btn glass-btn"
          onClick={() => navigate("/auth")}
        >
          Start Managing Now
        </button>
      </section>

      <section className="features">

        <div className="feature-card glass">
          <CheckSquare/>
          <h3>Easy Inventory</h3>
          <p>Add and organize products quickly.</p>
        </div>

        <div className="feature-card glass">
          <Zap/>
          <h3>Quick Search</h3>
          <p>Instant search with filters.</p>
        </div>

        <div className="feature-card glass">
          <BarChart3/>
          <h3>Price Management</h3>
          <p>Track prices and profits easily.</p>
        </div>

        <div className="feature-card glass">
          <Users/>
          <h3>For Everyone</h3>
          <p>Simple and beginner friendly.</p>
        </div>

      </section>

      <section className="cta glass">
        <h2>Ready to grow your business?</h2>

        <button
          className="secondary-btn glass-btn"
          onClick={() => navigate("/auth")}
        >
          Enter Your Store
        </button>

      </section>

      <footer>
        © 2025 Tindahan ni Lola • Aizel Joy Lopez
      </footer>

    </div>
  );
}

export default LandingPage;