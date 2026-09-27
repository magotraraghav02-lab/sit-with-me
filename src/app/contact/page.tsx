import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Contact Us — SIT WITH ME" };

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@sitwithme.in";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919622323171";

export default function ContactPage() {
  return (
    <PolicyPage title="Contact Us" updated="24 September 2026">
      <p>We&apos;re based in Bangalore, India, and happy to help with any questions.</p>

      <h2>Email</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>WhatsApp</h2>
      <p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          +91 {WHATSAPP_NUMBER.slice(2)}
        </a>
      </p>

      <h2>Location</h2>
      <p>Bangalore, Karnataka, India</p>
    </PolicyPage>
  );
}
