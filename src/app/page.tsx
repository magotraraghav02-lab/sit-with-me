import { createClient } from "@/lib/supabase/server";
import type { Companion, PricingPlan, Zone, Review, SiteSettings } from "@/lib/types";
import Header from "@/components/Header";
import FadeInSection from "@/components/FadeInSection";
import RippleLayer from "@/components/RippleLayer";
import Hero from "@/components/Hero";
import Quiz from "@/components/Quiz";
import FounderVideo from "@/components/FounderVideo";
import CompanionsSection from "@/components/CompanionsSection";
import HowItWorks from "@/components/HowItWorks";
import StatsStrip from "@/components/StatsStrip";
import Pricing from "@/components/Pricing";
import DoDont from "@/components/DoDont";
import Safety from "@/components/Safety";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import WhatsAppButton from "@/components/WhatsAppButton";
import StickyBookBar from "@/components/StickyBookBar";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: companions },
    { data: plans },
    { data: zones },
    { data: reviews },
    { data: settings },
    { count: paidCount },
  ] = await Promise.all([
    supabase
      .from("companions")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("pricing")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("zones")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("reviews")
      .select("*")
      .eq("approved", true)
      .order("sort_order", { ascending: true }),
    supabase.from("site_settings").select("*").eq("id", true).maybeSingle(),
    supabase.from("payment_bookings").select("id", { count: "exact", head: true }).eq("status", "Paid"),
  ]);

  const plansList = (plans as PricingPlan[]) ?? [];
  const zonesList = (zones as Zone[]) ?? [];

  return (
    <>
      <RippleLayer />
      <Header />
      <main className="pb-16 sm:pb-0">
        <FadeInSection>
          <Hero />
        </FadeInSection>
        <Quiz plans={plansList} zones={zonesList} />
        <FounderVideo
          videoUrl={(settings as SiteSettings | null)?.founder_video_url ?? null}
          captionsUrl={(settings as SiteSettings | null)?.founder_captions_url ?? null}
        />
        <FadeInSection>
          <CompanionsSection companions={(companions as Companion[]) ?? []} />
        </FadeInSection>
        <FadeInSection>
          <HowItWorks />
        </FadeInSection>
        <StatsStrip totalPaidSessions={paidCount ?? 0} />
        <FadeInSection>
          <Pricing plans={plansList} zones={zonesList} />
        </FadeInSection>
        <FadeInSection>
          <DoDont />
        </FadeInSection>
        <FadeInSection>
          <Safety />
        </FadeInSection>
        <Reviews reviews={(reviews as Review[]) ?? []} />
        <FadeInSection>
          <FAQ />
        </FadeInSection>
        <WhatsAppButton />
        <StickyBookBar plans={plansList} zones={zonesList} />
        <ExitIntentPopup />
        <FadeInSection>
          <Footer />
        </FadeInSection>
      </main>
    </>
  );
}
