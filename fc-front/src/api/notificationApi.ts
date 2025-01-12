import { api } from "@/lib/api";
import { NotificationAttributes, UserAttributes } from "@server/db/userModel";
import { createAppointmentSchema } from "@server/lib/sharedType";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

export interface NotificationResponse {
	notification: NotificationAttributes[]; // Assuming your feedback array is of type 'Feedback'
	userId: UserAttributes[];
}

export async function createAppointment(
	values: z.infer<typeof createAppointmentSchema>
) {
	const res = await api.notifications["$post"]({ json: values });
	if (!res.ok) {
		const error = await res.json();
		if (typeof error === "object" && error && "error" in error) {
			if (error.error === "You have already made this appointment request") {
				throw new Error(error.error);
			}
		}
		throw new Error("Failed to create appointment");
	}
	return res.json();
}

export async function updateAppointmentStatus(
	notificationId: number,
	notificationRead: boolean,
	stallNumber: number
) {
	const res = await api.notifications["update-appoitmentStatus"].$post({
		json: { notificationId, notificationRead, stallNumber },
	});
	if (!res.ok) throw new Error("Failed to update appointment status");
	return res.json();
}

export async function fetchNotifications() {
	const res = await api.notifications.$get();
	if (!res.ok) throw new Error("Failed to fetch notifications");

	const data = await res.json();
	const { notification } = data as NotificationResponse;
	return notification;
}

export async function fetchUserNotifications(userId: string) {
	const res = await api.notifications[":userId"].$get({
		param: { userId },
	});

	if (!res.ok) throw new Error("Failed to fetch notifications");

	const data = await res.json();
	const { notification } = data as NotificationResponse;
	return notification;
}

// QueryOptions
export const getAllNotificationQueryOptions = queryOptions<
	NotificationAttributes[]
>({
	queryKey: ["get-notifications"],
	queryFn: fetchNotifications,
	staleTime: 1000 * 60 * 1, // 1 minutes
});

export const getUserNotificationQueryOptions = queryOptions<
	NotificationAttributes[]
>({
	queryKey: ["get-user-notifications"],
	queryFn: ({ queryKey }) => {
		const [, userId] = queryKey;
		return fetchUserNotifications(userId as string);
	},
	staleTime: 1000 * 60 * 1, // 1 minutes
});
