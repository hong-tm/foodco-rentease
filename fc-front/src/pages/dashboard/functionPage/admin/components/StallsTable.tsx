import { fetchStallsQueryOptions, GetStallsResponse } from "@/api/stallApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery } from "@tanstack/react-query";
import { StallsTableSkeleton } from "./StallTableSkeleton";
import { useState } from "react";
import { StallButton } from "./StallButton";

export default function StallsTable() {
	const isMobile = useIsMobile();
	const [openStallId, setOpenStallId] = useState<string | null>(null);
	const { data, isLoading, error } = useQuery<GetStallsResponse>(
		fetchStallsQueryOptions
	);

	if (isLoading) {
		return <StallsTableSkeleton />;
	}

	if (error) {
		return (
			<Card className="w-full border-none shadow-none">
				<CardHeader>
					<CardTitle className="text-destructive">Error</CardTitle>
				</CardHeader>
				<CardContent>
					<p>{(error as Error).message}</p>
				</CardContent>
			</Card>
		);
	}

	const renderRow = (stalls: any[], isMiddleRow: boolean, rowIndex: number) => (
		<div
			key={`row-${rowIndex}`}
			className={`flex ${
				isMiddleRow ? "justify-between" : "justify-center gap-4"
			} items-center py-2`}
		>
			{isMiddleRow ? (
				<>
					{stalls[0] && (
						<StallButton
							stall={stalls[0]}
							onOpen={setOpenStallId}
							isOpen={openStallId === `stall-${stalls[0].stallNumber}`}
						/>
					)}
					<div className="flex-grow border-t border-dashed border-gray-300 mx-4"></div>
					{stalls[1] && (
						<StallButton
							stall={stalls[1]}
							onOpen={setOpenStallId}
							isOpen={openStallId === `stall-${stalls[1].stallNumber}`}
						/>
					)}
				</>
			) : (
				stalls.map((stall) => (
					<StallButton
						key={`stall-${stall.stallNumber}`}
						stall={stall}
						onOpen={setOpenStallId}
						isOpen={openStallId === `stall-${stall.stallNumber}`}
					/>
				))
			)}
		</div>
	);

	const stalls = data?.stall || [];
	const firstRowStalls = stalls.slice(0, 7);
	const lastRowStalls = stalls.slice(stalls.length - 7);
	const middleRows = Array.from({ length: 3 }, (_, index) => {
		const startIndex = 7 + index * 2;
		return [stalls[startIndex], stalls[startIndex + 1]].filter(Boolean);
	});

	if (isMobile) {
		return (
			<Card className="w-full border-none shadow-none">
				<CardHeader>
					<VisuallyHidden>
						<CardTitle></CardTitle>
					</VisuallyHidden>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<div className="flex flex-wrap gap-4 justify-center">
						{stalls.map((stall) => (
							<StallButton
								key={`stall-${stall.stallNumber}`}
								stall={stall}
								onOpen={setOpenStallId}
								isOpen={openStallId === `stall-${stall.stallNumber}`}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="grid grid-cols-1 w-full max-w-3xl mx-auto border-none shadow-none">
			<CardHeader>
				<VisuallyHidden>
					<CardTitle></CardTitle>
				</VisuallyHidden>
			</CardHeader>
			<CardContent className="overflow-x-auto">
				<div className="flex flex-col gap-6 min-w-[500px]">
					{renderRow(firstRowStalls, false, 0)}
					{middleRows.map((rowStalls, index) =>
						renderRow(rowStalls, true, index + 1)
					)}
					{renderRow(lastRowStalls, false, middleRows.length + 1)}
				</div>
			</CardContent>
		</Card>
	);
}
