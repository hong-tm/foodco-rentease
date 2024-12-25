import { fetchUsersQueryOptions } from "@/api/authApi";
import { Badge } from "@/components/ui/badge";
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

import { useQuery } from "@tanstack/react-query";

import { AdminActionButton } from "./AdminActionButton";

export default function UsersTable() {
	const { data, error, isLoading } = useQuery(fetchUsersQueryOptions);

	if (isLoading) {
		return <div className="justify-center p-4">Loading...</div>;
	}

	if (error) {
		return <div className="justify-center p-4">Error: {error.message}</div>;
	}

	const users = data?.users || [];

	return (
		<div className="grid grid-cols-1 gap-4">
			<div className="overflow-x-auto">
				<Table className="min-w-full table-auto border-separate border-spacing-0">
					<TableCaption className="text-sm text-gray-500 dark:text-gray-400">
						A list of all your users.
					</TableCaption>
					<TableHeader>
						<TableRow>
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
									{user.role === "admin" ? (
										""
									) : (
										<AdminActionButton
											userId={user.id}
											userRole={user.role}
											userBanned={user.banned}
										/>
									)}
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
