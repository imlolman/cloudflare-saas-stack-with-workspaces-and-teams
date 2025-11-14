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
	const baseUrl =
		typeof window !== "undefined" ? window.location.origin : "";

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
				<h1 className="text-3xl font-bold mb-2">Team Management</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Manage members and invitations for {workspace.name}
				</p>
			</div>

			{/* Members Section */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						<h2 className="text-xl font-semibold">
							Team Members ({members.length})
						</h2>
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
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<LinkIcon className="h-5 w-5" />
							<h2 className="text-xl font-semibold">
								Invite Links ({invites.length})
							</h2>
						</div>
						<Button onClick={handleGenerateInvite} disabled={isGenerating}>
							{isGenerating ? "Generating..." : "Generate Invite Link"}
						</Button>
					</div>

					{invites.length > 0 ? (
						<div className="space-y-3">
							{invites.map((invite) => (
								<InviteLinkCard
									key={invite.id}
									invite={invite}
									baseUrl={baseUrl}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-8 border border-dashed rounded-lg">
							<LinkIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								No active invite links
							</p>
							<Button onClick={handleGenerateInvite} disabled={isGenerating}>
								{isGenerating ? "Generating..." : "Create Your First Invite"}
							</Button>
						</div>
					)}
				</div>
			)}

			{!isOwner && (
				<div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Only workspace owners can generate invite links and remove members.
					</p>
				</div>
			)}
		</div>
	);
}

