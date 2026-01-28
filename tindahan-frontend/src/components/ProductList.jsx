import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./ProductList.css";
import { Pencil, ShoppingCart, Trash2, Printer, Loader, Search } from "lucide-react";


// Priority: NEXT_PUBLIC_API_URL (Next) -> REACT_APP_API_URL (CRA) -> deployed Render URL -> localhost
const API_URL = "https://tindahan-ni-lola-backend-1.onrender.com/api/products";
const BACKEND_BASE = "https://tindahan-ni-lola-backend-1.onrender.com";
const fallbackImage = "/no-image.png";

const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return fallbackImage;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${BACKEND_BASE}${imageUrl}`;
};

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


const ProductList = async () => {
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
  // 🛒 CART + QUANTITY MODAL STATES
const [cart, setCart] = useState([]);
const [showQtyModal, setShowQtyModal] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);
const [quantity, setQuantity] = useState(1);
const [showCartModal, setShowCartModal] = useState(false);
const [user, setUser] = useState(null);


  // ✅ correct place
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

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
        .row {
          display: flex;
          justify-content: space-between;
        }
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

      ${cart.map(item => `
        <div class="row small">
          <span>${item.name}</span>
          <span>${item.qty}  ₱${(item.qty * item.price).toFixed(2)}</span>
        </div>
      `).join("")}

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
 // ✅ FIXED: auth + fetch inside useEffect
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user;

      if (!currentUser) return;

      setUser(currentUser);
      fetchProducts();
    };

    init();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };


  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("price", newProduct.price);
    formData.append("description", newProduct.description || "");

    if (newProduct.imageFile)
      formData.append("image", newProduct.imageFile);

    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      fetchProducts();
      setShowAddModal(false);
      setNewProduct({
        name: "",
        category: "",
        price: "",
        description: "",
        imageFile: null,
      });
    }
  };

  const handleDeleteProduct = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchProducts();
  };
const handleUpdateProduct = async () => {
  if (!editProduct) return;

  try {
    const formData = new FormData();
    formData.append("name", editProduct.name);
    formData.append("category", editProduct.category);
    formData.append("price", editProduct.price);
    formData.append("description", editProduct.description || "");

    if (editProduct.imageFile) {
      formData.append("image", editProduct.imageFile);
    }

    await fetch(`${API_URL}/${editProduct.id}`, {
      method: "PUT",
      body: formData,
    });

    setShowEditModal(false);
    fetchProducts(); // refresh list
  } catch (err) {
    console.error("Update failed", err);
  }
};

// ➕ ADD TO CART
// ➕ ADD TO CART
const addToCart = (product, qty) => {
  setCart((prev) => {
    const existing = prev.find((item) => item.id === product.id);

    if (existing) {
      return prev.map((item) =>
        item.id === product.id
          ? { ...item, qty: item.qty + qty }
          : item
      );
    }

    return [
      ...prev,
      {
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty,
      },
    ];
  });
};

// ❌ REMOVE ITEM FROM CART (MUST BE OUTSIDE)
const removeFromCart = (id) => {
  setCart((prev) => prev.filter((item) => item.id !== id));
};
// 💰 CART TOTAL
// const cartTotal = cart.reduce(
//   (sum, item) => sum + item.qty * item.price,
//   0
// );

  const filteredProducts = products
    .filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const catMatch =
        categoryFilter === "All" ||
        (p.category && p.category.toLowerCase() === categoryFilter.toLowerCase());
      return nameMatch && catMatch;
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "price")
        return parseFloat(a.price || 0) - parseFloat(b.price || 0);
      return 0;
    });

  return (
    <div className="product-list-page">
      <Header
  cartCount={cart.length}
  onCartClick={() => setShowCartModal(true)}
/>

{/* QUANTITY MODAL */}
{showQtyModal && selectedProduct && (
  <div className="modal-overlay">
    <div className="qty-modal">
      <div className="qty-header">
        <h3>Select Quantity</h3>
        <button onClick={() => setShowQtyModal(false)}>✖</button>
      </div>

      <img
        src={normalizeImageUrl(selectedProduct.imageUrl)}
        alt={selectedProduct.name}
        className="qty-image"
      />

      <h4>{selectedProduct.name}</h4>
      <p>{selectedProduct.category}</p>
      <p>₱{Number(selectedProduct.price).toFixed(2)}</p>

      <div className="qty-controls">
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>

      <div className="summary-box">
        <p>Unit Price: ₱{selectedProduct.price}</p>
        <p>Quantity: {quantity} pc</p>
        <h4>Total: ₱{(quantity * selectedProduct.price).toFixed(2)}</h4>
      </div>

      <div className="modal-footer">
        <button onClick={() => setShowQtyModal(false)}>Cancel</button>
        <button
          className="confirm"
          onClick={() => {
            addToCart(selectedProduct, quantity);
            setShowQtyModal(false); // 🔙 back to product screen
          }}
        >
          Add ({quantity})
        </button>
      </div>
    </div>
  </div>
)}

      <div className="filters">
        <div className="search-box">
  <Search size={16} className="search-icon" />
  <input
    type="text"
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
            <option key={cat} value={cat}>
              {cat}
            </option>
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

      {loading ? (
        <p className="status-text"><Loader size={16} /> Loading products...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const id = product.id || product._id;
              return (
                <div key={id || Math.random()} className="product-card">
                 <img
  src={normalizeImageUrl(product.imageUrl || product.image || "")}
  alt={product.name || "product"}
  className="product-image"
  onClick={() => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowQtyModal(true);
  }}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallbackImage;
  }}
/>

                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p>{product.category}</p>
                    <p className="desc">{product.description}</p>
                    <p className="price">
                      ₱{Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => {
                        setEditProduct(product);
                        setShowEditModal(true);
                      }}
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button onClick={() => handleDeleteProduct(id)}><Trash2 size={16} /> Delete</button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-products">No products found.</p>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button onClick={() => setShowAddModal(false)}>✖</button>
            </div>
            <div className="modal-body">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, imageFile: e.target.files?.[0] })
                }
              />
              <label>Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
              <label>Category</label>
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <label>Description</label>
              <textarea
                rows="3"
                placeholder="Enter product description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
              <label>Price (₱)</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
            </div>
            <div className="modal-footer">
              <button className="cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="confirm" onClick={handleAddProduct}>
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button onClick={() => setShowEditModal(false)}>✖</button>
            </div>
            <div className="modal-body">
              <label>Change Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditProduct({ ...editProduct, imageFile: e.target.files?.[0] })
                }
              />
              <label>Product Name</label>
              <input
                type="text"
                value={editProduct.name || ""}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, name: e.target.value })
                }
              />
              <label>Category</label>
              <select
                value={editProduct.category || ""}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, category: e.target.value })
                }
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <label>Description</label>
              <textarea
                rows="3"
                value={editProduct.description || ""}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, description: e.target.value })
                }
              />
              <label>Price (₱)</label>
              <input
                type="number"
                value={editProduct.price || ""}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, price: e.target.value })
                }
              />
            </div>
            <div className="modal-footer">
              <button className="cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="confirm" onClick={handleUpdateProduct}>
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
{/* CART MODAL */}
{showCartModal && (
  <div className="modal-overlay">
    <div className="cart-modal">
      <div className="cart-header">
        <h3>Shopping Cart</h3>
        <button onClick={() => setShowCartModal(false)}>✖</button>
      </div>
        {/* SCROLLABLE ITEMS */}
  {/* SCROLLABLE CART LIST */}
<div className="cart-list scrollable">
  {cart.length === 0 ? (
    <div className="empty-cart">
      <strong>Your cart is empty</strong>
      <span>Click products to add items</span>
    </div>
  ) : (
    cart.map((item) => (
      <div className="cart-item" key={item.id}>
        <img
          src={normalizeImageUrl(item.imageUrl)}
          alt={item.name}
          className="cart-item-img"
        />

        <div className="cart-item-info">
          <h4>{item.name}</h4>
          <p>Qty: {item.qty} × ₱{item.price}</p>
        </div>

        <div className="cart-item-price">
          ₱{(item.qty * item.price).toFixed(2)}
          <button
            className="remove-btn"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    ))
  )}
</div>

      {/* RECEIPT (PRINT AREA) */}

      <div className="cart-footer">
        <h4>Grand Total: <span>₱{cartTotal.toFixed(2)}</span></h4>

        <div className="cart-buttons">
  <button onClick={() => setShowCartModal(false)}>
    Continue Shopping
  </button>
<button className="print-btn" onClick={printReceipt}>
  <Printer size={16} /> Print Receipt
</button>

  <button
    className="confirm"
    onClick={() => {
      setCart([]);
      setShowCartModal(false);
    }}
  >
    OK – Confirm & Reset
  </button>
</div>

      </div>
    </div>
  </div>
)}

      {/* Sticky Footer */}
    <footer className="app-footer">
  © 2025 Tindahan ni Lola. Developed by Aizel Joy Lopez
</footer>
    </div>
  );
};

export default ProductList;
