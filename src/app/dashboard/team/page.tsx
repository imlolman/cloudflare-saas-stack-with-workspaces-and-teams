import { auth } from "@/server/auth";
import {
	getWorkspaces,
	getWorkspace,
	getWorkspaceMembers,
	getActiveInvites,
	updateWorkspaceAccess,
} from "@/server/actions/workspace";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { inArray } from "drizzle-orm";
import { TeamPageClient } from "@/components/team-page-client";

export const runtime = "edge";

interface PageProps {
	searchParams: { workspace?: string };
}

export default async function TeamPage({ searchParams }: PageProps) {
	const session = await auth();

	if (!session?.user?.id) {
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

	const members = await getWorkspaceMembers(currentWorkspaceId);
	const invites = await getActiveInvites(currentWorkspaceId);

	// Fetch user details for all members
	const userIds = members.map((m) => m.userId);
	const userDetails = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			image: users.image,
		})
		.from(users)
		.where(inArray(users.id, userIds));

	// Combine member data with user details
	const membersWithDetails = members.map((member) => ({
		...member,
		user: userDetails.find((u) => u.id === member.userId),
	}));

	const isOwner = currentWorkspace.role === "owner";

	return (
		<TeamPageClient
			workspace={currentWorkspace}
			members={membersWithDetails}
			invites={invites}
			currentUserId={session.user.id}
			isOwner={isOwner}
		/>
	);
}
