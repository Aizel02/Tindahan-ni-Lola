import React, { useState } from "react";
import "./AddProductModal.css";

function AddProductModal({ onClose, onAdd }) {
  const [product, setProduct] = useState({
    image: "",
    name: "",
    category: "",
    price: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({ ...product, image: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(product);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add New Product</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>Product Image</label>
          <div
            className="image-upload"
            onClick={() => document.getElementById("fileInput").click()}
          >
            {product.image ? (
              <img src={product.image} alt="Preview" className="preview-img" />
            ) : (
              <span>📤 Click to upload image</span>
            )}
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>

          <label>Product Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Canned Sardines"
            value={product.name}
            onChange={handleChange}
            required
          />

          <label>Category</label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option>Canned Goods</option>
            <option>Bread</option>
            <option>Biscuits</option>
            <option>Shampoo</option>
            <option>Drinks</option>
            <option>Snacks</option>
            <option>Dairy</option>
            <option>Condiments</option>
          </select>

          <label>Price (₱)</label>
          <input
            type="number"
            name="price"
            placeholder="0.00"
            step="0.01"
            value={product.price}
            onChange={handleChange}
            required
          />

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-btn">
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductModal;
