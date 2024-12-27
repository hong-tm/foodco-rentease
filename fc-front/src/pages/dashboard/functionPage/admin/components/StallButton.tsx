import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResponsiveSheetDialog } from "@/pages/dashboard/components/ResponsiveSheetDialog";
import { FishSymbol } from "lucide-react";
import UpdateStallForm from "./UpdateStallForm";

interface StallButtonProps {
	stall: any;
	onOpen: (id: string | null) => void;
	isOpen: boolean;
}

export const StallButton: React.FC<StallButtonProps> = ({
	stall,
	onOpen,
	isOpen,
}) => {
	const stallId = `stall-${stall.stallNumber}`;

	return (
		<div>
			<ResponsiveSheetDialog
				isOpen={isOpen}
				setIsOpen={(open) => onOpen(open ? stallId : null)}
				title="Stall Details"
				description={`Details of the stall ${stall.stallNumber}`}
			>
				<div className="">
					<UpdateStallForm stall={stall} />
				</div>
			</ResponsiveSheetDialog>

			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={() => onOpen(stallId)}
							variant={stall.rentStatus ? "secondary" : "destructive"}
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
		</div>
	);
};
