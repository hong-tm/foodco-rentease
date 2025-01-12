import { fetchStallCurrentQueryOptions } from "@/api/stallApi";
import { useQuery } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/api/adminApi";
import { Badge } from "@/components/ui/badge";

export default function RentalStallsDetail() {
	const { data: session } = useSession();
	const { data, isLoading, error } = useQuery(
		fetchStallCurrentQueryOptions(session?.user?.id || "")
	);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error loading stall details</div>;
	}

	if (!data) {
		return <div>No stall data found</div>;
	}

	const { stalls } = data;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Stall Details</CardTitle>
						<CardDescription>
							Show all your current stall details
						</CardDescription>
					</div>
					<Badge variant="secondary">Total Stalls: {stalls.length}</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{stalls.map((stall) => (
						<Card
							key={stall.stallNumber}
							className="overflow-hidden transition-all border-none shadow-none"
						>
							<div className="relative aspect-[16/9]">
								<img
									src={stall.stallImage || "/placeholder-stall.jpg"}
									alt={`Stall ${stall.stallNumber}`}
									className="object-cover w-full h-full"
								/>
								<div className="absolute top-2 right-2">
									<Badge>Stall #{stall.stallNumber}</Badge>
								</div>
							</div>
							<CardContent className="pt-6">
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-muted-foreground">
												Rental Fee
											</p>
											<p className="font-semibold">
												RM{" "}
												{(
													stall.stallTierNumber.tierPrice * stall.stallSize
												).toFixed(2)}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Stall Size
											</p>
											<p className="font-semibold">{stall.stallSize} m²</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Start Date
											</p>
											<p className="font-semibold">
												{new Date(stall.startAt).toLocaleDateString()}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">End Date</p>
											<p className="font-semibold">
												{new Date(stall.endAt).toLocaleDateString()}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
