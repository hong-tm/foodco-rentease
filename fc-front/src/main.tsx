import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import ForgetPassword from "./pages/(auth)/ForgetPassword.tsx";
import ResetPassword from "./pages/(auth)/ResetPassword.tsx";
import { DashboardPage } from "./pages/dashboard/dashboard-layout.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import App from "./App.tsx";
import RegisterPage from "./pages/(auth)/SignupForm.tsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EmailVerifiedPage from "./pages/(auth)/emailVerified.tsx";
import { FeedbackForm } from "./pages/feedback/feedback-from.tsx";
import ChangePassword from "./pages/(auth)/ChangePassword.tsx";

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
			element: <RegisterPage />,
		},
		{
			path: "/forget-password",
			element: <ForgetPassword />,
		},
		{
			path: "/reset-password",
			element: <ResetPassword />,
		},
		{
			path: "/email-verified",
			element: <EmailVerifiedPage />,
		},
		{
			path: "/dashboard",
			element: <DashboardPage />,
			children: [
				{
					path: "/dashboard/feedback",
					element: <FeedbackForm />,
				},
				{
					path: "/dashboard/change-password",
					element: <ChangePassword />,
				},
				{
					path: "/dashboard/monthly-rent-overview",
					element: <DashboardPage />,
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
