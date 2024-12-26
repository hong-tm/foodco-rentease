import { authClient } from "@/lib/auth-client";
import { UserAttributes } from "@server/db/userModel";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export interface GetUsersResponse {
	users: UserAttributes[];
}

export async function fetchUsers(): Promise<GetUsersResponse> {
	try {
		const response = await authClient.admin.listUsers({
			query: {
				sortBy: "name",
			},
		});

		if (response.data) {
			return response.data as GetUsersResponse;
		}

		throw new Error("No users found");
	} catch (error) {
		throw error instanceof Error ? error : new Error("Failed to fetch users");
	}
}

export async function fetchRentals() {}

export const useSession = (authClient: any) => {
	return useQuery({
		queryKey: ["user-session"],
		queryFn: async () => {
			const session = await authClient.getSession();
			if (!session.data) throw new Error("No session data found");
			return session.data;
		},
		staleTime: 1000 * 60 * 1, // Cache for 1 minutes
		refetchOnWindowFocus: true,
		refetchInterval: 1000 * 10, // Refetch every 10 seconds
		retry: false, // No retries for session fetching
	});
};

// QueryOptions
export const fetchUsersQueryOptions: UseQueryOptions<GetUsersResponse> = {
	queryKey: ["fetch-users"],
	queryFn: fetchUsers,
	staleTime: 1000 * 60 * 1, // 1 minute
};
