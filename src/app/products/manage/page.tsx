"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  benefits: string;
  skinTypes: string;
  concerns: string;
  active: boolean;
};

const emptyForm = {
  slug: "",
  name: "",
  description: "",
  benefits: "",
  skinTypes: "",
  concerns: "",
  active: true,
};

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/products?all=1");
    const data = await res.json();
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p: Product) {
    setEditId(p.id);
    setForm({
      slug: p.slug,
      name: p.name,
      description: p.description,
      benefits: p.benefits,
      skinTypes: p.skinTypes,
      concerns: p.concerns,
      active: p.active,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (editId) {
      const res = await fetch(`/api/products/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          benefits: form.benefits,
          skinTypes: form.skinTypes,
          concerns: form.concerns,
          active: form.active,
        }),
      });
      if (!res.ok) setError("Update failed");
      else {
        setEditId(null);
        setForm(emptyForm);
        load();
      }
    } else {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) setError("Create failed — slug may already exist");
      else {
        setForm(emptyForm);
        load();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Product management</h1>
      <p className="text-[var(--muted)]">Create, read, update, and delete Glow Diaries products.</p>

      <form onSubmit={handleSubmit} className="card grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="font-semibold">{editId ? "Edit product" : "Add product"}</h2>
        </div>
        {!editId && (
          <div>
            <label className="label">Slug (unique id)</label>
            <input
              className="input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
        )}
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Benefits</label>
          <input
            className="input"
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Skin types (comma-separated)</label>
          <input
            className="input"
            value={form.skinTypes}
            onChange={(e) => setForm({ ...form, skinTypes: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">Concerns (comma-separated)</label>
          <input
            className="input"
            value={form.concerns}
            onChange={(e) => setForm({ ...form, concerns: e.target.value })}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" className="btn-primary">
            {editId ? "Update" : "Create"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-3">
        {products.map((p) => (
          <li key={p.id} className="card flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-[var(--muted)]">{p.slug}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-sm" onClick={() => startEdit(p)}>
                Edit
              </button>
              <button
                type="button"
                className="text-sm text-red-600 hover:underline"
                onClick={() => handleDelete(p.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
