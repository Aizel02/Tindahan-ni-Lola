import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./ProductList.css";
import {
  ShoppingCart,
  Trash2,
  Printer,
  Loader

} from "lucide-react";
import { supabase } from "../supabaseClient";

export default function ProductList() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });

  /* =========================
     INIT USER + STORE
  ========================= */
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      setUser(session.user);

      // 🏪 AUTO CREATE STORE
      await supabase.from("stores").upsert({
        user_id: session.user.id,
        store_name: "My Store",
      });

      fetchProducts(session.user.id);
    };

    init();
  }, []);

  /* =========================
     FETCH PRODUCTS (PER USER)
  ========================= */
  const fetchProducts = async (userId) => {
    setLoading(true);

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    setProducts(data || []);
    setLoading(false);
  };

  /* =========================
     ADD PRODUCT
  ========================= */
  const handleAddProduct = async () => {
    await supabase.from("products").insert({
      ...newProduct,
      price: Number(newProduct.price),
      user_id: user.id,
    });

    setShowAddModal(false);
    setNewProduct({ name: "", price: "", category: "", description: "" });
    fetchProducts(user.id);
  };

  /* =========================
     DELETE (WITH CONFIRM)
  ========================= */
  const handleDeleteProduct = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    await supabase.from("products").delete().eq("id", id);
    fetchProducts(user.id);
  };

  /* =========================
     CART
  ========================= */
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found)
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );

      return [...prev, { ...product, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

  /* =========================
     SAVE SALE + RECEIPT
  ========================= */
  const confirmSale = async () => {
    const { data: sale } = await supabase
      .from("sales")
      .insert({
        user_id: user.id,
        total: cartTotal,
      })
      .select()
      .single();

    const receiptText = cart
      .map((i) => `${i.name} x${i.qty} ₱${i.qty * i.price}`)
      .join("\n");

    await supabase.from("receipts").insert({
      sale_id: sale.id,
      content: receiptText,
    });

    printReceipt(receiptText);
    setCart([]);
    setShowCartModal(false);
  };

  /* =========================
     PRINT
  ========================= */
  const printReceipt = (text) => {
    const win = window.open("", "_blank", "width=350,height=600");
    win.document.write(`
      <pre style="font-family:Courier New;width:80mm">
TINDAHAN NI LOLA
------------------
${text}
------------------
TOTAL: ₱${cartTotal}
      </pre>
      <script>
        window.onload = () => { window.print(); window.close(); }
      </script>
    `);
    win.document.close();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="product-list-page">
      <Header
        cartCount={cart.length}
        onCartClick={() => setShowCartModal(true)}
      />

      {loading ? (
        <Loader />
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <h4>{p.name}</h4>
              <p>₱{p.price}</p>

              <button onClick={() => addToCart(p)}>
                <ShoppingCart size={14} />
              </button>

              <button onClick={() => handleDeleteProduct(p.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal">
          <input
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
          <input
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />
          <button onClick={handleAddProduct}>Save</button>
        </div>
      )}

      {showCartModal && (
        <div className="modal">
          <p>Total: ₱{cartTotal}</p>
          <button onClick={confirmSale}>
            <Printer size={16} /> Print & Save
          </button>
        </div>
      )}

      <footer className="app-footer">
        © 2025 Tindahan ni Lola
      </footer>
    </div>
  );
}
