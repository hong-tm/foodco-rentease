import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getAllPaymentRecordsQueryOptions } from "@/api/paymentApi";
import { useSession } from "@/api/adminApi";
import { Loader2 } from "lucide-react";

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
	const { data: session } = useSession();
	const userId = session?.user?.id;

	const { data: payments, isLoading } = useQuery({
		...getAllPaymentRecordsQueryOptions,
		select: (data) => {
			if (!data) return [];

			// Filter payments by status and type
			const validPayments = data.filter(
				(payment) =>
					payment.paymentStatus &&
					["water", "electric", "rental"].includes(payment.paymentType) &&
					payment.userId === userId
			);

			// Group payments by month
			const monthlyPayments = validPayments.reduce((acc, payment) => {
				const date = new Date(payment.paymentDate);
				const monthKey = `${date.getFullYear()}-${String(
					date.getMonth() + 1
				).padStart(2, "0")}`;
				const monthName = date.toLocaleString("default", { month: "long" });

				if (!acc[monthKey]) {
					acc[monthKey] = {
						month: monthName,
						monthKey,
						electric: 0,
						water: 0,
						rental: 0,
						total: 0,
					};
				}

				const amount = parseFloat(payment.paymentAmount);
				acc[monthKey][payment.paymentType] += amount;
				acc[monthKey].total += amount;

				return acc;
			}, {} as Record<string, any>);

			// Convert to array and sort by date
			return Object.values(monthlyPayments)
				.sort((a, b) => a.monthKey.localeCompare(b.monthKey))
				.map(({ monthKey, ...rest }) => rest);
		},
	});

	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex justify-center items-center min-h-[300px]">
					<Loader2 className="h-8 w-8 animate-spin" />
				</CardContent>
			</Card>
		);
	}

	if (!payments || payments.length === 0) {
		return (
			<Card>
				<CardContent className="flex justify-center items-center min-h-[300px]">
					<p className="text-muted-foreground">No payment records found.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle>Payment Details</CardTitle>
				<CardDescription>
					onthly payment breakdown for utilities and rental
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-2">
				<ChartContainer config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={payments}
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
							{payments[payments.length - 1]?.total >
							payments[payments.length - 2]?.total ? (
								<>
									Total expenses increased by <TrendingUp className="h-4 w-4" />
									{(
										((payments[payments.length - 1]?.total -
											payments[payments.length - 2]?.total) /
											payments[payments.length - 2]?.total) *
										100
									).toFixed(1)}
									% this month
								</>
							) : (
								<>
									Total expenses decreased by{" "}
									<TrendingDown className="h-4 w-4" />
									{(
										((payments[payments.length - 2]?.total -
											payments[payments.length - 1]?.total) /
											payments[payments.length - 2]?.total) *
										100
									).toFixed(1)}
									% this month
								</>
							)}
						</div>
						<div className="flex items-center gap-2 leading-none text-muted-foreground">
							{payments[0]?.month} - {payments[payments.length - 1]?.month}{" "}
							{new Date().getFullYear()}
						</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
