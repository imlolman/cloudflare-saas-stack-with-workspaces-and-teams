import { auth, signOut } from "@/server/auth";
import { redirect } from "next/navigation";
import { getWorkspaces } from "@/server/actions/workspace";
import { DashboardNav } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getProxiedImageUrl, getUserInitials } from "@/lib/utils/get-proxied-image";

export const runtime = "edge";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const workspaces = await getWorkspaces();

	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}
			<aside className="flex w-64 flex-col border-r bg-gray-50 dark:bg-gray-900">
				<div className="p-6">
					<div className="mb-6 flex items-center gap-2">
						<svg
							viewBox="0 0 256 116"
							xmlns="http://www.w3.org/2000/svg"
							width="30px"
							height="30px"
							preserveAspectRatio="xMidYMid"
							role="img"
							aria-label="Cloudflare logo"
						>
							<path
								fill="currentColor"
								d="m202.357 49.394-5.311-2.124C172.085 103.434 72.786 69.289 66.81 85.997c-.996 11.286 54.227 2.146 93.706 4.059 12.039.583 18.076 9.671 12.964 24.484l10.069.031c11.615-36.209 48.683-17.73 50.232-29.68-2.545-7.857-42.601 0-31.425-35.497Z"
							/>
							<path
								fill="#F4811F"
								d="M176.332 108.348c1.593-5.31 1.062-10.622-1.593-13.809-2.656-3.187-6.374-5.31-11.154-5.842L71.17 87.634c-.531 0-1.062-.53-1.593-.53-.531-.532-.531-1.063 0-1.594.531-1.062 1.062-1.594 2.124-1.594l92.946-1.062c11.154-.53 22.839-9.56 27.087-20.182l5.312-13.809c0-.532.531-1.063 0-1.594C191.203 20.182 166.772 0 138.091 0 111.535 0 88.697 16.995 80.73 40.896c-5.311-3.718-11.684-5.843-19.12-5.31-12.747 1.061-22.838 11.683-24.432 24.43-.531 3.187 0 6.374.532 9.56C16.996 70.107 0 87.103 0 108.348c0 2.124 0 3.718.531 5.842 0 1.063 1.062 1.594 1.594 1.594h170.489c1.062 0 2.125-.53 2.125-1.594l1.593-5.842Z"
							/>
							<path
								fill="#FAAD3F"
								d="M205.544 48.863h-2.656c-.531 0-1.062.53-1.593 1.062l-3.718 12.747c-1.593 5.31-1.062 10.623 1.594 13.809 2.655 3.187 6.373 5.31 11.153 5.843l19.652 1.062c.53 0 1.062.53 1.593.53.53.532.53 1.063 0 1.594-.531 1.063-1.062 1.594-2.125 1.594l-20.182 1.062c-11.154.53-22.838 9.56-27.087 20.182l-1.063 4.78c-.531.532 0 1.594 1.063 1.594h70.108c1.062 0 1.593-.531 1.593-1.593 1.062-4.25 2.124-9.03 2.124-13.81 0-27.618-22.838-50.456-50.456-50.456"
							/>
						</svg>
						<span className="font-semibold">SaaS Stack</span>
					</div>

					<DashboardNav workspaces={workspaces} />
				</div>

				{/* User profile section at bottom */}
				<div className="mt-auto border-t p-4">
					<div className="mb-3 flex items-center gap-3">
						{getProxiedImageUrl(session.user.id) ? (
							<img
								src={getProxiedImageUrl(session.user.id)!}
								alt={session.user.name || "User"}
								className="h-10 w-10 rounded-full"
							/>
						) : (
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
								<span className="text-lg font-medium">{getUserInitials(session.user.name)}</span>
							</div>
						)}
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{session.user.name}</p>
							<p className="truncate text-xs text-gray-500">{session.user.email}</p>
						</div>
					</div>
					<form
						action={async () => {
							"use server";
							await signOut({ redirectTo: "/login" });
						}}
					>
						<Button variant="outline" size="sm" className="w-full">
							<LogOut className="mr-2 h-4 w-4" />
							Sign Out
						</Button>
					</form>
				</div>
			</aside>

			{/* Main content */}
			<main className="flex-1 overflow-auto">
				<div className="container mx-auto p-8">{children}</div>
			</main>
		</div>
	);
}
