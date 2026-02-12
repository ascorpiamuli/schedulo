import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Smartphone, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PaymentMethod = "stripe" | "mpesa" | null;

interface PaymentStepProps {
  eventTitle: string;
  eventColor: string;
  amountCents: number;
  currency: string;
  dateLabel: string;
  timeLabel: string;
  duration: number;
  onSuccess: (method: string, transactionId: string) => void;
  onBack: () => void;
}

// ── Placeholder payment processors ──────────────────────────
// Replace these with real Stripe / IntaSend calls later.

async function processStripePayment(_amountCents: number, _currency: string): Promise<string> {
  // TODO: call your Stripe edge-function / checkout session here
  await new Promise((r) => setTimeout(r, 2000)); // simulate network
  return `stripe_placeholder_${Date.now()}`;
}

async function processMpesaPayment(_amountCents: number, _currency: string, _phone: string): Promise<string> {
  // TODO: call your IntaSend edge-function / STK push here
  await new Promise((r) => setTimeout(r, 2000)); // simulate network
  return `mpesa_placeholder_${Date.now()}`;
}

// ─────────────────────────────────────────────────────────────

export default function PaymentStep({
  eventTitle,
  eventColor,
  amountCents,
  currency,
  dateLabel,
  timeLabel,
  duration,
  onSuccess,
  onBack,
}: PaymentStepProps) {
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>();

  const amount = (amountCents / 100).toFixed(2);

  const handlePay = async () => {
    if (!method) return;
    setProcessing(true);
    setError(undefined);

    try {
      let txId: string;
      if (method === "stripe") {
        txId = await processStripePayment(amountCents, currency);
      } else {
        if (!phone) {
          setError("Please enter your M-Pesa phone number.");
          setProcessing(false);
          return;
        }
        txId = await processMpesaPayment(amountCents, currency, phone);
      }
      onSuccess(method, txId);
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-lg mx-auto"
    >
      <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={onBack} disabled={processing}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Booking summary */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: eventColor }} />
              <h3 className="font-semibold font-['Space_Grotesk']">{eventTitle}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {dateLabel} · {timeLabel} · {duration} min
            </p>
          </div>

          {/* Amount */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Amount due</p>
            <p className="text-2xl font-bold font-['Space_Grotesk']">
              {currency === "KES" ? "KSh" : "$"}{amount}
            </p>
          </div>

          {/* Method selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Choose payment method</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setMethod("stripe"); setError(undefined); }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                  method === "stripe"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <CreditCard className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Card / Stripe</span>
              </button>

              <button
                type="button"
                onClick={() => { setMethod("mpesa"); setError(undefined); }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                  method === "mpesa"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <Smartphone className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">M-Pesa</span>
              </button>
            </div>
          </div>

          {/* M-Pesa phone input */}
          {method === "mpesa" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <label className="text-sm font-medium" htmlFor="mpesa-phone">M-Pesa phone number</label>
              <input
                id="mpesa-phone"
                type="tel"
                placeholder="e.g. 0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </motion.div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handlePay}
            className="w-full gap-2"
            size="lg"
            disabled={!method || processing}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              `Pay ${currency === "KES" ? "KSh" : "$"}${amount}`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Payments are placeholder — Stripe &amp; IntaSend will be wired up later.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
