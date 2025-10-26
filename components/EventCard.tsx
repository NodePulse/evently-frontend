import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

// Define a type for your event object for type safety
export interface Event {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    imageUrl: string;
}

// Helper function to determine the event's current status
const getEventStatus = (startDate: Date, endDate: Date): { text: string; variant: 'default' | 'destructive' | 'secondary' } => {
    const now = new Date();
    if (now > endDate) {
        return { text: 'Completed', variant: 'secondary' };
    }
    if (now >= startDate && now <= endDate) {
        return { text: 'LIVE', variant: 'destructive' };
    }
    return { text: 'Upcoming', variant: 'default' };
};

export const EventCard = ({ event }: { event: Event }) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const status = getEventStatus(startDate, endDate);

    return (
        <Link href={`/events/${event.id}`} className="block">
            <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group h-full flex flex-col py-0">
                <CardHeader className="p-0 relative">
                    {/* Image container with a fixed aspect ratio */}
                    <div className="aspect-[16/9] relative w-full">
                        {
                            event.imageUrl && <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        }
                        {/* Overlay for better text readability on the badge */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                    </div>
                    {/* Status badge positioned at the top right */}
                    <Badge variant={status.variant} className="absolute top-3 right-3 text-xs font-bold">
                        {status.text}
                    </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3 flex-grow">
                    <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">{event.title}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{format(startDate, 'E, LLL dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{format(startDate, 'p')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};