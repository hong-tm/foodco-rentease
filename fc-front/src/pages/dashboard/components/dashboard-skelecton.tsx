import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{/* Top row */}
			<Skeleton className="h-[300px] min-w-min rounded-xl" />
			<Skeleton className="h-[300px] min-w-min rounded-xl" />
			<Skeleton className="h-[300px] min-w-min rounded-xl" />
			{/* Bottom row */}
			<Skeleton className="h-[300px] min-w-min rounded-xl" />
			<Skeleton className="h-[300px] min-w-min rounded-xl md:col-span-2" />
		</div>
	);
}
