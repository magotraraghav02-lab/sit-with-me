"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/types";

export default function AdminContentPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingCaptions, setUploadingCaptions] = useState(false);

  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle();
    setSettings((data as SiteSettings) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVideoUpload(file: File) {
    setUploadingVideo(true);
    const ext = file.name.split(".").pop();
    const path = `founder-video-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (!error) {
      const { data } = supabase.storage.from("site-media").getPublicUrl(path);
      await supabase
        .from("site_settings")
        .update({ founder_video_url: data.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", true);
      load();
    }
    setUploadingVideo(false);
  }

  async function handleCaptionsUpload(file: File) {
    setUploadingCaptions(true);
    const path = `founder-captions-${Date.now()}.vtt`;
    const { error } = await supabase.storage.from("site-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "text/vtt",
    });
    if (!error) {
      const { data } = supabase.storage.from("site-media").getPublicUrl(path);
      await supabase
        .from("site_settings")
        .update({ founder_captions_url: data.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", true);
      load();
    }
    setUploadingCaptions(false);
  }

  async function clearVideo() {
    await supabase
      .from("site_settings")
      .update({ founder_video_url: null, founder_captions_url: null })
      .eq("id", true);
    load();
  }

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h2 className="mb-4 text-xl font-semibold text-ink">Founder intro video</h2>
      <div className="card space-y-4 p-6">
        <p className="text-sm text-muted">
          A short (~15s), vertical, muted-autoplay clip shown near the top of the homepage. Add
          captions (a .vtt file) so it works with sound off — most visitors browse muted.
        </p>

        {settings?.founder_video_url && (
          <div className="w-full max-w-[200px]">
            <video
              src={settings.founder_video_url}
              className="aspect-[9/16] w-full rounded-lg bg-black object-cover"
              controls
              muted
            />
          </div>
        )}

        <div>
          <label className="label">Video file (mp4, vertical)</label>
          <input
            type="file"
            accept="video/mp4,video/quicktime"
            onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
          />
          {uploadingVideo && <p className="mt-1 text-sm text-muted">Uploading...</p>}
        </div>

        <div>
          <label className="label">Captions file (.vtt, optional)</label>
          <input
            type="file"
            accept=".vtt"
            onChange={(e) => e.target.files?.[0] && handleCaptionsUpload(e.target.files[0])}
          />
          {uploadingCaptions && <p className="mt-1 text-sm text-muted">Uploading...</p>}
        </div>

        {settings?.founder_video_url && (
          <button onClick={clearVideo} className="text-sm text-red-500 hover:underline">
            Remove video
          </button>
        )}
      </div>
    </div>
  );
}
