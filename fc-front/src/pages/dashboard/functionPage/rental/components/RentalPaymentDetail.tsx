"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
	{
		month: "January",
		electric: 150,
		water: 80,
		rental: 500,
		total: 730,
	},
	{
		month: "February",
		electric: 180,
		water: 85,
		rental: 500,
		total: 765,
	},
	{
		month: "March",
		electric: 165,
		water: 90,
		rental: 500,
		total: 755,
	},
	{
		month: "April",
		electric: 200,
		water: 95,
		rental: 500,
		total: 795,
	},
	{
		month: "May",
		electric: 220,
		water: 100,
		rental: 500,
		total: 820,
	},
	{
		month: "June",
		electric: 190,
		water: 88,
		rental: 500,
		total: 778,
	},
];

const chartConfig = {
	electric: {
		label: "Electric",
		color: "hsl(var(--chart-1))",
	},
	water: {
		label: "Water",
		color: "hsl(var(--chart-2))",
	},
	rental: {
		label: "Rental",
		color: "hsl(var(--chart-3))",
	},
} satisfies ChartConfig;

export default function RentalPaymentDetail() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle>Payment Details</CardTitle>
				<CardDescription>
					Monthly payment breakdown for utilities and rental
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-2">
				<ChartContainer config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={chartData}
						margin={{
							left: 12,
							right: 12,
							top: 8,
							bottom: 0,
						}}
						stackOffset="expand"
						height={80}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={false}
							tickMargin={4}
							tickFormatter={(value) => value.slice(0, 3)}
							height={20}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="line" />}
						/>
						<Area
							dataKey="rental"
							type="natural"
							fill="var(--color-rental)"
							fillOpacity={0.1}
							stroke="var(--color-rental)"
							stackId="a"
						/>
						<Area
							dataKey="water"
							type="natural"
							fill="var(--color-water)"
							fillOpacity={0.4}
							stroke="var(--color-water)"
							stackId="a"
						/>
						<Area
							dataKey="electric"
							type="natural"
							fill="var(--color-electric)"
							fillOpacity={0.4}
							stroke="var(--color-electric)"
							stackId="a"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
			<CardFooter>
				<div className="flex w-full items-start gap-2 text-sm">
					<div className="grid gap-2">
						<div className="flex items-center gap-2 font-medium leading-none">
							{chartData[chartData.length - 1].total >
							chartData[chartData.length - 2]?.total ? (
								<>
									Total expenses increased by <TrendingUp className="h-4 w-4" />
									{(
										((chartData[chartData.length - 1]?.total -
											chartData[chartData.length - 2]?.total) /
											chartData[chartData.length - 2]?.total) *
										100
									).toFixed(1)}
									% this month
								</>
							) : (
								<>
									Total expenses decreased by{" "}
									<TrendingDown className="h-4 w-4" />
									{(
										((chartData[chartData.length - 2]?.total -
											chartData[chartData.length - 1]?.total) /
											chartData[chartData.length - 2]?.total) *
										100
									).toFixed(1)}
									% this month
								</>
							)}
						</div>
						<div className="flex items-center gap-2 leading-none text-muted-foreground">
							January - June 2024
						</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
