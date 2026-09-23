"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Companion } from "@/lib/types";

const emptyForm = {
  id: "",
  first_name: "",
  age: "",
  languages: "",
  intro: "",
  favorites: "",
  photo_url: "",
  sort_order: "0",
};

export default function AdminCompanionsPage() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function loadCompanions() {
    const { data } = await supabase.from("companions").select("*").order("sort_order");
    setCompanions((data as Companion[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCompanions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(c: Companion) {
    setForm({
      id: c.id,
      first_name: c.first_name,
      age: String(c.age),
      languages: c.languages.join(", "),
      intro: c.intro,
      favorites: c.favorites,
      photo_url: c.photo_url ?? "",
      sort_order: String(c.sort_order),
    });
  }

  function resetForm() {
    setForm(emptyForm);
  }

  async function handlePhotoUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("companion-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (!error) {
      const { data } = supabase.storage.from("companion-photos").getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: data.publicUrl }));
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      first_name: form.first_name.trim(),
      age: Number(form.age) || 0,
      languages: form.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      intro: form.intro.trim(),
      favorites: form.favorites.trim(),
      photo_url: form.photo_url || null,
      sort_order: Number(form.sort_order) || 0,
    };

    if (form.id) {
      await supabase.from("companions").update(payload).eq("id", form.id);
    } else {
      await supabase.from("companions").insert({ ...payload, visible: true });
    }

    setSaving(false);
    resetForm();
    loadCompanions();
  }

  async function toggleVisible(c: Companion) {
    await supabase.from("companions").update({ visible: !c.visible }).eq("id", c.id);
    loadCompanions();
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-4 text-xl font-semibold text-ink">Companions</h2>
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <div className="space-y-3">
            {companions.map((c) => (
              <div key={c.id} className="card flex items-center gap-4 p-4">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-sand">
                  {c.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo_url} alt={c.first_name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink">
                    {c.first_name}, {c.age}
                  </p>
                  <p className="text-sm text-muted">{c.languages.join(", ")}</p>
                </div>
                <button
                  onClick={() => toggleVisible(c)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    c.visible ? "bg-forest/10 text-forest" : "bg-black/5 text-muted"
                  }`}
                >
                  {c.visible ? "Visible" : "Hidden"}
                </button>
                <button onClick={() => startEdit(c)} className="text-sm text-forest hover:underline">
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-ink">
          {form.id ? "Edit companion" : "Add companion"}
        </h2>
        <div className="card space-y-4 p-6">
          <div>
            <label className="label">First name</label>
            <input
              className="input"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Age</label>
            <input
              type="number"
              className="input"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Languages (comma-separated)</label>
            <input
              className="input"
              value={form.languages}
              onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
              placeholder="English, Hindi, Kannada"
            />
          </div>
          <div>
            <label className="label">2-line intro</label>
            <textarea
              className="input min-h-[70px]"
              value={form.intro}
              onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Favorite things to do</label>
            <input
              className="input"
              value={form.favorites}
              onChange={(e) => setForm((f) => ({ ...f, favorites: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
            />
            {uploading && <p className="mt-1 text-sm text-muted">Uploading...</p>}
            {form.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photo_url} alt="Preview" className="mt-2 h-20 w-20 rounded-lg object-cover" />
            )}
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
              {saving ? "Saving..." : form.id ? "Update companion" : "Add companion"}
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
