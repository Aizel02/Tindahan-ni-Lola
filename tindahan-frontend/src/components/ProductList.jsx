import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./ProductList.css";
import {
  Pencil,
  ShoppingCart,
  Trash2,
  Printer,
  Loader,
  Search,
} from "lucide-react";
import { supabase } from "../supabaseClient";

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
  });

  const [editProduct, setEditProduct] = useState(null);

  // 🛒 CART + MODALS
  const [cart, setCart] = useState([]);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  // =========================
  // THERMAL RECEIPT PRINT
  // =========================
  const printReceipt = () => {
    const win = window.open("", "_blank", "width=350,height=600");

    const receipt = `
    <html>
      <head>
        <style>
          body {
            font-family: monospace;
            width: 80mm;
            margin: 0;
            padding: 10px;
          }
          .center { text-align: center; }
          .line { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; }
          .small { font-size: 12px; }
        </style>
      </head>
      <body>

        <div class="center">
          ==============================<br/>
          <strong>TINDAHAN NI LOLA</strong><br/>
          Receipt of Sale<br/>
          ==============================
        </div>

        <br/>
        <div class="center">${new Date().toLocaleString()}</div>
        <br/>

        <div class="row small">
          <strong>ITEM</strong>
          <strong>QTY&nbsp;&nbsp;TOTAL</strong>
        </div>
        <div class="line"></div>

        ${cart
          .map(
            (item) => `
          <div class="row small">
            <span>${item.name}</span>
            <span>${item.qty}  ₱${(item.qty * item.price).toFixed(2)}</span>
          </div>
        `
          )
          .join("")}

        <div class="line"></div>

        <div class="row small">
          <span>Items:</span>
          <span>${cart.length}</span>
        </div>

        <div class="row small">
          <span>Subtotal:</span>
          <span>₱${cartTotal.toFixed(2)}</span>
        </div>

        <div class="line"></div>

        <div class="row">
          <strong>TOTAL:</strong>
          <strong>₱${cartTotal.toFixed(2)}</strong>
        </div>

        <br/>
        <div class="center">
          ==============================<br/>
          Thank you for your purchase!<br/>
          Visit us again!<br/>
          ==============================
        </div>

        <script>
          window.onload = () => {
            window.print();
            window.close();
          };
        </script>

      </body>
    </html>
    `;

    win.document.write(receipt);
    win.document.close();
  };

  // =========================
  // FETCH PRODUCTS (SUPABASE)
  // =========================
  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;

      setProducts(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // ADD PRODUCT
  // =========================
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Fill all fields");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("products").insert([
        {
          user_id: user.id,
          name: newProduct.name,
          category: newProduct.category,
          price: Number(newProduct.price),
          description: newProduct.description || "",
        },
      ]);

      if (error) throw error;

      setShowAddModal(false);
      setNewProduct({
        name: "",
        category: "",
        price: "",
        description: "",
      });

      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  // =========================
  // UPDATE PRODUCT
  // =========================
  const handleUpdateProduct = async () => {
    if (!editProduct) return;

    await supabase
      .from("products")
      .update({
        name: editProduct.name,
        category: editProduct.category,
        price: Number(editProduct.price),
        description: editProduct.description,
      })
      .eq("id", editProduct.id);

    setShowEditModal(false);
    fetchProducts();
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const handleDeleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  // =========================
  // CART LOGIC
  // =========================
  const addToCart = (product, qty) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // =========================
  // FILTER
  // =========================
  const filteredProducts = products
    .filter((p) => {
      const nameMatch = p.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const catMatch =
        categoryFilter === "All" ||
        p.category?.toLowerCase() === categoryFilter.toLowerCase();
      return nameMatch && catMatch;
    })
    .sort((a, b) =>
      sortBy === "price" ? a.price - b.price : a.name.localeCompare(b.name)
    );

  return (
    <div className="product-list-page">
      <Header cartCount={cart.length} onCartClick={() => setShowCartModal(true)} />

      {/* FILTERS */}
      <div className="filters">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>

        <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
          <ShoppingCart size={16} /> Add Product
        </button>
      </div>

      {/* PRODUCTS */}
      {loading ? (
        <p className="status-text">
          <Loader size={16} /> Loading products...
        </p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div key={p.id} className="product-card">
              <img
                src={fallbackImage}
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
                <p>{p.category}</p>
                <p className="desc">{p.description}</p>
                <p className="price">₱{p.price.toFixed(2)}</p>
              </div>

              <div className="card-actions">
                <button onClick={() => { setEditProduct(p); setShowEditModal(true); }}>
                  <Pencil size={16} /> Edit
                </button>
                <button onClick={() => handleDeleteProduct(p.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CART MODAL */}
      {showCartModal && (
        <div className="modal-overlay">
          <div className="cart-modal">
            <h3>Shopping Cart</h3>

            {cart.map((item) => (
              <div key={item.id}>
                {item.name} × {item.qty}
                <button onClick={() => removeFromCart(item.id)}>X</button>
              </div>
            ))}

            <h4>Total: ₱{cartTotal.toFixed(2)}</h4>

            <button onClick={printReceipt}>
              <Printer size={16} /> Print Receipt
            </button>
          </div>
        </div>
      )}

      <footer className="app-footer">
        © 2025 Tindahan ni Lola. Developed by Aizel Joy Lopez
      </footer>
    </div>
  );
};

export default ProductList;
