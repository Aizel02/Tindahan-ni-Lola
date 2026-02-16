import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./ProductList.css";
import { Pencil, ShoppingCart, Trash2, Search } from "lucide-react";
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

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    imageFile: null,
  });

  const [editProduct, setEditProduct] = useState(null);
  const [cart, setCart] = useState([]);

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
  const uploadImage = async (file, userId) => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    await supabase.storage
      .from("product-images")
      .upload(path, file);

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return data.publicUrl;
  };

  /* ===================== ADD PRODUCT ===================== */
  const handleAddProduct = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let imageUrl = null;
    if (newProduct.imageFile) {
      imageUrl = await uploadImage(newProduct.imageFile, user.id);
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
    setNewProduct({ name: "", category: "", price: "", imageFile: null });
    fetchProducts();
  };

  /* ===================== UPDATE PRODUCT ===================== */
  const handleUpdateProduct = async () => {
    let imageUrl = editProduct.image_url;

    if (editProduct.imageFile) {
      imageUrl = await uploadImage(
        editProduct.imageFile,
        editProduct.user_id
      );
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
  };

  /* ===================== CART ===================== */
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

  const cartTotal = cart.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

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
              <img
                src={p.image_url || fallbackImage}
                alt={p.name}
              />

              <h4>{p.name}</h4>
              <p>₱{p.price}</p>

              <div className="card-actions">
                <button onClick={() => addToCart(p)}>
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

                <button>
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
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  imageFile: e.target.files[0],
                })
              }
            />

            <input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />

            <select
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  category: e.target.value,
                })
              }
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />

            <button onClick={handleAddProduct}>Add</button>
            <button onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL (THIS FIXES ESLINT) */}
      {showEditModal && editProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Product</h3>

            <input
              value={editProduct.name}
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  name: e.target.value,
                })
              }
            />

            <select
              value={editProduct.category}
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  category: e.target.value,
                })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              type="number"
              value={editProduct.price}
              onChange={(e) =>
                setEditProduct({
                  ...editProduct,
                  price: e.target.value,
                })
              }
            />

            <button onClick={handleUpdateProduct}>
              Update
            </button>
            <button onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* CART MODAL */}
      {showCartModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cart</h3>

            {cart.map((i) => (
              <p key={i.id}>
                {i.name} x{i.qty}
              </p>
            ))}

            <h4>Total: ₱{cartTotal.toFixed(2)}</h4>

            <button onClick={() => window.print()}>
              Print Receipt
            </button>

            <button onClick={() => setShowCartModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
