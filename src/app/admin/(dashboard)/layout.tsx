import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (!adminRow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-5 text-center">
        <div className="card max-w-sm p-8">
          <p className="mb-4 text-ink">
            Your account ({user.email}) is signed in but isn&apos;t authorized as an admin.
          </p>
          <SignOutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-black/5 bg-cream">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-ink">SIT WITH ME — Admin</span>
            <nav className="flex gap-4 text-sm text-muted">
              <Link href="/admin" className="hover:text-ink">
                Bookings
              </Link>
              <Link href="/admin/companions" className="hover:text-ink">
                Companions
              </Link>
              <Link href="/admin/pricing" className="hover:text-ink">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted sm:inline">
              Admin WhatsApp: +91 {(process.env.ADMIN_WHATSAPP_NUMBER ?? "").slice(2)}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
