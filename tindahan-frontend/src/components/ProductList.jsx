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

/* ===================== IMAGE UPLOAD ===================== */
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  if (!res.ok) throw new Error("Image upload failed");
  return data.secure_url;
};

const fallbackImage = "/no-image.png";
const normalizeImageUrl = (url) =>
  url && url.startsWith("http") ? url : fallbackImage;

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

  /* 🛒 CART */
  const [cart, setCart] = useState([]);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  /* ===================== FETCH ===================== */
  const fetchProducts = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ===================== PRINT RECEIPT ===================== */
  const printReceipt = () => {
    const win = window.open("", "_blank", "width=350,height=600");

    const receipt = `
    <html>
      <body style="font-family: monospace; width: 80mm; padding: 10px;">
        <center>
          ==============================<br/>
          <b>TINDAHAN NI LOLA</b><br/>
          Receipt of Sale<br/>
          ==============================<br/><br/>
          ${new Date().toLocaleString()}
        </center><br/>

        ${cart
          .map(
            (item) => `
            ${item.name} <br/>
            ${item.qty} × ₱${item.price} = ₱${(
              item.qty * item.price
            ).toFixed(2)}<br/><br/>
          `
          )
          .join("")}

        ------------------------------<br/>
        TOTAL: ₱${cartTotal.toFixed(2)}<br/>
        ------------------------------<br/><br/>

        <center>Thank you!<br/>Visit again!</center>

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

  
  /* * ===================== ADD PRODUCT ===================== */
  const handleAddProduct = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let image_url = null;
    if (newProduct.imageFile) {
      image_url = await uploadToCloudinary(newProduct.imageFile);
    }

    await supabase.from("products").insert([
      {
        user_id: user.id,
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        image_url,
      },
    ]);

    setShowAddModal(false);
    setNewProduct({
      name: "",
      category: "",
      price: "",
      description: "",
      imageFile: null,
    });

    fetchProducts();
  };

  /* ===================== UPDATE PRODUCT ===================== */
  const handleUpdateProduct = async () => {
    let image_url = editProduct.image_url;

    if (editProduct.imageFile) {
      image_url = await uploadToCloudinary(editProduct.imageFile);
    }

    await supabase
      .from("products")
      .update({
        name: editProduct.name,
        category: editProduct.category,
        price: Number(editProduct.price),
        image_url,
      })
      .eq("id", editProduct.id);

    setShowEditModal(false);
    setEditProduct(null);
    fetchProducts();
  };

  /* ===================== DELETE PRODUCT ===================== */

const handleDeleteProduct = async (id) => {
  await supabase.from("products").delete().eq("id", id);
  fetchProducts();
};

  const removeFromCart = (id) => {
  setCart((prev) => prev.filter((item) => item.id !== id));
};


  /* ===================== CART LOGIC (FIXED) ===================== */
  const addToCart = (product, qty) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
  };
  // 🔍 FILTERING (UNCHANGED)
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
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
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
     ) : (
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const id = product.id || product._id;
              return (
                <div key={id || Math.random()} className="product-card">
                 <img
  src={normalizeImageUrl(product.image_url)}
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
                   <button onClick={() => handleDeleteProduct(product.id)}>
  <Trash2 size={16} /> Delete
</button>

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
        <button onClick={() => removeFromCart(item.id)}>
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
