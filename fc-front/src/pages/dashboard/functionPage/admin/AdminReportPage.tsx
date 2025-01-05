import { useQuery } from "@tanstack/react-query";
import { getAllPaymentRecordsQueryOptions } from "@/api/paymentApi";
import { PaymentRecordsTable } from "@/components/PaymentRecordsTable";

export function AdminReportPage() {
	const { data: records, isLoading } = useQuery(
		getAllPaymentRecordsQueryOptions
	);

	return (
		<PaymentRecordsTable
			title="Payment Records"
			description="Monthly payment records for all stalls"
			records={records || []}
			showMonthFilter={true}
			isLoading={isLoading}
		/>
	);
}
