import React, { useState } from "react";
import "./ProductList.css";

// Centralized category list — just add new ones here
const CATEGORIES = [
  "Biscuits", "Canned Goods","Cigarettes","Coffee and Sugar","Condiments",
  "Drinks","Juice","Liquor","Rice","Snacks","Soap and Downy","Shampoo","Others.."
];

// Static products list for frontend-only display
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Bawang",
    category: "Condiments",
    price: 50,
    description: "Delicious crunchy biscuit.",
    imageUrl: "/images/bawang.jpg"
  },
  {
    id: 2,
    name: "Canned Tuna",
    category: "Canned Goods",
    price: 120,
    description: "High-quality canned tuna.",
    imageUrl: "/images/tuna.jpg"
  },
  // {
  //   id: 3,
  //   name: "Coffee Beans",
  //   category: "Coffee and Sugar",
  //   price: 200,
  //   description: "Premium roasted coffee beans.",
  //   imageUrl: "/images/coffee.jpg"
  // },
  // {
  //   id: 4,
  //   name: "Shampoo",
  //   category: "Shampoo",
  //   price: 150,
  //   description: "Gentle and nourishing shampoo.",
  //   imageUrl: "/images/shampoo.jpg"
  // }
];

const ProductList = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === "All" || p.category === categoryFilter)
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      return 0;
    });

  return (
    <div className="product-list-page">
      <div className="header">
        <div>
          <h1>Tindahan ni Lola</h1>
          <p>Manage your product inventory</p>
        </div>
        <button className="back-btn" onClick={() => (window.location.href = "/")}>
          🏠 Back to Home
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h4>{product.name}</h4>
                <p>{product.category}</p>
                <p className="desc">{product.description}</p>
                <p className="price">₱{product.price.toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-products">No products found.</p>
        )}
      </div>

      {/* Sticky Footer */}
      <footer className="footer">
        <p>© 2025 Tindahan ni Lola. Developed by Aizel Joy Lopez 🎬</p>
      </footer>
    </div>
  );
};

export default ProductList;
