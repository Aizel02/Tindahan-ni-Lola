import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./Liabilities.css";

const API_URL =
  "https://tindahan-ni-lola-backend-1.onrender.com/api/liabilities";

export default function Liabilities() {
  const [liabilities, setLiabilities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activePerson, setActivePerson] = useState(null); // add debt to same person
  const [editingDebt, setEditingDebt] = useState(null);   // edit debt

  const [form, setForm] = useState({
    debtorName: "",
    amount: "",
    description: "",
    dueDate: "",
  });

  // ✅ LOAD LIABILITIES
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setLiabilities)
      .catch(console.error);
  }, []);

  // ✅ ADD / UPDATE LIABILITY
  const saveLiability = async () => {
    if (!form.amount) return;

    const payload = {
      debtorName: activePerson || form.debtorName,
      amount: Number(form.amount),
      description: form.description,
      dueDate: form.dueDate || null,
    };

    const url = editingDebt
      ? `${API_URL}/${editingDebt.id}`
      : API_URL;

    const method = editingDebt ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    setLiabilities((prev) =>
      editingDebt
        ? prev.map((l) => (l.id === data.id ? data : l))
        : [...prev, data]
    );

    resetModal();
  };

  // ✅ MARK PAID
  const markPaid = async (id) => {
    const paidDate = new Date().toISOString().split("T")[0];

    await fetch(`${API_URL}/${id}/pay`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paidDate }),
    });

    setLiabilities((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: "Paid", paidDate } : l
      )
    );
  };

  // ✅ DELETE
  const deleteLiability = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setLiabilities((prev) => prev.filter((l) => l.id !== id));
  };

  // ✅ GROUP BY PERSON
  const grouped = liabilities.reduce((acc, item) => {
    acc[item.debtorName] = acc[item.debtorName] || [];
    acc[item.debtorName].push(item);
    return acc;
  }, {});

  const resetModal = () => {
    setShowModal(false);
    setActivePerson(null);
    setEditingDebt(null);
    setForm({ debtorName: "", amount: "", description: "", dueDate: "" });
  };

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

      {/* ===== GRID ===== */}
      {Object.keys(grouped).length === 0 ? (
        <p className="liabilities-empty">
          No liabilities recorded. Add one to get started!
        </p>
      ) : (
        <div className="liability-grid">
          {Object.entries(grouped).map(([name, list]) => {
            const total = list
              .filter((l) => l.status !== "Paid")
              .reduce((sum, l) => sum + Number(l.amount), 0);

            return (
              <div className="person-card" key={name}>
                <div className="person-header">
                  <div>
                    <h3>{name}</h3>
                    <span>{list.length} item(s)</span>
                  </div>
                  <span className="person-total">
                    ₱{total.toFixed(2)}
                  </span>
                </div>

                <div className="debt-list">
                  {list.map((l) => (
                    <div className="debt-card" key={l.id}>
                      <div>
                        <strong>{l.description || "Debt"}</strong>
                        <p>₱{l.amount}</p>
                        <span className="status">{l.status}</span>
                      </div>

                      <div className="debt-actions">
                        {l.status !== "Paid" && (
                          <button
                            className="pay"
                            onClick={() => markPaid(l.id)}
                          >
                            ✔
                          </button>
                        )}
                        <button
                          className="edit"
                          onClick={() => {
                            setEditingDebt(l);
                            setActivePerson(name);
                            setForm({
                              debtorName: name,
                              amount: l.amount,
                              description: l.description,
                              dueDate: l.dueDate || "",
                            });
                            setShowModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete"
                          onClick={() => deleteLiability(l.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="add-debt-btn"
                  onClick={() => {
                    setActivePerson(name);
                    setShowModal(true);
                  }}
                >
                  + Add Debt
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay">
          <div className="liability-modal">
            <div className="modal-header">
              <h3>
                {editingDebt
                  ? "Edit Debt"
                  : activePerson
                  ? `Add Debt for ${activePerson}`
                  : "Add New Liability"}
              </h3>
              <button className="close-btn" onClick={resetModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {!activePerson && (
                <>
                  <label>Debtor Name</label>
                  <input
                    value={form.debtorName}
                    onChange={(e) =>
                      setForm({ ...form, debtorName: e.target.value })
                    }
                  />
                </>
              )}

              <label>Amount (₱)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />

              <label>Description</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <label>Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
              />
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={resetModal}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={saveLiability}>
                {editingDebt ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        © 2025 Tindahan ni Lola. Developed by Aizel Joy Lopez
      </footer>
    </div>
  );
}
