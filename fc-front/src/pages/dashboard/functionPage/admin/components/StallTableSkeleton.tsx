import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StallsTableSkeleton() {
	return (
		<Card className="w-full max-w-3xl mx-auto">
			<CardHeader>
				<CardTitle>
					<Skeleton className="h-6 w-48" />
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-6">
					{[0, 1, 2, 3, 4].map((row) => (
						<div key={row} className="flex justify-center gap-4">
							{[0, 1, 2, 3, 4, 5, 6].map((col) => (
								<Skeleton key={col} className="w-16 h-16" />
							))}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
