export interface PaymentOrder {
    amount: string;   // Amount in paise (1 INR = 100 paise)
    currency: string; // Currency code, e.g., 'INR'
    receipt: string;  // Custom receipt ID
    productId: string;
    promoCodeId: string;
    discountAmount: string;
    appliedPromoCode: string;
  }

  export interface VerifyPayment {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }