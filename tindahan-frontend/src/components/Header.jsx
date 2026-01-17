import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({ cartCount = 0, onCartClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isProductsPage = location.pathname === "/products";

  const subtitle = isProductsPage
    ? "Manage your product inventory"
    : "Track your store liabilities";

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="header">
        <div className="header-left">
          <h1>Tindahan ni Lola</h1>
          <p>{subtitle}</p>
        </div>

        <div className="header-right">
          <button className="back-btn" onClick={() => navigate("/")}>
            🏠 Back to Home
          </button>

          {/* ✅ SHOW ONLY IN PRODUCTS */}
          {isProductsPage && (
            <button className="cart-btn" onClick={onCartClick}>
              🛒 View Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="page-tabs">
        <NavLink
          to="/products"
          className={({ isActive }) => (isActive ? "tab active" : "tab")}
        >
          Products
        </NavLink>

        <NavLink
          to="/liabilities"
          className={({ isActive }) => (isActive ? "tab active" : "tab")}
        >
          Liabilities
        </NavLink>
      </div>
    </>
  );
}
