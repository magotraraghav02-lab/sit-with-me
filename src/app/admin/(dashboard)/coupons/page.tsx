"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Coupon } from "@/lib/types";

const emptyForm = { id: "", code: "", discount_inr: "0" };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function loadCoupons() {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(c: Coupon) {
    setForm({ id: c.id, code: c.code, discount_inr: String(c.discount_inr) });
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_inr: Number(form.discount_inr) || 0,
    };

    if (form.id) {
      await supabase.from("coupons").update(payload).eq("id", form.id);
    } else {
      await supabase.from("coupons").insert({ ...payload, active: true });
    }

    setSaving(false);
    resetForm();
    loadCoupons();
  }

  async function toggleActive(c: Coupon) {
    await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    loadCoupons();
  }

  async function handleDelete(id: string) {
    await supabase.from("coupons").delete().eq("id", id);
    loadCoupons();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-ink">Coupons</h2>
        <p className="mb-4 text-sm text-muted">
          Codes customers can apply at checkout for a flat ₹ discount. Codes are never exposed
          publicly — customers must know and type the exact code.
        </p>
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : coupons.length === 0 ? (
          <p className="text-muted">No coupons yet.</p>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="card flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium text-ink">{c.code}</p>
                  <p className="text-sm text-muted">-₹{c.discount_inr} off</p>
                </div>
                <button
                  onClick={() => toggleActive(c)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    c.active ? "bg-forest/10 text-forest" : "bg-black/5 text-muted"
                  }`}
                >
                  {c.active ? "Active" : "Disabled"}
                </button>
                <button onClick={() => startEdit(c)} className="text-sm text-forest hover:underline">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
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
        <h2 className="mb-4 text-xl font-semibold text-ink">{form.id ? "Edit coupon" : "Add coupon"}</h2>
        <div className="card space-y-4 p-6">
          <div>
            <label className="label">Code</label>
            <input
              className="input uppercase"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="WELCOME100"
            />
          </div>
          <div>
            <label className="label">Discount (₹)</label>
            <input
              type="number"
              className="input"
              value={form.discount_inr}
              onChange={(e) => setForm((f) => ({ ...f, discount_inr: e.target.value }))}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : form.id ? "Update coupon" : "Add coupon"}
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
