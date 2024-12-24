import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { authClient } from "@/lib/auth-client";
import { UserAttributes } from "@server/db/userModel";
import { EllipsisVertical } from "lucide-react";
import { useEffect, useState } from "react";

export default function UsersTable() {
	const [users, setUsers] = useState<UserAttributes[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setIsLoading(true);
				const response = await authClient.admin.listUsers({
					query: {
						sortBy: "name",
					},
				});

				if (response.data) {
					setUsers(response.data.users as UserAttributes[]);
				}
			} catch {
				setError(
					error instanceof Error ? error : new Error("Failed to fetch users")
				);
			} finally {
				setIsLoading(false);
			}
		};
		fetchUsers();
	}, []);

	if (isLoading) {
		return <div className="justify-center p-4">Loading...</div>;
	}

	if (error) {
		return <div className="justify-center p-4">Error: {error.message}</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-4">
			<div className="overflow-x-auto">
				<Table className="min-w-full table-auto border-separate border-spacing-0">
					<TableCaption className="text-sm text-gray-500 dark:text-gray-400">
						A list of all your users.
					</TableCaption>
					<TableHeader>
						<TableRow className="bg-gray-100 dark:bg-gray-700">
							<TableHead className="px-4 py-2 text-left">Name</TableHead>
							<TableHead className="px-4 py-2 text-left">Email</TableHead>
							<TableHead className="px-4 py-2 text-center">Role</TableHead>
							<TableHead className="px-4 py-2 text-center">Verified</TableHead>
							<TableHead className="px-4 py-2 text-left">Phone</TableHead>
							<TableHead className="px-4 py-2 text-center">Status</TableHead>
							<TableHead className="px-4 py-2 text-left">Joined</TableHead>
							<TableHead className="px-4 py-2 text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => (
							<TableRow
								key={user.id}
								className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							>
								<TableCell className="px-4 py-2">{user.name}</TableCell>
								<TableCell className="px-4 py-2">{user.email}</TableCell>
								<TableCell className="px-4 py-2 text-center">
									{user.role}
								</TableCell>
								<TableCell className="px-4 py-2 text-center">
									{user.emailVerified ? "Yes" : "No"}
								</TableCell>
								<TableCell className="px-4 py-2">
									{user.phone ? user.phone : "null"}
								</TableCell>
								<TableCell className="px-4 py-2 text-center">
									{user.banned ? (
										<Badge
											variant="secondary"
											className="text-red-600 dark:text-red-300"
										>
											Banned
										</Badge>
									) : (
										<Badge
											variant="secondary"
											className="text-green-600 dark:text-green-300"
										>
											Active
										</Badge>
									)}
								</TableCell>
								<TableCell className="px-4 py-2">
									{new Date(user.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell className="px-4 py-2 text-center">
									<Button variant="secondary" size="icon">
										<EllipsisVertical />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter></TableFooter>
				</Table>
			</div>
		</div>
	);
}
