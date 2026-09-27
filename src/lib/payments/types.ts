// Provider-agnostic payment gateway interface.
// Swap Razorpay for another Indian gateway later by writing a new
// implementation of this interface and changing the export in `index.ts`
// -- nothing else in the app should import a gateway SDK directly.

export type CreateOrderParams = {
  /** Amount in the smallest currency unit (paise for INR). Always computed server-side. */
  amountInPaise: number;
  currency: string;
  /** Our own booking id, used as the Razorpay order "receipt". */
  receipt: string;
  notes?: Record<string, string>;
};

export type CreateOrderResult = {
  orderId: string;
  amountInPaise: number;
  currency: string;
};

export type VerifyPaymentParams = {
  orderId: string;
  paymentId: string;
  signature: string;
};

export type RefundParams = {
  paymentId: string;
  /** Amount in paise. Omit for a full refund. */
  amountInPaise?: number;
  notes?: Record<string, string>;
};

export type RefundResult = {
  refundId: string;
  amountInPaise: number;
  status: string;
};

export type CreatePaymentLinkParams = {
  amountInPaise: number;
  currency: string;
  /** Our own booking id -- passed back in the payment_link.paid webhook's notes. */
  referenceId: string;
  description: string;
  customer: { name: string; contact: string; email?: string };
  notes?: Record<string, string>;
};

export type CreatePaymentLinkResult = {
  paymentLinkId: string;
  shortUrl: string;
};

export interface PaymentProvider {
  /** Human-readable name shown in admin/logs, e.g. "Razorpay". */
  readonly name: string;

  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;

  /** Verifies the checkout success signature returned to the browser. */
  verifyPaymentSignature(params: VerifyPaymentParams): boolean;

  /** Verifies a webhook request's signature against the raw request body. */
  verifyWebhookSignature(rawBody: string, signature: string): boolean;

  refund(params: RefundParams): Promise<RefundResult>;

  /** Creates a standalone, shareable Razorpay Payment Link (used for the
   * manual WhatsApp bridge flow, separate from the on-site Orders checkout). */
  createPaymentLink(params: CreatePaymentLinkParams): Promise<CreatePaymentLinkResult>;
}
