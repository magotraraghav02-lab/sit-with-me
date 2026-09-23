export type Companion = {
  id: string;
  first_name: string;
  age: number;
  languages: string[];
  intro: string;
  favorites: string;
  photo_url: string | null;
  visible: boolean;
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

export const ACTIVITIES = ["Café chat", "Walk", "Movie", "Temple visit", "Nandi Hills", "Church", "Other"] as const;

export const BOOKING_STATUSES: BookingStatus[] = [
  "New",
  "Contacted",
  "Paid",
  "Completed",
  "Cancelled",
  "No-show",
];
