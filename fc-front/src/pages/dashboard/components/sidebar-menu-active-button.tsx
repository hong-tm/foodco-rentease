import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export default function SidebarMenuActiveButton({
	href,
	icon,
	title,
}: {
	href: string;
	icon: React.ReactNode;
	title: string;
}) {
	const pathName = location.pathname;
	const isActive = pathName === href;

	return (
		<SidebarMenuButton asChild isActive={isActive}>
			<Link to={href}>
				{icon}
				<span>{title}</span>
			</Link>
		</SidebarMenuButton>
	);
}
