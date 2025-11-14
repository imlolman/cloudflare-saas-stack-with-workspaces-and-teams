"use client";

import { Button } from "@/components/ui/button";
import { MemberList } from "@/components/member-list";
import { InviteLinkCard } from "@/components/invite-link-card";
import { Users, Link as LinkIcon } from "lucide-react";
import { generateInviteLink } from "@/server/actions/workspace";
import { useState } from "react";

interface Member {
	userId: string;
	role: string;
	user?: {
		id: string;
		name: string | null;
		email: string | null;
		image: string | null;
	};
}

interface Invite {
	id: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
}

interface Workspace {
	id: string;
	name: string;
	slug: string;
	role: string;
}

interface TeamPageClientProps {
	workspace: Workspace;
	members: Member[];
	invites: Invite[];
	currentUserId: string;
	isOwner: boolean;
}

export function TeamPageClient({
	workspace,
	members,
	invites,
	currentUserId,
	isOwner,
}: TeamPageClientProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

	async function handleGenerateInvite() {
		setIsGenerating(true);
		const result = await generateInviteLink(workspace.id);

		if (!result.success) {
			alert(result.error || "Failed to generate invite link");
		}
		setIsGenerating(false);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="mb-2 text-3xl font-bold">Team Management</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Manage members and invitations for {workspace.name}
				</p>
			</div>

			{/* Members Section */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						<h2 className="text-xl font-semibold">Team Members ({members.length})</h2>
					</div>
				</div>

				<MemberList
					members={members}
					currentUserId={currentUserId}
					isOwner={isOwner}
					workspaceId={workspace.id}
				/>
			</div>

			{/* Invite Links Section */}
			{isOwner && (
				<div>
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<LinkIcon className="h-5 w-5" />
							<h2 className="text-xl font-semibold">Invite Links ({invites.length})</h2>
						</div>
						<Button onClick={handleGenerateInvite} disabled={isGenerating}>
							{isGenerating ? "Generating..." : "Generate Invite Link"}
						</Button>
					</div>

					{invites.length > 0 ? (
						<div className="space-y-3">
							{invites.map((invite) => (
								<InviteLinkCard key={invite.id} invite={invite} baseUrl={baseUrl} />
							))}
						</div>
					) : (
						<div className="rounded-lg border border-dashed py-8 text-center">
							<LinkIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
							<p className="mb-4 text-gray-600 dark:text-gray-400">No active invite links</p>
							<Button onClick={handleGenerateInvite} disabled={isGenerating}>
								{isGenerating ? "Generating..." : "Create Your First Invite"}
							</Button>
						</div>
					)}
				</div>
			)}

			{!isOwner && (
				<div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Only workspace owners can generate invite links and remove members.
					</p>
				</div>
			)}
		</div>
	);
}
