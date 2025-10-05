'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SkeletonCard } from '@/components/SkeletonCard';
import { EventCard } from '@/components/EventCard';
import { getAllEventsFn } from '@/constants/api';
import { useDebounce } from '@/hooks/debounce';


// Define types for clarity
interface Filters {
    categories: string[];
    location: string;
}

// Mock API function (same as before)

const ExploreEventsPage = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({
        categories: [],
        location: '',
    });
    const debouncedSearch = useDebounce(searchQuery, 500);

    const { data: events, isLoading, isError } = useQuery({
        // The query key now includes the filters object
        queryKey: ['events', activeTab, debouncedSearch, filters],
        queryFn: () => getAllEventsFn({status: activeTab, search: debouncedSearch, ...filters}),
    });
    console.log(events)
    
    const handleCategoryChange = (category: string) => {
        setFilters(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const resetFilters = () => {
        setFilters({ categories: [], location: '' });
    };

    const activeFilterCount = filters.categories.length + (filters.location ? 1 : 0);

    const renderEventContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            );
        }

        if (isError || !events) return <p>Error fetching events.</p>;
        
        if (events.length === 0) {
            return (
                <div className="text-center py-20">
                    <h2 className="text-xl font-semibold">No Events Found</h2>
                    <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {events?.pagination.totalItems > 0 ? events?.data.map(event => <EventCard key={event.id} event={event} />) : <p>No events found.</p>}
            </div>
        );
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight">Explore Events</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Discover workshops, conferences, and meetups happening around the globe.
                </p>
            </header>

            <main>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                         <TabsList>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-auto flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search events..." 
                                    className="pl-10 w-full sm:w-[300px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="relative">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 rounded-full">
                                                {activeFilterCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Filters</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Narrow down your event search.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="location">Location</Label>
                                            <Input id="location" placeholder="e.g., Online, NYC" value={filters.location} onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Category</Label>
                                            <div className="space-y-2">
                                                {['Tech', 'Music', 'Art', 'Business', 'Health'].map(cat => (
                                                    <div key={cat} className="flex items-center space-x-2">
                                                        <Checkbox id={cat} checked={filters.categories.includes(cat)} onCheckedChange={() => handleCategoryChange(cat)} />
                                                        <Label htmlFor={cat} className="font-normal">{cat}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {activeFilterCount > 0 && (
                                            <Button variant="ghost" onClick={resetFilters}>
                                                <X className="mr-2 h-4 w-4" />
                                                Reset Filters
                                            </Button>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                   
                    <TabsContent value="upcoming">{renderEventContent()}</TabsContent>
                    <TabsContent value="ongoing">{renderEventContent()}</TabsContent>
                    <TabsContent value="past">{renderEventContent()}</TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default ExploreEventsPage;