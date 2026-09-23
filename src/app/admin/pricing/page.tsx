"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PricingPlan } from "@/lib/types";

const emptyForm = { id: "", title: "", duration: "", price_inr: "", description: "", sort_order: "0" };

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function loadPlans() {
    const { data } = await supabase.from("pricing").select("*").order("sort_order");
    setPlans((data as PricingPlan[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(p: PricingPlan) {
    setForm({
      id: p.id,
      title: p.title,
      duration: p.duration,
      price_inr: String(p.price_inr),
      description: p.description ?? "",
      sort_order: String(p.sort_order),
    });
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      duration: form.duration.trim(),
      price_inr: Number(form.price_inr) || 0,
      description: form.description.trim() || null,
      sort_order: Number(form.sort_order) || 0,
    };

    if (form.id) {
      await supabase.from("pricing").update(payload).eq("id", form.id);
    } else {
      await supabase.from("pricing").insert({ ...payload, visible: true });
    }

    setSaving(false);
    resetForm();
    loadPlans();
  }

  async function toggleVisible(p: PricingPlan) {
    await supabase.from("pricing").update({ visible: !p.visible }).eq("id", p.id);
    loadPlans();
  }

  async function handleDelete(id: string) {
    await supabase.from("pricing").delete().eq("id", id);
    loadPlans();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-ink">Pricing plans</h2>
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <div className="space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="card flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium text-ink">
                    {p.title} — ₹{p.price_inr.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-muted">{p.duration}</p>
                </div>
                <button
                  onClick={() => toggleVisible(p)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p.visible ? "bg-forest/10 text-forest" : "bg-black/5 text-muted"
                  }`}
                >
                  {p.visible ? "Visible" : "Hidden"}
                </button>
                <button onClick={() => startEdit(p)} className="text-sm text-forest hover:underline">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-ink">{form.id ? "Edit plan" : "Add plan"}</h2>
        <div className="card space-y-4 p-6">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Café chat"
            />
          </div>
          <div>
            <label className="label">Duration</label>
            <input
              className="input"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              placeholder="1 hour"
            />
          </div>
          <div>
            <label className="label">Price (₹)</label>
            <input
              type="number"
              className="input"
              value={form.price_inr}
              onChange={(e) => setForm((f) => ({ ...f, price_inr: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input min-h-[60px]"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Sort order</label>
            <input
              type="number"
              className="input"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : form.id ? "Update plan" : "Add plan"}
            </button>
            {form.id && (
              <button onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
