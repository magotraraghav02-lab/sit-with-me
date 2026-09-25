import { createClient } from "@/lib/supabase/server";
import type { Companion, PricingPlan } from "@/lib/types";
import Header from "@/components/Header";
import FadeInSection from "@/components/FadeInSection";
import RippleLayer from "@/components/RippleLayer";
import Hero from "@/components/Hero";
import CompanionsSection from "@/components/CompanionsSection";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import DoDont from "@/components/DoDont";
import Safety from "@/components/Safety";
import BookingForm from "@/components/BookingForm";
import FAQ from "@/components/FAQ";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: companions }, { data: plans }] = await Promise.all([
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
  ]);

  return (
    <>
      <RippleLayer />
      <Header />
      <main>
        <FadeInSection>
          <Hero />
        </FadeInSection>
        <FadeInSection>
          <CompanionsSection companions={(companions as Companion[]) ?? []} />
        </FadeInSection>
        <FadeInSection>
          <HowItWorks />
        </FadeInSection>
        <FadeInSection>
          <Pricing plans={(plans as PricingPlan[]) ?? []} />
        </FadeInSection>
        <FadeInSection>
          <DoDont />
        </FadeInSection>
        <FadeInSection>
          <Safety />
        </FadeInSection>
        <FadeInSection>
          <BookingForm companions={(companions as Companion[]) ?? []} />
        </FadeInSection>
        <FadeInSection>
          <FAQ />
        </FadeInSection>
        <WhatsAppButton />
        <FadeInSection>
          <Footer />
        </FadeInSection>
      </main>
    </>
  );
}
