'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllAttendeesFn } from '@/constants/api';

interface Attendee {
  id: string;
  name: string;
  image: string | null;
}

export const AttendeesList = () => {
  const params = useParams();
  const eventId = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: () => getAllAttendeesFn(eventId),
    enabled: !!eventId,
  });

  if (isLoading) return <AttendeesSkeleton />;
  if (isError)
    return (
      <p className="text-center text-destructive">Could not load attendees.</p>
    );

  const { organizer, me, data: attendees, pagination } = data ?? {};

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {pagination?.totalItems ?? 0} Attendee
        {pagination?.totalItems !== 1 ? 's' : ''}
      </h3>

      <div className="max-h-[65vh] overflow-y-auto pr-2 space-y-10">
        {/* --- Organizer Section --- */}
        {organizer && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Organizer
            </h4>
            <AttendeeItem
              attendee={organizer}
              label="Organizer"
              variant="premium"
            />
          </div>
        )}

        {/* --- Me Section --- */}
        {me && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              You
            </h4>
            <AttendeeItem attendee={me} label="You" variant="self" />
          </div>
        )}

        {/* --- Other Attendees Section --- */}
        {attendees && attendees.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Other Attendees
            </h4>
            <div className="space-y-2">
              {attendees.map((attendee: Attendee) => {
                if (
                  attendee.id === me?.id ||
                  attendee.id === organizer?.id
                )
                  return null;
                return <AttendeeItem key={attendee.id} attendee={attendee} />;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Individual Attendee Component ---
const AttendeeItem = ({
  attendee,
  label,
  variant = 'default',
}: {
  attendee: Attendee;
  label?: string;
  variant?: 'premium' | 'self' | 'default';
}) => {
  let style = '';
  let labelStyle = '';

  switch (variant) {
    case 'premium':
      style =
        'bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] text-white border-0 shadow-md';
      labelStyle = 'text-xs font-semibold text-white/80';
      break;

    case 'self':
      style =
        'bg-gradient-to-r from-green-100/80 to-emerald-200/70 dark:from-green-900/30 dark:to-emerald-950/20 border border-green-200 dark:border-green-800';
      labelStyle = 'text-xs text-green-700 dark:text-green-400 font-medium';
      break;

    default:
      style =
        'bg-muted/30 hover:bg-muted/50 border border-border transition-colors';
      labelStyle = 'text-xs text-muted-foreground';
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${style}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-background/50">
          <AvatarImage src={attendee.image || undefined} />
          <AvatarFallback>
            {attendee.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p
            className={`font-medium text-sm ${
              variant === 'premium' ? 'text-white' : ''
            }`}
          >
            {attendee.name}
          </p>
          {label && <p className={labelStyle}>{label}</p>}
        </div>
      </div>
    </div>
  );
};

// --- Skeleton Loader ---
const AttendeesSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-7 w-28" />
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);
