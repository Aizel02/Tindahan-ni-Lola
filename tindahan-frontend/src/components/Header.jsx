import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({ cartCount = 0, onCartClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const subtitle =
    location.pathname === "/liabilities"
      ? "Track your store liabilities"
      : "Manage your product inventory";

  return (
    <>
      {/* ===== TOP HEADER ===== */}
      <div className="header">
        <div className="header-left">
          <h1>Tindahan ni Lola</h1>
          <p>{subtitle}</p>
        </div>

        <div className="header-right">
          <button className="back-btn" onClick={() => navigate("/")}>
            🏠 Back to Home
          </button>

          {onCartClick && (
            <button className="cart-btn" onClick={onCartClick}>
              🛒 View Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ===== PAGE TABS (ALWAYS VISIBLE) ===== */}
      <div className="page-tabs">
        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? "tab active" : "tab"
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/liabilities"
          className={({ isActive }) =>
            isActive ? "tab active" : "tab"
          }
        >
          Liabilities
        </NavLink>
      </div>
    </>
  );
}
