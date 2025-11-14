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
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<Building2 className="h-16 w-16 text-gray-400 mb-4" />
				<h1 className="text-2xl font-bold mb-2">No Workspaces Found</h1>
				<p className="text-gray-600 dark:text-gray-400 mb-4">
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
				<h1 className="text-3xl font-bold mb-2">
					Welcome back, {session.user.name}!
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Here's what's happening with your workspace today.
				</p>
			</div>

			{/* Current Workspace Info */}
			<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center gap-2 mb-2">
							<Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							<h2 className="text-xl font-semibold">
								{currentWorkspace.name}
							</h2>
						</div>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Your role:{" "}
							<span className="font-medium capitalize">
								{currentWorkspace.role}
							</span>
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Created:{" "}
							{new Date(currentWorkspace.createdAt).toLocaleDateString()}
						</p>
					</div>
					<div className="flex gap-2">
						<Link
							href={`/dashboard/team?workspace=${currentWorkspaceId}`}
							className="px-4 py-2 bg-white dark:bg-gray-900 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						>
							<Users className="inline h-4 w-4 mr-2" />
							Manage Team
						</Link>
					</div>
				</div>
			</div>

			{/* All Workspaces */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Your Workspaces</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{workspaces.map((workspace) => (
						<Link
							key={workspace.id}
							href={`/dashboard?workspace=${workspace.id}`}
							className={`p-5 border rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors ${
								workspace.id === currentWorkspaceId
									? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20"
									: "bg-white dark:bg-gray-900"
							}`}
						>
							<div className="flex items-start justify-between mb-3">
								<Building2
									className={`h-8 w-8 ${
										workspace.id === currentWorkspaceId
											? "text-blue-600 dark:text-blue-400"
											: "text-gray-400"
									}`}
								/>
								<span
									className={`px-2 py-1 text-xs rounded-full ${
										workspace.role === "owner"
											? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
											: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
									}`}
								>
									{workspace.role}
								</span>
							</div>
							<h3 className="font-semibold mb-1">{workspace.name}</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{workspace.slug}
							</p>
						</Link>
					))}
				</div>
			</div>

			{/* Quick Actions */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Link
						href={`/dashboard/team?workspace=${currentWorkspaceId}`}
						className="p-5 border rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
					>
						<Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
						<h3 className="font-semibold mb-1">Invite Team Members</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Add people to your workspace
						</p>
					</Link>

					<Link
						href={`/dashboard/settings?workspace=${currentWorkspaceId}`}
						className="p-5 border rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
					>
						<Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
						<h3 className="font-semibold mb-1">Workspace Settings</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Manage your workspace
						</p>
					</Link>

					<div className="p-5 border border-dashed rounded-lg flex items-center justify-center text-gray-400">
						<div className="text-center">
							<Calendar className="h-8 w-8 mx-auto mb-2" />
							<p className="text-sm">More features coming soon</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

