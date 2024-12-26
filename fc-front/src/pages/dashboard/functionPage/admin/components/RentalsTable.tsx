import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { TenantActionButton } from "./TenantActionButton";

export default function RentalsTable() {
	return (
		<div className="grid grid-cols-1 gap-4">
			<div className="overflow-x-auto">
				<Table>
					<TableCaption>A list of your recent invoices.</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">Invoice</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Method</TableHead>
							<TableHead>Action</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Method</TableHead>
							<TableHead className="text-right">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="font-medium">INV001</TableCell>
							<TableCell>Paid</TableCell>
							<TableCell>Credit Card</TableCell>
							<TableCell className="text-right">
								<TenantActionButton />
							</TableCell>
						</TableRow>
					</TableBody>
					<TableFooter></TableFooter>
				</Table>
			</div>
		</div>
	);
}
