import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import RegisterPreview from "./pages/(auth)/SignupForm.tsx";
import ForgetPassword from "./pages/(auth)/ForgetPassword.tsx";
import ResetPassword from "./pages/(auth)/ResetPassword.tsx";
import { AdminMain } from "./pages/dashboard/admin/admin-main.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import App from "./App.tsx";
import { RentalMain } from "./pages/dashboard/rental/rental-main.tsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <NotFoundPage />,
	},
	{
		path: "/signup",
		element: <RegisterPreview />,
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
		path: "/dashboard-admin",
		element: <AdminMain />,
	},
	{
		path: "/dashboard-rental",
		element: <RentalMain />,
	},
	{
		path: "/dashboard-admin/monthly-rent-overview",
		element: <AdminMain />,
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
			<RouterProvider router={router} />
		</ThemeProvider>
	</StrictMode>
);
