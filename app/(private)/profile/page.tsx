"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { getUserProfileFn, getUserEventsFn, getOrganizedEventsFn } from "@/constants/api";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Briefcase, Calendar, Edit, Linkedin, MapPin, Twitter, UserIcon } from "lucide-react";
import { Event } from "@/components/EventCard";
import { User } from "@/context/authContext";
import { UserProfileSkeleton } from "@/components/UserProfileSkeleton";
import { useState } from "react";
import { EditProfileModal } from "./EditProfileModal";
import { ChangeProfileImageModal } from "./ChangeProfileImageModal";

// --- Main Page Component ---
export default function UserProfilePage() {
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [editProfileImageModalOpen, setEditProfileImageModalOpen] = useState(false);

    const { data: user, isLoading: isUserLoading } = useQuery<User>({
        queryKey: ["user-profile"],
        queryFn: getUserProfileFn,
    });

    const { data: joinedEvents } = useQuery<Event[]>({
        queryKey: ["user-joined-events"],
        queryFn: getUserEventsFn,
        enabled: !!user,
    });

    const { data: organizedEvents } = useQuery<Event[]>({
        queryKey: ["user-organized-events"],
        queryFn: getOrganizedEventsFn,
        enabled: !!user, // You can have a role check here if needed
    });

    if (isUserLoading) return <UserProfileSkeleton />;
    if (!user) return <p>User not found.</p>;

    // Derived stats
    const eventsJoinedCount = joinedEvents?.length || 0;
    const eventsOrganizedCount = organizedEvents?.length || 0;

    return (
        <>
            <div className="container mx-auto max-w-6xl px-4 md:px-4 pb-6">
                <h1 className="text-2xl font-bold flex md:hidden mb-2">Profile Settings</h1>
                {/* --- NEW: Profile Header --- */}
                <Card className="overflow-hidden py-0">
                    <div className="relative h-40 md:h-52 bg-muted">
                        {/* Cover Photo - assuming a field like user.coverImage exists */}
                        <Image src="/placeholder-cover.jpg" alt="Cover photo" fill className="object-cover" />
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20 z-10 relative">
                        <Avatar className="h-32 w-32 border-4 border-background cursor-pointer" onClick={() => setEditProfileImageModalOpen(true)}>
                            <AvatarImage src={user.image} />
                            <AvatarFallback className="text-3xl">
                                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <h2 className="text-3xl font-bold">{user.name}</h2>
                            <p className="text-muted-foreground">@{user.username}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <StatItem label="Events Joined" value={eventsJoinedCount} />
                            <StatItem label="Events Organized" value={eventsOrganizedCount} />
                            <Button variant="outline" onClick={() => setEditProfileModalOpen(true)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit Profile
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* --- NEW: Two-Column Layout --- */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Profile Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>About</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{user?.bio || "This user hasn't added a bio yet."}</p>
                                <Separator className="my-4" />
                                <ul className="space-y-3 text-sm">
                                    <InfoItem icon={MapPin} text={user?.location || "Location not specified"} />
                                    <InfoItem icon={UserIcon} text={user?.gender || "Gender not specified"} />
                                    <InfoItem icon={Calendar} text={`Joined on ${format(new Date(user?.createdAt) || new Date(), "LLL yyyy")}`} />
                                </ul>
                                <Separator className="my-4" />
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" asChild><Link href={"https://twitter.com/"}><Twitter /></Link></Button>
                                    <Button variant="ghost" size="icon" asChild><Link href={"https://www.linkedin.com/"}><Linkedin /></Link></Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Event Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="joined">
                            <TabsList>
                                <TabsTrigger value="joined">Joined Events</TabsTrigger>
                                <TabsTrigger value="organized">Organized Events</TabsTrigger>
                            </TabsList>
                            <TabsContent value="joined" className="mt-4">
                                <EventList events={joinedEvents} emptyMessage="You haven't joined any events yet." />
                            </TabsContent>
                            <TabsContent value="organized" className="mt-4">
                                <EventList events={organizedEvents} emptyMessage="You haven't organized any events yet." />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
            <EditProfileModal user={user} isOpen={editProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} />
            <ChangeProfileImageModal isOpen={editProfileImageModalOpen} onClose={() => setEditProfileImageModalOpen(false)} currentImage={user.image} />
        </>
    );
}

// --- NEW & Helper Components ---

const StatItem = ({ label, value }: { label: string; value: number }) => (
    <div className="text-center">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground uppercase">{label}</p>
    </div>
);

const InfoItem = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <li className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-foreground">{text}</span>
    </li>
);

const EventList = ({ events, emptyMessage }: { events: Event[] | undefined, emptyMessage: string }) => (
    <div className="flex flex-col gap-4">
        {events?.length ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
            <p className="text-muted-foreground text-center py-10">{emptyMessage}</p>
        )}
    </div>
);

export const EventCard = ({ event }: { event: Event }) => {
    return (
        <Link href={`/events/${event.id}`}>
            <Card className="transition-all hover:shadow-md hover:bg-muted/50">
                <CardContent className="p-3 flex items-center justify-between">
                    <div className="space-y-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(event.startDate), 'LLL dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
            </Card>
        </Link>
    );
};