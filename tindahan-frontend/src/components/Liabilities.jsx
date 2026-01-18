import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./Liabilities.css";

const API_URL =
  "https://tindahan-ni-lola-backend-1.onrender.com/api/liabilities";

export default function Liabilities() {
  const [liabilities, setLiabilities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    debtorName: "",
    amount: "",
    description: "",
    dueDate: "",
  });

  // ✅ Load liabilities
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setLiabilities)
      .catch(console.error);
  }, []);

  // ✅ Add liability
  const addLiability = async () => {
    if (!form.debtorName || !form.amount) return;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount), // ✅ FIX
      }),
    });

    const data = await res.json();
    setLiabilities((prev) => [...prev, data]);
    setForm({ debtorName: "", amount: "", description: "", dueDate: "" });
    setShowModal(false);
  };

  // ✅ Mark as paid
  const markPaid = async (id) => {
    await fetch(`${API_URL}/${id}/pay`, { method: "PUT" });

    setLiabilities((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: "Paid" } : l
      )
    );
  };

  // ✅ Group by person
  const grouped = liabilities.reduce((acc, item) => {
    acc[item.debtorName] = acc[item.debtorName] || [];
    acc[item.debtorName].push(item);
    return acc;
  }, {});

  return (
    <div className="liabilities-page">
      <Header />

      <div className="liabilities-header">
        <input
          type="text"
          placeholder="Search person who owed..."
          className="liabilities-search"
        />
        <button
          className="add-liability-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Liability
        </button>
      </div>

      {/* ===== LIST ===== */}
      {Object.keys(grouped).length === 0 ? (
        <p className="liabilities-empty">
          No liabilities recorded. Add one to get started!
        </p>
      ) : (
        Object.entries(grouped).map(([name, list]) => {
          const total = list
            .filter((l) => l.status !== "Paid")
            .reduce((sum, l) => sum + Number(l.amount), 0);

          return (
            <div className="liability-group" key={name}>
              <div className="group-header">
                <h3>{name}</h3>
                <span className="total">₱{total.toFixed(2)}</span>
              </div>

              {list.map((l) => (
                <div className="liability-card" key={l.id}>
                  <div>
                    <strong>₱{l.amount}</strong>
                    <p>{l.description}</p>
                    <small>Due: {l.dueDate || "—"}</small>
                  </div>

                  {l.status !== "Paid" && (
                    <button
                      className="pay-btn"
                      onClick={() => markPaid(l.id)}
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })
      )}

      {/* ===== MODAL ===== */}
 {showModal && (
  <div className="modal-overlay">
    <div className="liability-modal">
      <div className="modal-header">
        <h3>Add New Liability</h3>
        <button className="close-btn" onClick={() => setShowModal(false)}>
          ✕
        </button>
      </div>

      <div className="modal-body">
        <label>Name of Person Who Borrowed (Debtor)</label>
        <input
          type="text"
          placeholder="e.g., Juan Dela Cruz"
          value={form.debtorName}
          onChange={(e) =>
            setForm({ ...form, debtorName: e.target.value })
          }
        />

        <label>Amount Borrowed (₱)</label>
        <input
          type="number"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />

        <label>Description / Notes</label>
        <input
          type="text"
          placeholder="e.g. Payment for goods, personal loan"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <label>Due Date (Optional)</label>
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) =>
            setForm({ ...form, dueDate: e.target.value })
          }
        />

        <label>Status</label>
        <select disabled>
          <option>Pending</option>
        </select>
      </div>

      <div className="modal-footer">
        <button className="cancel-btn" onClick={() => setShowModal(false)}>
          Cancel
        </button>
        <button className="confirm-btn" onClick={addLiability}>
          Add Liability
        </button>
      </div>
    </div>
  </div>
)}
 <footer className="footer">
        <p>© 2025 Tindahan ni Lola. Developed by Aizel Joy Lopez</p>
      </footer>
    </div>
  );
}
