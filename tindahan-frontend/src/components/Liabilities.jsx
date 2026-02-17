import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./Liabilities.css";
import { Pencil, Trash2, Search } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function Liabilities() {
  const [liabilities, setLiabilities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activePerson, setActivePerson] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    debtorName: "",
    amount: "",
    description: "",
    dueDate: "",
  });

  /* ================= LOAD LIABILITIES ================= */
  const loadLiabilities = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to view liabilities.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("liabilities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD ERROR:", error);
      alert(error.message);
    } else {
      setLiabilities(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadLiabilities();
  }, []);

  /* ================= ADD / UPDATE ================= */
  const saveLiability = async () => {
    if (!form.amount) {
      alert("Amount is required");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Not authenticated");
      return;
    }

    const payload = {
      user_id: user.id,
      debtor_name: activePerson || form.debtorName,
      amount: Number(form.amount),
      description: form.description,
      due_date: form.dueDate || null,
    };

    let result;

    if (editingDebt) {
      result = await supabase
        .from("liabilities")
        .update(payload)
        .eq("id", editingDebt.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("liabilities")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      console.error("SAVE ERROR:", result.error);
      alert(result.error.message);
      return;
    }

    await loadLiabilities();
    resetModal();
  };

  /* ================= MARK PAID ================= */
  const markPaid = async (id) => {
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("liabilities")
      .update({
        status: "Paid",
        paid_date: today,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    await loadLiabilities();
  };

  /* ================= DELETE ================= */
  const deleteLiability = async (id) => {
    const ok = window.confirm("Delete this liability?");
    if (!ok) return;

    const { error } = await supabase
      .from("liabilities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    await loadLiabilities();
  };

  /* ================= GROUP BY PERSON ================= */
  const grouped = liabilities.reduce((acc, item) => {
    acc[item.debtor_name] = acc[item.debtor_name] || [];
    acc[item.debtor_name].push(item);
    return acc;
  }, {});

  const resetModal = () => {
    setShowModal(false);
    setActivePerson(null);
    setEditingDebt(null);
    setForm({
      debtorName: "",
      amount: "",
      description: "",
      dueDate: "",
    });
  };

  /* ================= UI ================= */
  return (
    <div className="liabilities-page">
      <Header />

      <div className="liabilities-header">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search person who owed..."
            className="liabilities-search"
          />
        </div>

        <button
          className="add-liability-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Liability
        </button>
      </div>

      {loading ? (
        <p className="liabilities-empty">Loading...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="liabilities-empty">No liabilities recorded.</p>
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

                <div className="debt-list scrollable">
                  {list.map((l) => (
                    <div className="debt-card" key={l.id}>
                      <div>
                        <strong>{l.description || "Debt"}</strong>
                        <p>₱{l.amount}</p>
                        <small>Due: {l.due_date || "—"}</small>

                        {l.status === "Paid" && (
                          <small className="paid-date">
                            Paid: {l.paid_date}
                          </small>
                        )}

                        <span
                          className={`status ${l.status.toLowerCase()}`}
                        >
                          {l.status}
                        </span>
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
                              dueDate: l.due_date || "",
                            });
                            setShowModal(true);
                          }}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete"
                          onClick={() => deleteLiability(l.id)}
                        >
                          <Trash2 size={16} />
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
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
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

      <footer className="app-footer">
        © 2025 Tindahan ni Lola. Developed by Aizel Joy Lopez
      </footer>
    </div>
  );
}
