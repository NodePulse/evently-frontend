"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle,
  Loader2,
  Users,
  MessageSquare,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// API Functions
import {
  checkEventRegistrationFn,
  eventRegistrationFn,
  getEventFn,
} from "@/constants/api";
import { EventChat } from "@/components/EventChat";
import { AttendeesList } from "@/components/AttendeesList";
import { useEffect, useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { cn } from "@/lib/utils";
import { PaymentDetailsModal } from "@/components/PaymentDetailsModal";
import EventDetails from "@/components/EventDetails";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Type Definition ---
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  price: number;
  currency: string;
  endDate: string;
  location: string;
  imageUrl: string;
  body: string;
  category?: string; // Optional category field
  organizer?: {
    name: string;
  };
}

// --- Main Component ---
const EventDetailsPage = () => {
  const params = useParams();
  const eventId = params.id as string;
  const queryClient = useQueryClient();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "details"
  );

  // --- Data Fetching ---
  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery<Event>({
    queryKey: ["event", eventId],
    queryFn: () => getEventFn(eventId),
    enabled: !!eventId,
  });

  const { data: registrationStatus } = useQuery({
    queryKey: ["event-registration-check", eventId],
    queryFn: () => checkEventRegistrationFn(eventId),
    enabled: !!eventId,
  });

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationKey: ["event-registration", eventId],
    mutationFn: (payload: any) => eventRegistrationFn(eventId, payload),
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalidate and refetch the registration status to update the UI
      queryClient.invalidateQueries({
        queryKey: ["event-registration-check", eventId],
      });
      setCheckoutModalOpen(false);
      setPaymentModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Registration failed.");
    },
  });

  // This effect redirects registered users to the chat tab on initial load
  // if no specific tab is requested in the URL.
  useEffect(() => {
    const hasTabInUrl = searchParams.has("tab");
    if (registrationStatus?.registered && !hasTabInUrl) {
      setActiveTab("chat");
    }

    if (registrationStatus && !registrationStatus.registered) {
      setBannerModalOpen(true);
    }
    // We only want this to run when the registration status is first loaded.
  }, [registrationStatus?.registered, searchParams]);

  // --- Loading & Error States ---
  if (isLoading) return <EventDetailsSkeleton />;
  if (isError) return <ErrorDisplay message={error.message} />;
  if (!event) return <ErrorDisplay message="Event could not be found." />;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  return (
    <div className="bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start py-2">
          <EventLogistics event={event} />
          {/* Right Column: Title, Registration & Tabs */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div
                className={cn(
                  "flex flex-col sm:flex-row sm:justify-between sm:items-center items-start gap-4"
                )}
              >
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger
                    value="attendees"
                    disabled={!registrationStatus?.registered}
                  >
                    <Users className="mr-2 h-4 w-4" /> Attendees
                  </TabsTrigger>
                  <TabsTrigger
                    value="chat"
                    disabled={!registrationStatus?.registered}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Event Chat
                  </TabsTrigger>
                </TabsList>
                <Button
                  size="lg"
                  disabled={registrationStatus?.registered || isRegistering}
                  onClick={() => setCheckoutModalOpen(true)}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Registering...
                    </>
                  ) : registrationStatus?.registered ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" /> Registered
                    </>
                  ) : (
                    <>
                      <Ticket className="mr-2 h-5 w-5" /> Get Tickets
                    </>
                  )}
                </Button>
              </div>
              <TabsContent
                value="details"
                className="mt-4 prose prose-lg max-w-none text-gray-800"
              >
                <p className="mb-6 text-lg md:text-xl font-medium leading-relaxed text-gray-900">
                  {event.description}
                </p>
                <EventDetails htmlContent={event.body} />
              </TabsContent>
              <TabsContent value="attendees" className="mt-4">
                {/* Attendee list component would go here */}
                <AttendeesList />
              </TabsContent>
              <TabsContent value="chat" className="mt-4">
                <EventChat
                  isOrganizer={registrationStatus?.isOrganizer || false}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {checkoutModalOpen && (
        <CheckoutModal
          open={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          event={event}
          onProceedToPayment={() => {
            setCheckoutModalOpen(false);
            setPaymentModalOpen(true);
          }}
        />
      )}

      {paymentModalOpen && (
        <PaymentDetailsModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          eventTitle={event.title}
          amount={event.price}
          currency={event.currency}
          onConfirmPayment={async (data) => {
            console.log(data);
            const payload = {
              amount: Number(event.price),
              currency: event.currency,
              paymentMethod: data.paymentMethod,
              cardNumber: data.cardNumber,
              upiId: data.upiId,
              bank: data.bank,
            };
            register(payload);
          }}
        />
      )}

      <AlertDialog open={bannerModalOpen} onOpenChange={setBannerModalOpen}>
        <AlertDialogOverlay className="backdrop-blur-sm" />
        <AlertDialogContent className="p-0 overflow-hidden max-w-2xl">
          <AlertDialogTitle className="w-0 p-0"></AlertDialogTitle>
          {/* <AlertDialogDescription className="w-0 p-0"></AlertDialogDescription> */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full bg-black/50 hover:bg-black/75 text-white hover:text-white"
            onClick={() => setBannerModalOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="relative aspect-[16/9] w-full">
            <Image
              id="event-banner"
              priority
              src={event.imageUrl}
              alt="Event Banner"
              fill
              className="object-cover"
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// --- Helper & Skeleton Components ---

const EventLogistics = ({ event }: { event: Event }) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  return (
    <div className="lg:sticky lg:top-2 space-y-2">
      <div className="space-y-2">
        <Badge>{event.category || "General"}</Badge>
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
          {event.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          Hosted by{" "}
          <span className="text-primary font-medium">
            {event.organizer?.name}
          </span>
        </p>
      </div>
      <Card className="overflow-hidden shadow-lg py-0">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      </Card>
      <Card>
        <CardContent className="space-y-2">
          <div>
            <h3 className="font-semibold text-lg">Date & Time</h3>
            <InfoItem
              icon={Calendar}
              text={formatDateRange(startDate, endDate)}
            />
            <InfoItem
              icon={Clock}
              text={`${format(startDate, "p")} - ${format(endDate, "p")}`}
            />
          </div>
          <div className="pt-2">
            <h3 className="font-semibold text-lg">Location</h3>
            <InfoItem icon={MapPin} text={event.location} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InfoItem = ({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
    <span className="font-medium text-muted-foreground">{text}</span>
  </div>
);

const formatDateRange = (start: Date, end: Date) => {
  if (format(start, "yyyyMMdd") === format(end, "yyyyMMdd")) {
    return format(start, "E, LLL dd, yyyy");
  }
  return `${format(start, "LLL dd")} - ${format(end, "LLL dd, yyyy")}`;
};

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="container mx-auto py-20 text-center">
    <h1 className="text-2xl font-bold text-destructive">An Error Occurred</h1>
    <p className="mt-2 text-muted-foreground">{message}</p>
  </div>
);

const EventDetailsSkeleton = () => (
  <div className="container mx-auto max-w-7xl py-12 px-4">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 space-y-6">
        <Skeleton className="aspect-[16/9] w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      <div className="lg:col-span-2">
        <div className="flex justify-between items-start">
          <div className="space-y-3 w-2/3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-1/2" />
          </div>
          <Skeleton className="h-12 w-36" />
        </div>
        <div className="mt-8">
          <Skeleton className="h-10 w-1/2" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default EventDetailsPage;
