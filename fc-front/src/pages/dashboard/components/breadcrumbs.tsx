import { NavLink, useLocation } from "react-router-dom";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import React from "react";

export default function Breadcrumbs() {
	const location = useLocation();

	const crumbNameMap: { [key: string]: string } = {
		dashboard: "Dashboard",
		"change-password": "Change Password",
		feedback: "Feedback",
	};

	let currentLink = "";
	const pathnames = location.pathname.split("/").filter((x) => x);

	const crumbs = pathnames.map((crumb, index) => {
		currentLink += `/${crumb}`;
		const isLast = index === pathnames.length - 1;
		const crumbName = crumbNameMap[crumb] || crumb;

		return (
			<React.Fragment key={crumb}>
				<BreadcrumbItem className="hidden md:block">
					{isLast ? (
						<BreadcrumbPage>{crumbName}</BreadcrumbPage>
					) : (
						<BreadcrumbLink asChild>
							<NavLink to={currentLink}>{crumbName}</NavLink>
						</BreadcrumbLink>
					)}
				</BreadcrumbItem>
				{!isLast && (
					<BreadcrumbSeparator
						className="hidden md:block"
						key={`separator-${index}`}
					/>
				)}
			</React.Fragment>
		);
	});

	if (crumbs.length > 3) {
		const firstCrumb = crumbs[0];
		const lastCrumb = crumbs[crumbs.length - 1];
		const ellipsis = (
			<BreadcrumbItem key="ellipsis">
				<BreadcrumbEllipsis />
			</BreadcrumbItem>
		);

		return (
			<Breadcrumb>
				<BreadcrumbList>
					{firstCrumb}
					{ellipsis}
					{lastCrumb}
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>{crumbs}</BreadcrumbList>
		</Breadcrumb>
	);
}
