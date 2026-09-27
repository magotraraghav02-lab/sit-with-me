export type Companion = {
  id: string;
  first_name: string;
  age: number;
  languages: string[];
  intro: string;
  favorites: string;
  photo_url: string | null;
  visible: boolean;
  available_today: boolean;
  services_offered: string | null;
  sort_order: number;
  created_at: string;
};

export type PricingPlan = {
  id: string;
  title: string;
  duration: string;
  price_inr: number;
  description: string | null;
  visible: boolean;
  sort_order: number;
  calendly_link: string | null;
  created_at: string;
};

export type BookingStatus =
  | "New"
  | "Contacted"
  | "Paid"
  | "Completed"
  | "Cancelled"
  | "No-show";

export type Booking = {
  id: string;
  full_name: string;
  whatsapp: string;
  companion_id: string | null;
  companion_name_snapshot: string | null;
  activity: string;
  preferred_date: string;
  preferred_time: string;
  area: string;
  notes: string | null;
  status: BookingStatus;
  internal_notes: string | null;
  amount_paid: number | null;
  would_rebook: string | null;
  created_at: string;
};

export const ACTIVITIES = ["Café chat", "Walk", "Movie", "Temple visit", "Church", "Other"] as const;

export const BOOKING_STATUSES: BookingStatus[] = [
  "New",
  "Contacted",
  "Paid",
  "Completed",
  "Cancelled",
  "No-show",
];

// ---- Phase 2: Razorpay pay-first booking flow ----

export type Zone = {
  id: string;
  area_name: string;
  in_zone: boolean;
  travel_fee_inr: number;
  visible: boolean;
  sort_order: number;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  discount_inr: number;
  active: boolean;
  created_at: string;
};

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded" | "Abandoned";

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
  "Abandoned",
];

export type PaymentBooking = {
  id: string;
  full_name: string;
  whatsapp: string;
  email: string | null;
  pricing_id: string | null;
  pricing_title_snapshot: string;
  base_amount_inr: number;
  area: string;
  travel_fee_inr: number;
  coupon_code: string | null;
  coupon_discount_inr: number;
  total_amount_inr: number;
  currency: string;
  notes: string | null;
  is_adult: boolean;
  agreed_policy: boolean;
  status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  razorpay_refund_id: string | null;
  refund_amount_inr: number | null;
  razorpay_payment_link_id: string | null;
  created_at: string;
  updated_at: string;
};
