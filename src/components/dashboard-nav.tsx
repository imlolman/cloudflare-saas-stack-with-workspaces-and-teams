"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Home, Users, Settings } from "lucide-react";
import { createWorkspace } from "@/server/actions/workspace";
import { useState } from "react";

interface Workspace {
	id: string;
	name: string;
	slug: string;
	role: string;
}

interface DashboardNavProps {
	workspaces: Workspace[];
}

export function DashboardNav({ workspaces }: DashboardNavProps) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentWorkspaceId = searchParams.get("workspace") || workspaces[0]?.id;
	const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

	function handleSelectWorkspace(workspaceId: string) {
		const newParams = new URLSearchParams(searchParams.toString());
		newParams.set("workspace", workspaceId);
		router.push(`${pathname}?${newParams.toString()}`);
	}

	async function handleCreateWorkspace() {
		const name = prompt("Enter workspace name:");
		if (!name) return;

		setIsCreatingWorkspace(true);
		const result = await createWorkspace(name);

		if (result.success && result.workspaceId) {
			const newParams = new URLSearchParams(searchParams.toString());
			newParams.set("workspace", result.workspaceId);
			router.push(`${pathname}?${newParams.toString()}`);
		} else {
			alert(result.error || "Failed to create workspace");
		}
		setIsCreatingWorkspace(false);
	}

	const navItems = [
		{
			href: "/dashboard",
			label: "Overview",
			icon: Home,
		},
		{
			href: "/dashboard/team",
			label: "Team",
			icon: Users,
		},
		{
			href: "/dashboard/settings",
			label: "Settings",
			icon: Settings,
		},
	];

	return (
		<nav className="space-y-6">
			<div>
				<p className="mb-2 text-xs font-semibold uppercase text-gray-500">Workspace</p>
				<WorkspaceSwitcher
					workspaces={workspaces}
					currentWorkspaceId={currentWorkspaceId}
					onSelectWorkspace={handleSelectWorkspace}
					onCreateWorkspace={handleCreateWorkspace}
				/>
			</div>

			<div>
				<p className="mb-2 text-xs font-semibold uppercase text-gray-500">Navigation</p>
				<div className="space-y-1">
					{navItems.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;
						const params = currentWorkspaceId ? `?workspace=${currentWorkspaceId}` : "";

						return (
							<Link
								key={item.href}
								href={`${item.href}${params}`}
								className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
									isActive
										? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white"
										: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
								}`}
							>
								<Icon className="h-5 w-5" />
								{item.label}
							</Link>
						);
					})}
				</div>
			</div>
		</nav>
	);
}
