import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const SkeletonCard = () => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="p-0">
             {/* Mimics the 16:9 image aspect ratio */}
             <Skeleton className="w-full aspect-[16/9]" />
        </CardHeader>
        <CardContent className="p-4 space-y-3 flex-grow">
            {/* Mimics the title */}
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <div className="space-y-2 pt-2">
                 {/* Mimics the date, time, and location lines */}
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
        </CardContent>
    </Card>
  )
}