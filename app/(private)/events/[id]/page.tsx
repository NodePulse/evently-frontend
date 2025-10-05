'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Ticket, CheckCircle, Loader2, Users, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

// UI Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// API Functions
import { checkEventRegistrationFn, eventRegistrationFn, getEventFn } from '@/constants/api';
import { EventChat } from '@/components/EventChat';
import { AttendeesList } from '@/components/AttendeesList';
import { useState } from 'react';
import { CheckoutModal } from '@/components/CheckoutModal';

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
    category?: string; // Optional category field
}

// --- Main Component ---
const EventDetailsPage = () => {
    const params = useParams();
    const eventId = params.id as string;
    const queryClient = useQueryClient();
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)

    // --- Data Fetching ---
    const { data: event, isLoading, isError, error } = useQuery<Event>({
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
        mutationFn: () => eventRegistrationFn(eventId),
        onSuccess: (data) => {
            toast.success(data.message);
            // Invalidate and refetch the registration status to update the UI
            queryClient.invalidateQueries({ queryKey: ["event-registration-check", eventId] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Registration failed.");
        }
    });

    // --- Loading & Error States ---
    if (isLoading) return <EventDetailsSkeleton />;
    if (isError) return <ErrorDisplay message={error.message} />;
    if (!event) return <ErrorDisplay message="Event could not be found." />;

    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    return (
        <div className="bg-muted/20">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Image & Logistics */}
                    <div className="sapce-y-2">
                        <div className="space-y-2 mt-4">
                            {event.category ? <Badge>{event.category}</Badge> : <Badge>General</Badge>}
                            <h1 className="text-4xl font-extrabold tracking-tight">{event.title}</h1>
                            <p className="text-lg text-muted-foreground">Hosted by <span className="text-primary font-medium">{event?.organizer?.name}</span></p>
                        </div>
                        <div className="lg:col-span-1 lg:sticky lg:top-8 space-y-6">
                            <Card className="overflow-hidden shadow-lg">
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
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg">Date & Time</h3>
                                    <InfoItem icon={Calendar} text={formatDateRange(startDate, endDate)} />
                                    <InfoItem icon={Clock} text={`${format(startDate, 'p')} - ${format(endDate, 'p')}`} />
                                    <h3 className="font-semibold text-lg pt-2">Location</h3>
                                    <InfoItem icon={MapPin} text={event.location} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Title, Registration & Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue={registrationStatus?.registered ? 'chat' : 'details'} className="mt-8">
                            <div className="flex justify-between items-start gap-4">
                                <TabsList>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="attendees" disabled={!registrationStatus?.registered}>
                                        <Users className="mr-2 h-4 w-4" /> Attendees
                                    </TabsTrigger>
                                    <TabsTrigger value="chat" disabled={!registrationStatus?.registered}>
                                        <MessageSquare className="mr-2 h-4 w-4" /> Event Chat
                                    </TabsTrigger>
                                </TabsList>
                                <Button size="lg" disabled={registrationStatus?.registered || isRegistering} onClick={() => setCheckoutModalOpen(true)}>
                                    {isRegistering ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Registering...</>
                                    ) : registrationStatus?.registered ? (
                                        <><CheckCircle className="mr-2 h-5 w-5" /> Registered</>
                                    ) : (
                                        <><Ticket className="mr-2 h-5 w-5" /> Get Tickets</>
                                    )}
                                </Button>
                            </div>
                            <TabsContent value="details" className="mt-4 prose prose-lg max-w-none text-muted-foreground">
                                <p>{event.description}</p>
                            </TabsContent>
                            <TabsContent value="attendees" className="mt-4">
                                {/* Attendee list component would go here */}
                                <AttendeesList />
                            </TabsContent>
                            <TabsContent value="chat" className="mt-4">
                                <p>Join the conversation with other attendees.</p>
                                <EventChat isOrganizer={registrationStatus?.isOrganizer || false} />
                            </TabsContent>
                        </Tabs>

                    </div>
                </div>
            </div>
            {
                checkoutModalOpen && <CheckoutModal open={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} event={event} onConfirm={(eventId) => register(eventId)} />
            }
        </div>
    );
};

// --- Helper & Skeleton Components ---
const InfoItem = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <span className="font-medium text-muted-foreground">{text}</span>
    </div>
);

const formatDateRange = (start: Date, end: Date) => {
    if (format(start, 'yyyyMMdd') === format(end, 'yyyyMMdd')) {
        return format(start, 'E, LLL dd, yyyy');
    }
    return `${format(start, 'LLL dd')} - ${format(end, 'LLL dd, yyyy')}`;
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