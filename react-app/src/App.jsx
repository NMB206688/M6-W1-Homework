import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form
  const [form, setForm] = useState({ prodname: "", qty: "", price: "", status: "S" });

  // Track which id is being edited and its draft values
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ prodname: "", qty: "", price: "", status: "S" });

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/api/inventories");
      setItems(res.data);
      setError("");
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // CREATE
  async function createItem(e) {
    e.preventDefault();
    try {
      const payload = {
        prodname: form.prodname,
        qty: Number(form.qty),
        price: Number(form.price),
        status: form.status || "S",
      };
      const res = await api.post("/api/inventories", payload);
      setItems((prev) => [res.data, ...prev]);
      setForm({ prodname: "", qty: "", price: "", status: "S" });
    } catch (err) {
      alert("Create failed: " + (err?.response?.data?.error || err.message));
    }
  }

  // DELETE
  async function deleteItem(id) {
    try {
      await api.delete(`/api/inventories/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      if (editingId === id) {
        setEditingId(null);
      }
    } catch (err) {
      alert("Delete failed: " + (err?.response?.data?.error || err.message));
    }
  }

  // ENTER EDIT MODE
  function startEdit(it) {
    setEditingId(it._id);
    setEditDraft({
      prodname: it.prodname ?? it.name ?? "",
      qty: it.qty ?? it.quantity ?? "",
      price: it.price ?? "",
      status: it.status ?? "S",
    });
  }

  // CANCEL EDIT
  function cancelEdit() {
    setEditingId(null);
  }

  // UPDATE
  async function saveEdit(id) {
    try {
      const payload = {
        prodname: editDraft.prodname,
        qty: Number(editDraft.qty),
        price: Number(editDraft.price),
        status: editDraft.status || "S",
      };
      const res = await api.put(`/api/inventories/${id}`, payload);
      setItems((prev) => prev.map((i) => (i._id === id ? res.data : i)));
      setEditingId(null);
    } catch (err) {
      alert("Update failed: " + (err?.response?.data?.error || err.message));
    }
  }

  if (loading) return <p style={{ padding: 16 }}>Loading…</p>;
  if (error) return <p style={{ padding: 16, color: "crimson" }}>Error: {error}</p>;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "24px auto" }}>
      <h1>Inventories</h1>
      <p style={{ opacity: 0.7, marginTop: -10 }}>API: {import.meta.env.VITE_API_URL}</p>

      {/* Create form */}
      <form
        onSubmit={createItem}
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
          gap: 8,
          alignItems: "end",
          margin: "16px 0",
          border: "1px solid #ddd",
          padding: 12,
          borderRadius: 12,
        }}
      >
        <div>
          <label>Name</label>
          <br />
          <input
            required
            value={form.prodname}
            onChange={(e) => setForm({ ...form, prodname: e.target.value })}
          />
        </div>
        <div>
          <label>Qty</label>
          <br />
          <input
            required
            type="number"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
          />
        </div>
        <div>
          <label>Price</label>
          <br />
          <input
            required
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div>
          <label>Status</label>
          <br />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="S">S</option>
            <option value="R">R</option>
            <option value="T">T</option>
          </select>
        </div>
        <button type="submit" style={{ padding: "8px 14px" }}>
          Add
        </button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((it) => {
          const isEditing = editingId === it._id;
          const name = it.prodname ?? it.name ?? "(no name)";
          const qty = it.qty ?? it.quantity ?? "-";
          const price = it.price ?? "-";
          const status = it.status ?? "-";

          return (
            <li
              key={it._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 12,
                marginBottom: 10,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 8,
              }}
            >
              {!isEditing ? (
                <>
                  <div>
                    <div>
                      <strong>{name}</strong>
                    </div>
                    <div>qty: {qty}</div>
                    <div>price: {price}</div>
                    <div>status: {status}</div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>id: {it._id}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(it)} style={{ padding: "6px 10px" }}>
                      Edit
                    </button>
                    <button onClick={() => deleteItem(it._id)} style={{ padding: "6px 10px" }}>
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "grid", gap: 6, gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
                    <input
                      value={editDraft.prodname}
                      onChange={(e) => setEditDraft({ ...editDraft, prodname: e.target.value })}
                    />
                    <input
                      type="number"
                      value={editDraft.qty}
                      onChange={(e) => setEditDraft({ ...editDraft, qty: e.target.value })}
                    />
                    <input
                      type="number"
                      value={editDraft.price}
                      onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })}
                    />
                    <select
                      value={editDraft.status}
                      onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })}
                    >
                      <option value="S">S</option>
                      <option value="R">R</option>
                      <option value="T">T</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => saveEdit(it._id)} style={{ padding: "6px 10px" }}>
                      Save
                    </button>
                    <button onClick={cancelEdit} style={{ padding: "6px 10px" }}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
