import RentalPaymentDetail from "./components/RentalPaymentDetail";
import RentalStallsDetail from "./components/RentalStallsDetail";

export function RentalDashboard() {
	return (
		<div className="flex flex-col gap-4">
			<RentalStallsDetail />
			<RentalPaymentDetail />
		</div>
	);
}
