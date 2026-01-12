import React, { useState, useEffect } from "react";
import "./ProductList.css";

const API_URL = "https://tindahan-ni-lola-backend-1.onrender.com/api/products";
const BACKEND_BASE = "https://tindahan-ni-lola-backend-1.onrender.com";
const fallbackImage = "/no-image.png";

const CATEGORIES = [
  "Biscuits",
  "Canned Goods",
  "Cigarettes",
  "Coffee and Sugar",
  "Condiments",
  "Drinks",
  "Juice",
  "Liquor",
  "Rice",
  "Snacks",
  "Soap and Downy",
  "Shampoo",
  "Others..",
];

const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return fallbackImage;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${BACKEND_BASE}${imageUrl}`;
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    imageFile: null,
  });

  const [editProduct, setEditProduct] = useState(null);

  // 🛒 CART
  const [cart, setCart] = useState([]);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // ➕ ADD TO CART (FIXED)
  const addToCart = (product, qty) => {
    const pid = product.id || product._id;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === pid);
      if (existing) {
        return prev.map((i) =>
          i.id === pid ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          id: pid,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          qty,
        },
      ];
    });
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const filteredProducts = products
    .filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (p) =>
        categoryFilter === "All" ||
        p.category?.toLowerCase() === categoryFilter.toLowerCase()
    )
    .sort((a, b) =>
      sortBy === "price"
        ? a.price - b.price
        : a.name.localeCompare(b.name)
    );

  return (
    <div className="product-list-page">
      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Tindahan ni Lola</h1>
          <p>Manage your product inventory</p>
        </div>

        <button className="cart-btn" onClick={() => setShowCartModal(true)}>
          🛒 View Cart
          {cart.length > 0 && <span className="badge">{cart.length}</span>}
        </button>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* PRODUCTS */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div key={p.id || p._id} className="product-card">
              <div className="product-card">
  <img
    src={normalizeImageUrl(p.imageUrl)}
    alt={p.name}
    className="product-image"
    onClick={() => {
      setSelectedProduct(p);
      setQuantity(1);
      setShowQtyModal(true);
    }}
  />

  <div className="product-info">
    <h4>{p.name}</h4>
    <p className="category">{p.category}</p>
    <p className="price">₱{Number(p.price).toFixed(2)}</p>
  </div>

  {/* 👇 EDIT & DELETE ARE BACK */}
  <div className="card-actions">
    <button
      className="edit-btn"
      onClick={() => {
        setEditProduct(p);
        setShowEditModal(true);
      }}
    >
      ✏️ Edit
    </button>

    <button
      className="delete-btn"
      onClick={() => handleDeleteProduct(p.id || p._id)}
    >
      🗑️ Delete
    </button>
  </div>
</div>

              <img
                src={normalizeImageUrl(p.imageUrl)}
                alt={p.name}
                className="product-image"
                onClick={() => {
                  setSelectedProduct(p);
                  setQuantity(1);
                  setShowQtyModal(true);
                }}
              />
              <h4>{p.name}</h4>
              <p>{p.category}</p>
              <p>₱{p.price}</p>
            </div>
          ))}
        </div>
      )}

      {/* 🔢 QUANTITY MODAL */}
      {showQtyModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{selectedProduct.name}</h3>

            <img
              src={normalizeImageUrl(selectedProduct.imageUrl)}
              alt=""
            />

            <div className="qty-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>

            <p>Total: ₱{(quantity * selectedProduct.price).toFixed(2)}</p>

            <div className="modal-footer">
              <button onClick={() => setShowQtyModal(false)}>Cancel</button>
              <button
                className="confirm"
                onClick={() => {
                  addToCart(selectedProduct, quantity);
                  setShowQtyModal(false);
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛒 CART MODAL */}
      {showCartModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Shopping Cart</h3>

            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={normalizeImageUrl(item.imageUrl)} alt="" />
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.qty} × ₱{item.price}</p>
                </div>
                <span>₱{(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}

            <h4>Total: ₱{cartTotal.toFixed(2)}</h4>

            <div className="modal-footer">
              <button onClick={() => setShowCartModal(false)}>
                Continue
              </button>
              <button
                className="confirm"
                onClick={() => {
                  alert(`Total Bill ₱${cartTotal.toFixed(2)}`);
                  setCart([]);
                  setShowCartModal(false);
                }}
              >
                OK – Confirm & Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        © 2025 Tindahan ni Lola
      </footer>
    </div>
  );
};

export default ProductList;
