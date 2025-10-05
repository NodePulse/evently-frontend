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
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface CheckoutModalProps {
    open: boolean;
    onClose: () => void;
    event: {
        id: string;
        title: string;
        imageUrl: string;
        price: number;
        currency: string;
        startDate: string;
        endDate: string;
    };
    onConfirm: () => Promise<void>;
}

export function CheckoutModal({ open, onClose, event, onConfirm }: CheckoutModalProps) {
    const [isPaying, setIsPaying] = useState(false);

    const handlePayment = async () => {
        setIsPaying(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error(error);
        } finally {
            onClose();
            setIsPaying(false);
        }
    };

    const formatPrice = (priceInCents: number, currencyCode: string) => {
        // const priceInMainUnit = priceInCents / 100;
        return new Intl.NumberFormat('en-IN', { // Use appropriate locale
            style: 'currency',
            currency: currencyCode,
        }).format(priceInCents);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl shadow-2xl bg-background">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-2xl font-bold text-primary">
                        Confirm Checkout
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Review your event details and complete the payment securely.
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
                    <div>
                        <h2 className="text-xl font-semibold">{event.title}</h2>
                        <p className="text-muted-foreground">
                            {format(new Date(event.startDate), "PPP")} -{" "}
                            {format(new Date(event.endDate), "PPP")}
                        </p>
                    </div>
                    <div className="flex justify-between items-center border-t pt-4">
                        <p className="text-lg font-medium text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                            {formatPrice(event.price, event.currency)}
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 flex justify-end gap-3 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handlePayment} disabled={isPaying}>
                        {isPaying ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            "Confirm & Pay"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
