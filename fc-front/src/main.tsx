import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { DashboardLayoutPage } from "./pages/dashboard/DashboardLayoutPage.tsx";
import App from "./App.tsx";
import SignUpPage from "./pages/(auth)/SignUpPage.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "./lib/auth-client.ts";

const FeedbackDisplayPage = lazy(() =>
	import("./pages/feedback/FeedbackDisplayPage.tsx").then((module) => ({
		default: module.FeedbackDisplayPage,
	}))
);

const ChangePasswordPage = lazy(() =>
	import("./pages/(auth)/ChangePasswordPage.tsx").then((module) => ({
		default: module.default,
	}))
);

const TenantInformationPage = lazy(() =>
	import("./pages/dashboard/functionPage/admin/TenantInformationPage.tsx").then(
		(module) => ({
			default: module.TenantInformationPage,
		})
	)
);

const EmailVerifiedPage = lazy(() =>
	import("./pages/(auth)/EmailVerifiedPage.tsx").then((module) => ({
		default: module.EmailVerifiedPage,
	}))
);

const ForgetPasswordPage = lazy(() =>
	import("./pages/(auth)/ForgetPasswordPage.tsx").then((module) => ({
		default: module.default,
	}))
);

const ResetPasswordPage = lazy(() =>
	import("./pages/(auth)/ResetPasswordPage.tsx").then((module) => ({
		default: module.default,
	}))
);

const UserProfilePage = lazy(() =>
	import("./pages/(auth)/UserProfilePage.tsx").then((module) => ({
		default: module.default,
	}))
);

const NotFoundPage = lazy(() =>
	import("./pages/NotFoundPage.tsx").then((module) => ({
		default: module.default,
	}))
);

const AdminManage = lazy(() =>
	import("./pages/dashboard/functionPage/admin/AdminManage.tsx").then(
		(module) => ({
			default: module.AdminManage,
		})
	)
);

const StallAvailabilityPage = lazy(() =>
	import("./pages/dashboard/functionPage/admin/StallAvailabilityPage.tsx").then(
		(module) => ({
			default: module.StallAvailabilityPage,
		})
	)
);

const AdminDashboard = lazy(() =>
	import("./pages/dashboard/functionPage/admin/AdminDashboard.tsx").then(
		(module) => ({
			default: module.AdminDashboard,
		})
	)
);

const queryClient = new QueryClient();

const router = createBrowserRouter(
	[
		{
			path: "/",
			element: <App />,
			errorElement: <NotFoundPage />,
		},
		{
			path: "/signup",
			element: <SignUpPage />,
		},
		{
			path: "/forget-password",
			element: <ForgetPasswordPage />,
		},
		{
			path: "/reset-password",
			element: <ResetPasswordPage />,
		},
		{
			path: "/email-verified",
			element: <EmailVerifiedPage />,
		},
		{
			path: "/dashboard",
			element: <DashboardLayoutPage authClient={authClient} />,
			children: [
				{
					path: "/dashboard/feedback",
					element: <FeedbackDisplayPage />,
				},
				{
					path: "/dashboard/change-password",
					element: <ChangePasswordPage />,
				},
				{
					path: "/dashboard/monthly-rent-overview",
					element: <DashboardLayoutPage authClient={authClient} />,
				},
				{
					path: "/dashboard/account",
					element: <UserProfilePage authClient={authClient} />,
				},
				{
					path: "/dashboard/admin",
					element: <AdminManage />,
				},
				{
					path: "/dashboard/tenant-information",
					element: <TenantInformationPage />,
				},
				{
					path: "/dashboard/stall-availability",
					element: <StallAvailabilityPage />,
				},
				{
					path: "/dashboard/admin-dashboard",
					element: <AdminDashboard />,
				},
			],
		},
	],
	{
		future: {
			v7_relativeSplatPath: true, // Enables relative paths in nested routes
			v7_fetcherPersist: true, // Retains fetcher state during navigation
			v7_normalizeFormMethod: true, // Normalizes form methods (e.g., POST or GET)
			v7_partialHydration: true, // Supports partial hydration for server-side rendering
			v7_skipActionErrorRevalidation: true, // Prevents revalidation when action errors occur
		},
	}
);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<RouterProvider router={router} future={{ v7_startTransition: true }} />
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>
);
