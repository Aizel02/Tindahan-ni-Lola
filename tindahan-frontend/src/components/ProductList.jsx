import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./ProductList.css";
import { Pencil, ShoppingCart, Trash2, Printer, Search } from "lucide-react";
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
  /* ================= STATES ================= */
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  });

  const [editProduct, setEditProduct] = useState(null);
  const [cart, setCart] = useState([]);

  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  /* ================= FETCH ================= */
  const fetchProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
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

  /* ================= ADD ================= */
  const handleAddProduct = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("products").insert([{
      user_id: user.id,
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      description: newProduct.description,
    }]);

    setShowAddModal(false);
    setNewProduct({ name: "", category: "", price: "", description: "" });
    fetchProducts();
  };

  /* ================= UPDATE ================= */
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

  /* ================= DELETE ================= */
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  /* ================= CART ================= */
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  /* ================= PRINT ================= */
  const printReceipt = () => {
    const win = window.open("", "_blank", "width=350,height=600");
    win.document.write(`
<pre style="font-family:monospace;font-size:12px;width:80mm">
TINDAHAN NI LOLA
---------------------------
${cart.map(i =>
`${i.name} x${i.qty} ₱${(i.qty * i.price).toFixed(2)}`
).join("\n")}
---------------------------
TOTAL: ₱${cartTotal.toFixed(2)}
THANK YOU!
</pre>
<script>
window.onload = () => { window.print(); window.close(); }
</script>
`);
    win.document.close();
  };

  /* ================= FILTER ================= */
  const filteredProducts = products.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch =
      categoryFilter === "All" || p.category === categoryFilter;
    return nameMatch && catMatch;
  });

  /* ================= UI ================= */
  return (
    <div className="product-list-page">
      <Header
        cartCount={cart.length}
        onCartClick={() => setShowCartModal(true)}
      />

      {/* FILTERS */}
      <div className="filters">
        <Search size={16} />
        <input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <button onClick={() => setShowAddModal(true)}>
          <ShoppingCart size={16} /> Add Product
        </button>
      </div>

      {/* PRODUCTS */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div key={p.id} className="product-card">
              <img src={fallbackImage} alt={p.name} />
              <h4>{p.name}</h4>
              <p>₱{p.price}</p>

              <div className="card-actions">
                <button onClick={() => addToCart(p)}>
                  <ShoppingCart size={14} />
                </button>
                <button onClick={() => { setEditProduct(p); setShowEditModal(true); }}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDeleteProduct(p.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Product</h3>
            <input
              placeholder="Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />
            <button onClick={handleAddProduct}>Save</button>
            <button onClick={() => setShowAddModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Product</h3>
            <input
              value={editProduct.name}
              onChange={(e) =>
                setEditProduct({ ...editProduct, name: e.target.value })
              }
            />
            <button onClick={handleUpdateProduct}>Update</button>
            <button onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {showCartModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Shopping Cart</h3>
            {cart.map((i) => (
              <div key={i.id}>
                {i.name} x{i.qty}
                <button onClick={() => removeFromCart(i.id)}>✖</button>
              </div>
            ))}
            <h4>Total: ₱{cartTotal.toFixed(2)}</h4>
            <button onClick={() => setShowPrintConfirm(true)}>
              <Printer size={16} /> Print Receipt
            </button>
            <button onClick={() => setShowCartModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* PRINT CONFIRM */}
      {showPrintConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Print</h3>
            <p>Total: ₱{cartTotal.toFixed(2)}</p>
            <button onClick={printReceipt}>Yes, Print</button>
            <button onClick={() => setShowPrintConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <footer className="app-footer">© 2025 Tindahan ni Lola</footer>
    </div>
  );
}
