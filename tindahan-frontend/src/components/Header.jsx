import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { Home, ShoppingCart } from "lucide-react";

export default function Header({ cartCount = 0, onCartClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isProductsPage = location.pathname === "/products";

  const subtitle = isProductsPage
    ? "Manage your product inventory"
    : "Track your store liabilities";

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>Tindahan ni Lola</h1>
          <p>{subtitle}</p>
        </div>

        <div className="header-right">
          <button className="back-btn" onClick={() => navigate("/")}>
            <Home size={12} /> Logout
          </button>

          {isProductsPage && (
            <button className="cart-btn" onClick={onCartClick}>
              <ShoppingCart size={12} />
              View Cart
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="page-tabs">
        <NavLink to="/products" className="tab">
          Products
        </NavLink>

        <NavLink to="/liabilities" className="tab">
          Debts/Utang
        </NavLink>
      </div>
    </>
  );
}
