import crypto from "crypto";
import Razorpay from "razorpay";
import type {
  PaymentProvider,
  CreateOrderParams,
  CreateOrderResult,
  VerifyPaymentParams,
  RefundParams,
  RefundResult,
} from "./types";

function getClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
    );
  }
  return new Razorpay({ key_id, key_secret });
}

class RazorpayProvider implements PaymentProvider {
  readonly name = "Razorpay";

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const client = getClient();
    const order = await client.orders.create({
      amount: params.amountInPaise,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    });
    return {
      orderId: order.id,
      amountInPaise:
        typeof order.amount === "string" ? parseInt(order.amount, 10) : order.amount,
      currency: order.currency,
    };
  }

  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return false;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest("hex");
    return timingSafeEqualHex(expected, params.signature);
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return false;
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return timingSafeEqualHex(expected, signature);
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const client = getClient();
    const refund = await client.payments.refund(params.paymentId, {
      amount: params.amountInPaise,
      notes: params.notes,
    });
    const refundedAmount =
      typeof refund.amount === "string"
        ? parseInt(refund.amount, 10)
        : refund.amount ?? params.amountInPaise ?? 0;
    return {
      refundId: refund.id,
      amountInPaise: refundedAmount,
      status: refund.status ?? "processed",
    };
  }
}

function timingSafeEqualHex(expectedHex: string, actualHex: string): boolean {
  const a = Buffer.from(expectedHex, "hex");
  const b = Buffer.from(actualHex, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

export const razorpayProvider = new RazorpayProvider();
