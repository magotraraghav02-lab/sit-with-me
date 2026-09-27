import crypto from "crypto";
import { razorpayProvider } from "./razorpay";
import type { PaymentProvider } from "./types";

// Single swap point: to move to a different Indian payment gateway later,
// implement PaymentProvider in a new file and change this one export.
export const paymentProvider: PaymentProvider = razorpayProvider;

export const PAYMENT_CURRENCY = "INR";

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/** Used as the primary key for the webhook dedupe table -- stable regardless
 * of what shape a given Razorpay event payload happens to have. */
export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export type {
  PaymentProvider,
  CreateOrderParams,
  CreateOrderResult,
  VerifyPaymentParams,
  RefundParams,
  RefundResult,
} from "./types";
