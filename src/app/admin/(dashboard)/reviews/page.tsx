"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/lib/types";

const emptyForm = {
  id: "",
  customer_first_name: "",
  service_title: "",
  rating: "5",
  review_text: "",
  sort_order: "0",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setForm(emptyForm);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      customer_first_name: form.customer_first_name.trim(),
      service_title: form.service_title.trim(),
      rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
      review_text: form.review_text.trim(),
      sort_order: Number(form.sort_order) || 0,
    };
    if (form.id) {
      await supabase.from("reviews").update(payload).eq("id", form.id);
    } else {
      await supabase.from("reviews").insert({ ...payload, approved: false });
    }
    setSaving(false);
    resetForm();
    load();
  }

  async function toggleApproved(r: Review) {
    await supabase.from("reviews").update({ approved: !r.approved }).eq("id", r.id);
    load();
  }

  async function remove(id: string) {
    await supabase.from("reviews").delete().eq("id", id);
    load();
  }

  const approvedCount = reviews.filter((r) => r.approved).length;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-ink">Reviews</h2>
        <p className="mb-4 text-sm text-muted">
          {approvedCount < 3
            ? `${approvedCount}/3 approved — the public reviews section stays hidden until at least 3 are approved.`
            : `${approvedCount} approved — the public reviews section is live.`}
        </p>
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-ink">
                    {r.customer_first_name} — {r.service_title}
                  </p>
                  <span className="text-amber">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <p className="mb-2 text-sm text-muted">{r.review_text}</p>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => toggleApproved(r)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      r.approved ? "bg-forest/10 text-forest" : "bg-black/5 text-muted"
                    }`}
                  >
                    {r.approved ? "Approved" : "Pending"}
                  </button>
                  <button onClick={() => setForm({
                    id: r.id,
                    customer_first_name: r.customer_first_name,
                    service_title: r.service_title,
                    rating: String(r.rating),
                    review_text: r.review_text,
                    sort_order: String(r.sort_order),
                  })} className="text-forest hover:underline">
                    Edit
                  </button>
                  <button onClick={() => remove(r.id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-ink">{form.id ? "Edit review" : "Add review"}</h2>
        <div className="card space-y-4 p-6">
          <div>
            <label className="label">Customer first name</label>
            <input
              className="input"
              value={form.customer_first_name}
              onChange={(e) => setForm((f) => ({ ...f, customer_first_name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Service</label>
            <input
              className="input"
              value={form.service_title}
              onChange={(e) => setForm((f) => ({ ...f, service_title: e.target.value }))}
              placeholder="Café chat"
            />
          </div>
          <div>
            <label className="label">Rating (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              className="input"
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Review text</label>
            <textarea
              className="input min-h-[80px]"
              value={form.review_text}
              onChange={(e) => setForm((f) => ({ ...f, review_text: e.target.value }))}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : form.id ? "Update review" : "Add review"}
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
