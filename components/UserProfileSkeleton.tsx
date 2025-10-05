import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const UserProfileSkeleton = () => (
  <div className="container mx-auto max-w-6xl p-4 md:p-6">
    <Card className="overflow-hidden">
      <Skeleton className="h-40 md:h-52 w-full" />
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20 z-10 relative">
        <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-12 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </Card>
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
         <Skeleton className="h-10 w-1/2" />
         <div className="mt-4 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
         </div>
      </div>
    </div>
  </div>
);