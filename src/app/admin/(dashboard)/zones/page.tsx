"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Zone } from "@/lib/types";

const emptyForm = {
  id: "",
  area_name: "",
  in_zone: true,
  travel_fee_inr: "0",
  sort_order: "0",
};

export default function AdminZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function loadZones() {
    const { data } = await supabase.from("zones").select("*").order("sort_order");
    setZones((data as Zone[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadZones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(z: Zone) {
    setForm({
      id: z.id,
      area_name: z.area_name,
      in_zone: z.in_zone,
      travel_fee_inr: String(z.travel_fee_inr),
      sort_order: String(z.sort_order),
    });
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      area_name: form.area_name.trim(),
      in_zone: form.in_zone,
      travel_fee_inr: Number(form.travel_fee_inr) || 0,
      sort_order: Number(form.sort_order) || 0,
    };

    if (form.id) {
      await supabase.from("zones").update(payload).eq("id", form.id);
    } else {
      await supabase.from("zones").insert({ ...payload, visible: true });
    }

    setSaving(false);
    resetForm();
    loadZones();
  }

  async function toggleVisible(z: Zone) {
    await supabase.from("zones").update({ visible: !z.visible }).eq("id", z.id);
    loadZones();
  }

  async function handleDelete(id: string) {
    await supabase.from("zones").delete().eq("id", id);
    loadZones();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-ink">Areas / zones</h2>
        <p className="mb-4 text-sm text-muted">
          Areas customers can pick at checkout. Mark an area &quot;out of zone&quot; to add a
          travel fee.
        </p>
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <div className="space-y-3">
            {zones.map((z) => (
              <div key={z.id} className="card flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium text-ink">{z.area_name}</p>
                  <p className="text-sm text-muted">
                    {z.in_zone ? "In zone (no travel fee)" : `Out of zone — +₹${z.travel_fee_inr}`}
                  </p>
                </div>
                <button
                  onClick={() => toggleVisible(z)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    z.visible ? "bg-forest/10 text-forest" : "bg-black/5 text-muted"
                  }`}
                >
                  {z.visible ? "Visible" : "Hidden"}
                </button>
                <button onClick={() => startEdit(z)} className="text-sm text-forest hover:underline">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(z.id)}
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
        <h2 className="mb-4 text-xl font-semibold text-ink">{form.id ? "Edit area" : "Add area"}</h2>
        <div className="card space-y-4 p-6">
          <div>
            <label className="label">Area name</label>
            <input
              className="input"
              value={form.area_name}
              onChange={(e) => setForm((f) => ({ ...f, area_name: e.target.value }))}
              placeholder="e.g. Indiranagar"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.in_zone}
                onChange={(e) => setForm((f) => ({ ...f, in_zone: e.target.checked }))}
                className="h-4 w-4 rounded border-black/20"
              />
              In zone (no travel fee)
            </label>
          </div>
          {!form.in_zone && (
            <div>
              <label className="label">Travel fee (₹)</label>
              <input
                type="number"
                className="input"
                value={form.travel_fee_inr}
                onChange={(e) => setForm((f) => ({ ...f, travel_fee_inr: e.target.value }))}
              />
            </div>
          )}
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
              {saving ? "Saving..." : form.id ? "Update area" : "Add area"}
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
