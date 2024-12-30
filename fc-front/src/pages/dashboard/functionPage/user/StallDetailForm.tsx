import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StallFormProps } from "@/api/stallApi";

export default function StallDetailForm({ stall }: StallFormProps) {
	const price = stall.stallTierNumber?.tierPrice * stall.stallSize || 0;

	return (
		<div className="flex flex-col px-12 w-full md:px-0 justify-center items-center mt-4">
			<Card className="w-full max-w-md border-0 shadow-none">
				<CardHeader className="p-0 relative rounded-md">
					<img
						src={stall.stallImage || "/placeholder.jpg"}
						alt={`Stall ${stall.stallNumber}`}
						className="h-56 w-full object-cover"
						loading="lazy"
					/>
					<Badge className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 text-sm font-semibold">
						Stall #{stall.stallNumber}
					</Badge>
				</CardHeader>
				<CardContent className="pt-6">
					<CardTitle className="text-2xl mb-2">{stall.stallName}</CardTitle>
					<CardDescription className="mb-6">
						{stall.description || "No description available"}
					</CardDescription>
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm font-medium text-gray-500">Size:</span>
							<span className="text-sm font-semibold">
								{stall.stallSize} m²
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm font-medium text-gray-500">Status:</span>
							<Badge variant={stall.rentStatus ? "destructive" : "secondary"}>
								{stall.rentStatus ? "Occupied" : "Available"}
							</Badge>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm font-medium text-gray-500">Owner:</span>
							<span className="text-sm font-semibold">
								{stall.stallOwnerId?.name || "No owner"}
							</span>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					{stall.rentStatus ? (
						""
					) : (
						<div className="w-full flex flex-col gap-4 justify-between items-center">
							<div className="flex justify-between items-center w-full">
								<span className="text-sm font-medium">Price:</span>
								<span className="text-2xl font-bold ml-2">
									RM {price.toFixed(2)}
								</span>
							</div>
							<Button className="w-full">Make Appointment</Button>
						</div>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
