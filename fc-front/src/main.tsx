import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import RegisterPreview from "./pages/(auth)/SignupForm.tsx";
import ForgetPassword from "./pages/(auth)/ForgetPassword.tsx";
import ResetPassword from "./pages/(auth)/ResetPassword.tsx";
import { AdminMain } from "./pages/admin/AdminMain.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import App from "./App.tsx";

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
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
			<Toaster richColors />
			<RouterProvider router={router} />
		</ThemeProvider>
	</StrictMode>
);
