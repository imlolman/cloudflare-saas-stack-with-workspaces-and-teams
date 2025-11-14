import { auth } from "@/server/auth";
import { getWorkspaces, getWorkspace, updateWorkspaceAccess } from "@/server/actions/workspace";
import { redirect } from "next/navigation";
import { SettingsPageClient } from "@/components/settings-page-client";

export const runtime = "edge";

interface PageProps {
	searchParams: { workspace?: string };
}

export default async function SettingsPage({ searchParams }: PageProps) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const workspaces = await getWorkspaces();

	if (workspaces.length === 0) {
		redirect("/dashboard");
	}

	const currentWorkspaceId = searchParams.workspace || workspaces[0]?.id;
	const currentWorkspace = await getWorkspace(currentWorkspaceId);

	if (!currentWorkspace) {
		redirect(`/dashboard?workspace=${workspaces[0]?.id}`);
	}

	// Update the lastAccessedAt timestamp for the current workspace
	await updateWorkspaceAccess(currentWorkspaceId);

	const isOwner = currentWorkspace.role === "owner";

	return (
		<SettingsPageClient
			workspace={currentWorkspace}
			isOwner={isOwner}
			hasMultipleWorkspaces={workspaces.length > 1}
		/>
	);
}
