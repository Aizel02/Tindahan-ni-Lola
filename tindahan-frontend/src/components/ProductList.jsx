import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./ProductList.css";
import { Pencil, ShoppingCart, Trash2, Search, Printer } from "lucide-react";
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
  "Others",
];

export default function ProductList() {
  /* ===================== STATES ===================== */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [productToDelete, setProductToDelete] = useState(null);


  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    imageFile: null,
  });

  const [editProduct, setEditProduct] = useState(null);
  const [cart, setCart] = useState([]);
 const [showQtyModal, setShowQtyModal] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);
const [qty, setQty] = useState(1);

const openQtyModal = (product) => {
  setSelectedProduct(product);
  setQty(1);
  setShowQtyModal(true);
};



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
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("Cloudinary error:", data);
    throw new Error("Image upload failed");
  }

  return data.secure_url; // 👈 use THIS in <img src="">
};

  /* ===================== ADD PRODUCT ===================== */
 const handleAddProduct = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  let imageUrl = null;

  if (newProduct.imageFile) {
    imageUrl = await uploadToCloudinary(newProduct.imageFile);
  }

  await supabase.from("products").insert([
    {
      user_id: user.id,
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      image_url: imageUrl,
    },
  ]);

  setShowAddModal(false);
  setNewProduct({
    name: "",
    category: "",
    price: "",
    imageFile: null,
  });

  fetchProducts();
};



  /* ===================== UPDATE PRODUCT ===================== */
  const handleUpdateProduct = async () => {
  let imageUrl = editProduct.image_url;

  try {
    if (editProduct.imageFile) {
      imageUrl = await uploadToCloudinary(editProduct.imageFile);
    }

    await supabase
      .from("products")
      .update({
        name: editProduct.name,
        category: editProduct.category,
        price: Number(editProduct.price),
        image_url: imageUrl,
      })
      .eq("id", editProduct.id);

    setShowEditModal(false);
    setEditProduct(null);
    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
};
// ===================== DELETE PRODUCT (DITO 👇) =====================
const handleDeleteClick = (product) => {
  setProductToDelete(product);
  setShowDeleteModal(true);
};

const confirmDeleteProduct = async () => {
  if (!productToDelete) return;

  await supabase
    .from("products")
    .delete()
    .eq("id", productToDelete.id);

  setShowDeleteModal(false);
  setProductToDelete(null);
  fetchProducts();
};


  /* ===================== CART ===================== */
const confirmAddToCart = () => {
  setCart((prev) => {
    const found = prev.find((i) => i.id === selectedProduct.id);

    if (found) {
      return prev.map((i) =>
        i.id === selectedProduct.id
          ? { ...i, qty: i.qty + qty }
          : i
      );
    }

    return [...prev, { ...selectedProduct, qty }];
  });

  setShowQtyModal(false);
  setSelectedProduct(null);
};


// ✅ ADD THIS RIGHT HERE
const cartTotal = cart.reduce(
  (sum, item) => sum + item.qty * item.price,
  0
);

  /* ===================== thermal printer  ===================== */
  // ✅ ADD THIS RIGHT AFTER cartTotal
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

  /* ===================== FILTER ===================== */
  const filteredProducts = products.filter((p) => {
    const nameMatch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const catMatch =
      categoryFilter === "All" || p.category === categoryFilter;
    return nameMatch && catMatch;
  });

  /* ===================== UI ===================== */
  return (
    <div className="product-list-page">
      <Header
        cartCount={cart.length}
        onCartClick={() => setShowCartModal(true)}
      />

      {/* FILTER BAR */}
      <div className="filters">
 <div className="search-box">
  <Search className="search-icon" size={16} />
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

  <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
    <ShoppingCart size={16} />
    Add Product
  </button>
</div>


      {/* PRODUCTS */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div key={p.id} className="product-card">
              <img
  src={p.image_url || fallbackImage}
  alt={p.name}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallbackImage;
  }}
/>
{/* QTY MODAL (GLOBAL) */}
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
              <h4>{p.name}</h4>
              <p>₱{p.price}</p>

              <div className="card-actions">
                <button onClick={() => openQtyModal(p)}>
  <ShoppingCart size={14} />
</button>
                <button
                  onClick={() => {
                    setEditProduct(p);
                    setShowEditModal(true);
                  }}
                >
                  <Pencil size={14} />
                </button>

                <button onClick={() => handleDeleteClick(p)}>
  <Trash2 size={14} />
</button>
{/* DELETE CONFIRM MODAL */}
{showDeleteModal && productToDelete && (
  <div
    className="modal-overlay"
    onClick={() => {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }}
  >
    <div
      className="modal delete-modal animate-scale"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Delete Product</h3>

      <p>
        Are you sure you want to delete
        <strong> “{productToDelete.name}”</strong>?
      </p>

      <div className="modal-actions">
        <button className="btn danger" onClick={confirmDeleteProduct}>
          Delete
        </button>

        <button
          className="btn"
          onClick={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
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

      {/* EDIT MODAL (THIS FIXES ESLINT) */}
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

      {/* TOTALS */}
      <div className="cart-summary">
        <div className="row">
          <span>Subtotal ({cart.length} items):</span>
          <span>₱{cartTotal.toFixed(2)}</span>
        </div>

        <div className="row grand">
          <span>Grand Total:</span>
          <span>₱{cartTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="cart-actions">
        <button
          className="btn outline"
          onClick={() => setShowCartModal(false)}
        >
          Continue Shopping
        </button>

        <button className="btn blue" onClick={printReceipt}>
         <Printer size={14} /> Print Receipt
          </button>
        <button
          className="btn green"
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
)}
    </div>
  );
}
