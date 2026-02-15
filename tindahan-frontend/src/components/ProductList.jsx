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

export default function ProductList() {
  // =========================
  // STATES
  // =========================
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  });

  const [editProduct, setEditProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [cart, setCart] = useState([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  // =========================
  // FETCH PRODUCTS
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
    if (!newProduct.name || !newProduct.price) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("products").insert([
      {
        user_id: user.id,
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        description: newProduct.description,
      },
    ]);

    setShowAddModal(false);
    setNewProduct({ name: "", category: "", price: "", description: "" });
    fetchProducts();
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
  // CART
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
  // THERMAL PRINT
  // =========================
  const printReceipt = () => {
    const win = window.open("", "_blank", "width=350,height=600");

    win.document.write(`
      <pre style="font-family: monospace; width:80mm">
TINDAHAN NI LOLA
------------------------------
${cart.map(
  (i) => `${i.name} x${i.qty}  ₱${(i.qty * i.price).toFixed(2)}`
).join("\n")}
------------------------------
TOTAL: ₱${cartTotal.toFixed(2)}
------------------------------
THANK YOU!
      </pre>
      <script>
        window.onload = () => { window.print(); window.close(); }
      </script>
    `);

    win.document.close();
  };

  // =========================
  // FILTER
  // =========================
  const filteredProducts = products
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (p) =>
        categoryFilter === "All" ||
        p.category === categoryFilter
    )
    .sort((a, b) =>
      sortBy === "price"
        ? a.price - b.price
        : a.name.localeCompare(b.name)
    );

  // =========================
  // UI
  // =========================
  return (
    <div className="product-list-page">
      <Header
        cartCount={cart.length}
        onCartClick={() => setShowCartModal(true)}
      />

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
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>

        <button onClick={() => setShowAddModal(true)}>
          <ShoppingCart size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <p><Loader size={16} /> Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div key={p.id} className="product-card">
              <img
                src={fallbackImage}
                alt={p.name}
                onClick={() => {
                  setSelectedProduct(p);
                  setQuantity(1);
                  setShowQtyModal(true);
                }}
              />
              <h4>{p.name}</h4>
              <p>₱{p.price.toFixed(2)}</p>

              <button onClick={() => { setEditProduct(p); setShowEditModal(true); }}>
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDeleteProduct(p.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showQtyModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{selectedProduct.name}</h3>
            <button onClick={() => setQuantity(quantity - 1)}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
            <button onClick={() => {
              addToCart(selectedProduct, quantity);
              setShowQtyModal(false);
            }}>
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {showCartModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cart</h3>
            {cart.map((i) => (
              <div key={i.id}>
                {i.name} x{i.qty}
                <button onClick={() => removeFromCart(i.id)}>x</button>
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
        © 2025 Tindahan ni Lola
      </footer>
    </div>
  );
}
