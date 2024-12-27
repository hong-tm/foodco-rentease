"use client";

import { fetchStallsQueryOptions, GetStallsResponse } from "@/api/stallApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery } from "@tanstack/react-query";
import { FishSymbol } from "lucide-react";
import { StallsTableSkeleton } from "./StallTableSkeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function StallsTable() {
	const isMobile = useIsMobile();
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

	// Button renderer
	const renderStallButton = (stall: any) => (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Button
						key={stall.stallNumber}
						variant={stall.rentStatus ? "outline" : "destructive"}
						size="lg"
						className="w-16 h-16 p-0 flex flex-col items-center justify-center"
					>
						<FishSymbol className="h-6 w-6 mb-1" />
						<span className="text-xs">{stall.stallNumber}</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{stall.stallName || "Not available"}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);

	// Row renderer
	const renderRow = (stalls: any[], isMiddleRow: boolean, rowIndex: number) => (
		<div
			key={rowIndex}
			className={`flex ${
				isMiddleRow ? "justify-between" : "justify-center gap-4"
			} items-center py-2`}
		>
			{isMiddleRow ? (
				<>
					{stalls[0] && renderStallButton(stalls[0])}
					<div className="flex-grow border-t border-dashed border-gray-300 mx-4"></div>
					{stalls[1] && renderStallButton(stalls[1])}
				</>
			) : (
				stalls.map(renderStallButton)
			)}
		</div>
	);

	// Prepare rows
	const stalls = data?.stall || [];
	const firstRowStalls = stalls.slice(0, 7); // First row
	const lastRowStalls = stalls.slice(stalls.length - 7); // Last row
	const middleRows = Array.from({ length: 3 }, (_, index) => {
		const startIndex = 7 + index * 2; // Middle rows
		return [
			stalls[startIndex], // Left stall
			stalls[startIndex + 1], // Right stall
		].filter(Boolean); // Filter out undefined values
	});

	if (isMobile) {
		return (
			<Card className="w-full border-none shadow-none">
				<CardHeader>
					<CardTitle className="text-destructive">Stalls</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<div className="flex flex-wrap gap-4 justify-center">
						{stalls.map(renderStallButton)}
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
					{/* First row */}
					{renderRow(firstRowStalls, false, 0)}
					{/* Middle rows */}
					{middleRows.map((rowStalls, index) =>
						renderRow(rowStalls, true, index + 1)
					)}
					{/* Last row */}
					{renderRow(lastRowStalls, false, middleRows.length + 1)}
				</div>
			</CardContent>
		</Card>
	);
}
