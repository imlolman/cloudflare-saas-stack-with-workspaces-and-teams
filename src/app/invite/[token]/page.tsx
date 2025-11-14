import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { acceptInvite } from "@/server/actions/workspace";
import { db } from "@/server/db";
import { workspaceInvites, workspaces } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { InvitePageClient } from "@/components/invite-page-client";

export const runtime = "edge";

interface PageProps {
	params: { token: string };
}

export default async function InvitePage({ params }: PageProps) {
	const session = await auth();

	if (!session?.user) {
		redirect(`/login?callbackUrl=/invite/${params.token}`);
	}

	// Fetch invite details
	const [invite] = await db
		.select({
			id: workspaceInvites.id,
			token: workspaceInvites.token,
			workspaceId: workspaceInvites.workspaceId,
			expiresAt: workspaceInvites.expiresAt,
			workspaceName: workspaces.name,
		})
		.from(workspaceInvites)
		.innerJoin(workspaces, eq(workspaceInvites.workspaceId, workspaces.id))
		.where(eq(workspaceInvites.token, params.token));

	if (!invite) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center">
				<div className="max-w-md text-center">
					<div className="mb-4 text-6xl">❌</div>
					<h1 className="mb-2 text-2xl font-bold">Invalid Invite</h1>
					<p className="mb-6 text-gray-600 dark:text-gray-400">
						This invite link is invalid or has been revoked.
					</p>
					<a href="/dashboard" className="text-blue-600 hover:underline">
						Go to Dashboard
					</a>
				</div>
			</div>
		);
	}

	const isExpired = new Date(invite.expiresAt) < new Date();

	if (isExpired) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center">
				<div className="max-w-md text-center">
					<div className="mb-4 text-6xl">⏰</div>
					<h1 className="mb-2 text-2xl font-bold">Invite Expired</h1>
					<p className="mb-6 text-gray-600 dark:text-gray-400">
						This invite link has expired. Please request a new invite from the workspace owner.
					</p>
					<a href="/dashboard" className="text-blue-600 hover:underline">
						Go to Dashboard
					</a>
				</div>
			</div>
		);
	}

	return (
		<InvitePageClient
			token={params.token}
			workspaceName={invite.workspaceName}
			userName={session.user.name || "User"}
		/>
	);
}
