import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function StallsTableSkeleton() {
	return (
		<Card className="grid grid-cols-1 w-full max-w-3xl mx-auto border-none shadow-none">
			<CardHeader>
				<VisuallyHidden>
					<CardTitle></CardTitle>
				</VisuallyHidden>
			</CardHeader>
			<CardContent className="overflow-x-auto">
				<div className="flex flex-wrap gap-4 justify-center">
					{[0, 1, 2, 3, 4].map((row) => (
						<div key={row} className="flex flex-col justify-center gap-4">
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
