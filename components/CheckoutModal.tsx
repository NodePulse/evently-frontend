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
import Image from "next/image";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    imageUrl: string;
    price: number;
    currency: string;
  };
  onProceedToPayment: () => void;
}

export function CheckoutModal({
  open,
  onClose,
  event,
  onProceedToPayment,
}: CheckoutModalProps) {
  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(
      price
    );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl shadow-2xl bg-background">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold">
            Order Summary
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review your event details before proceeding to payment.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-md">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-xl font-semibold">{event.title}</h2>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-lg font-medium text-muted-foreground">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(event.price, event.currency)}
            </span>
          </div>
        </div>

        <DialogFooter className="p-6 flex justify-end gap-3 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onProceedToPayment}>
            {Number(event.price) === 0 ? "Confirm Registration" : "Proceed to Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
