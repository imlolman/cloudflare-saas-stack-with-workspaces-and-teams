import { auth } from "@/server/auth";
import { getWorkspaces, getWorkspace } from "@/server/actions/workspace";
import { redirect } from "next/navigation";
import { Building2, Users, Calendar } from "lucide-react";
import Link from "next/link";

export const runtime = "edge";

interface PageProps {
	searchParams: { workspace?: string };
}

export default async function DashboardPage({ searchParams }: PageProps) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const workspaces = await getWorkspaces();

	if (workspaces.length === 0) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center">
				<Building2 className="mb-4 h-16 w-16 text-gray-400" />
				<h1 className="mb-2 text-2xl font-bold">No Workspaces Found</h1>
				<p className="mb-4 text-gray-600 dark:text-gray-400">
					Get started by creating your first workspace
				</p>
			</div>
		);
	}

	const currentWorkspaceId = searchParams.workspace || workspaces[0]?.id;
	const currentWorkspace = await getWorkspace(currentWorkspaceId);

	if (!currentWorkspace) {
		redirect(`/dashboard?workspace=${workspaces[0]?.id}`);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="mb-2 text-3xl font-bold">Welcome back, {session.user.name}!</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Here's what's happening with your workspace today.
				</p>
			</div>

			{/* Current Workspace Info */}
			<div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
				<div className="flex items-start justify-between">
					<div>
						<div className="mb-2 flex items-center gap-2">
							<Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							<h2 className="text-xl font-semibold">{currentWorkspace.name}</h2>
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Your role: <span className="font-medium capitalize">{currentWorkspace.role}</span>
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Created: {new Date(currentWorkspace.createdAt).toLocaleDateString()}
						</p>
					</div>
					<div className="flex gap-2">
						<Link
							href={`/dashboard/team?workspace=${currentWorkspaceId}`}
							className="rounded-lg border bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
						>
							<Users className="mr-2 inline h-4 w-4" />
							Manage Team
						</Link>
					</div>
				</div>
			</div>

			{/* All Workspaces */}
			<div>
				<h2 className="mb-4 text-xl font-semibold">Your Workspaces</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{workspaces.map((workspace) => (
						<Link
							key={workspace.id}
							href={`/dashboard?workspace=${workspace.id}`}
							className={`rounded-lg border p-5 transition-colors hover:border-blue-500 dark:hover:border-blue-400 ${
								workspace.id === currentWorkspaceId
									? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20"
									: "bg-white dark:bg-gray-900"
							}`}
						>
							<div className="mb-3 flex items-start justify-between">
								<Building2
									className={`h-8 w-8 ${
										workspace.id === currentWorkspaceId
											? "text-blue-600 dark:text-blue-400"
											: "text-gray-400"
									}`}
								/>
								<span
									className={`rounded-full px-2 py-1 text-xs ${
										workspace.role === "owner"
											? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
											: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
									}`}
								>
									{workspace.role}
								</span>
							</div>
							<h3 className="mb-1 font-semibold">{workspace.name}</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">{workspace.slug}</p>
						</Link>
					))}
				</div>
			</div>

			{/* Quick Actions */}
			<div>
				<h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<Link
						href={`/dashboard/team?workspace=${currentWorkspaceId}`}
						className="rounded-lg border p-5 transition-colors hover:border-blue-500 dark:hover:border-blue-400"
					>
						<Users className="mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
						<h3 className="mb-1 font-semibold">Invite Team Members</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">Add people to your workspace</p>
					</Link>

					<Link
						href={`/dashboard/settings?workspace=${currentWorkspaceId}`}
						className="rounded-lg border p-5 transition-colors hover:border-blue-500 dark:hover:border-blue-400"
					>
						<Building2 className="mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
						<h3 className="mb-1 font-semibold">Workspace Settings</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">Manage your workspace</p>
					</Link>

					<div className="flex items-center justify-center rounded-lg border border-dashed p-5 text-gray-400">
						<div className="text-center">
							<Calendar className="mx-auto mb-2 h-8 w-8" />
							<p className="text-sm">More features coming soon</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
