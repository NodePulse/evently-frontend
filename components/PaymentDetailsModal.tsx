"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Landmark,
  Loader2,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  eventTitle: string;
  amount: number;
  currency: string;
  onConfirmPayment: (data: {
    paymentMethod: string;
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    upiId?: string;
    bank?: string;
  }) => Promise<void>;
}

export function PaymentDetailsModal({
  open,
  onClose,
  eventTitle,
  amount,
  currency,
  onConfirmPayment,
}: PaymentDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "upi" | "netbanking"
  >("card");

  const isFreeEvent = Number(amount) === 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFreeEvent) {
      // For free events, just confirm payment immediately
      await onConfirmPayment({ paymentMethod: "free" });
      return;
    }

    setIsProcessing(true);
    const formData = new FormData(e.currentTarget);
    const paymentData: {
      paymentMethod: string;
      cardNumber?: string;
      upiId?: string;
      bank?: string;
      expiry?: string;
      cvc?: string;
    } = { paymentMethod };

    if (paymentMethod === "card") {
      paymentData.cardNumber = formData.get("card-number") as string;
      paymentData.expiry = formData.get("expiry") as string;
      paymentData.cvc = formData.get("cvc") as string;
    } else if (paymentMethod === "upi") {
      paymentData.upiId = formData.get("upi-id") as string;
    } else if (paymentMethod === "netbanking") {
      paymentData.bank = formData.get("bank") as string;
    }

    try {
      await onConfirmPayment(paymentData);
    } catch (error) {
      console.error("Payment confirmation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number, currencyCode: string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
    }).format(price);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 p-6 pb-0">
            <Wallet className="h-6 w-6 text-primary" />
            Complete Your Payment
          </DialogTitle>
          <DialogDescription className="px-6">
            You are purchasing a ticket for <strong>{eventTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <div className="flex justify-between items-center bg-gradient-to-tr from-primary/10 to-primary/5 p-4 rounded-lg">
            <span className="text-muted-foreground font-medium">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(amount, currency)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <Tabs
            value={paymentMethod}
            onValueChange={(value) =>
              setPaymentMethod(value as "card" | "upi" | "netbanking")
            }
            className="w-full"
            disabled={isFreeEvent} // Disable tabs for free events
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="card" className="gap-2">
                <CreditCard className="h-4 w-4" /> Card
              </TabsTrigger>
              <TabsTrigger value="upi" className="gap-2">
                <Smartphone className="h-4 w-4" /> UPI
              </TabsTrigger>
              <TabsTrigger value="netbanking" className="gap-2">
                <Landmark className="h-4 w-4" /> Net Banking
              </TabsTrigger>
            </TabsList>

            <div className="py-4">
              <TabsContent value="card">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="0000 0000 0000 1234"
                      name="card-number"
                      required={paymentMethod === "card" && !isFreeEvent}
                      disabled={isFreeEvent}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        name="expiry"
                        required={!isFreeEvent}
                        disabled={isFreeEvent}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        name="cvc"
                        required={!isFreeEvent}
                        disabled={isFreeEvent}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="upi">
                <div className="space-y-2">
                  <Label htmlFor="upi-id">UPI ID</Label>
                  <Input
                    id="upi-id"
                    placeholder="yourname@bank"
                    name="upi-id"
                    required={!isFreeEvent}
                    disabled={isFreeEvent}
                  />
                </div>
              </TabsContent>

              <TabsContent value="netbanking">
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank</Label>
                  <Select
                    name="bank"
                    required={!isFreeEvent}
                    disabled={isFreeEvent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sbi">State Bank of India</SelectItem>
                      <SelectItem value="hdfc">HDFC Bank</SelectItem>
                      <SelectItem value="icici">ICICI Bank</SelectItem>
                      <SelectItem value="axis">Axis Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full shadow-lg hover:shadow-xl transition-shadow"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Processing...
                  </>
                ) : isFreeEvent ? (
                  "Confirm Registration"
                ) : (
                  `Pay ${formatPrice(amount, currency)}`
                )}
              </Button>
            </DialogFooter>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}
