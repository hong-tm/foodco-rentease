import { api } from "@/lib/api";
import { StallUserAttributes, UserAttributes } from "@server/db/userModel";
import { UseQueryOptions } from "@tanstack/react-query";

export interface GetStallsResponse {
	stall: StallUserAttributes[];
	users: UserAttributes[];
}

export async function fetchStalls(): Promise<GetStallsResponse> {
	const res = await api.stalls.$get();

	if (!res.ok) throw new Error("Failed to fetch stalls");

	const data = await res.json();
	const { stall } = data as GetStallsResponse;
	return { stall, users: [] };
}

// QueryOptions
export const fetchStallsQueryOptions: UseQueryOptions<GetStallsResponse> = {
	queryKey: ["fetch-stalls"],
	queryFn: fetchStalls,
	staleTime: 1000 * 60 * 1, // Cache for 1 minute
};
