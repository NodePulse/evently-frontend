'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Sidebar from "@/components/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Eye, PlusCircle, Calendar, MapPin, Video, Menu } from "lucide-react";
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import { getEventsFn } from '@/constants/api';
import Image from 'next/image';

// Type for event
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string;
  videoUrl: string | null;
}

// Helper to format date and time
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  const optionsDate: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
  return {
    date: date.toLocaleDateString(undefined, optionsDate),
    time: date.toLocaleTimeString(undefined, optionsTime),
  };
};

const MyEventsPage = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: events, isLoading, isError } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: getEventsFn,
  });

  const handleViewClick = (event: Event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching events.</div>;

  return (
    <>
      <div className="space-y-4 px-4">
        <div className="flex items-center justify-between md:hidden">
          <h1 className="text-2xl font-bold">My Events</h1>
          <Link href="/createEvent">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </Link>
        </div>
        <Separator />

        {events && events.length > 0 ? (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const { date, time } = formatDateTime(event.startDate);
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{date}</TableCell>
                      <TableCell>{time}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewClick(event)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20 text-center">
            <h2 className="text-xl font-semibold">No Events Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven\'t created any events yet.
            </p>
            <Link href="/createEvent" className="mt-4">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Event
              </Button>
            </Link>
          </div>
        )}
      </div>

      {selectedEvent && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
              <DialogDescription>Complete details of your event.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {selectedEvent.imageUrl && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={selectedEvent.imageUrl}
                    alt={selectedEvent.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}

              <p className="text-sm">{selectedEvent.description}</p>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    <strong>Starts:</strong> {formatDateTime(selectedEvent.startDate).date} at{" "}
                    {formatDateTime(selectedEvent.startDate).time}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    <strong>Ends:</strong> {formatDateTime(selectedEvent.endDate).date} at{" "}
                    {formatDateTime(selectedEvent.endDate).time}
                  </span>
                </div>
                <div className="flex items-center col-span-2">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>
                    <strong>Location:</strong> {selectedEvent.location}
                  </span>
                </div>
                {selectedEvent.videoUrl && (
                  <div className="flex items-center col-span-2">
                    <Video className="mr-2 h-4 w-4" />
                    <Link
                      href={selectedEvent.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Watch Event Video
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default MyEventsPage;