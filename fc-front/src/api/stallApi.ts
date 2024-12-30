import { api } from "@/lib/api";
import { StallUserAttributes, UserAttributes } from "@server/db/userModel";
import { updateStallSchema } from "@server/lib/sharedType";
import { UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";

export interface GetStallsResponse {
	stall: StallUserAttributes[];
	users: UserAttributes[];
}

export type StallFormProps = {
	stall: StallUserAttributes;
	onSubmit?: (data: any) => void;
	setOpenDialog?: (open: boolean) => void;
};

export type StallButtonProps = {
	stall: StallUserAttributes;
	onOpen: (stallId: string | null) => void;
	isOpen: boolean;
};

// Function

export async function fetchStalls(): Promise<GetStallsResponse> {
	const Response = await api.stalls.$get();

	if (!Response.ok) throw new Error("Failed to fetch stalls");

	const data = await Response.json();
	const { stall } = data as GetStallsResponse;
	return { stall, users: [] };
}

export async function updateStall(values: z.infer<typeof updateStallSchema>) {
	const { stallNumber, ...restOfValues } = values;
	const stallId = stallNumber?.toString();

	if (!restOfValues) {
		throw new Error("No values to update");
	}

	if (!stallId) {
		throw new Error("Stall ID is required");
	}

	const Response = await api.stalls[":stallId"].$post({
		json: values,
		param: { stallId },
	});

	if (!Response.ok) {
		const errorData = (await Response.json()) as
			| { error: string }
			| { message: string; stall: {} };
		if ("error" in errorData) {
			throw new Error(errorData.error || "Failed to update stall");
		} else {
			throw new Error(errorData.message || "Failed to update stall");
		}
	}

	return Response.json();
}

// QueryOptions
export const fetchStallsQueryOptions: UseQueryOptions<GetStallsResponse> = {
	queryKey: ["fetch-stalls"],
	queryFn: fetchStalls,
	staleTime: 1000 * 60 * 1, // Cache for 1 minute
};
