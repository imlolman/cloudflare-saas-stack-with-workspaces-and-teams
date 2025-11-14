"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Crown } from "lucide-react";
import { removeMember } from "@/server/actions/workspace";
import { getProxiedImageUrl, getUserInitials } from "@/lib/utils/get-proxied-image";
import { useState } from "react";

interface Member {
	userId: string;
	role: string;
	user?: {
		name: string | null;
		email: string | null;
		image: string | null;
	};
}

interface MemberListProps {
	members: Member[];
	currentUserId: string;
	isOwner: boolean;
	workspaceId: string;
}

export function MemberList({ members, currentUserId, isOwner, workspaceId }: MemberListProps) {
	const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

	async function handleRemoveMember(userId: string) {
		if (!confirm("Are you sure you want to remove this member?")) return;

		setRemovingMemberId(userId);
		const result = await removeMember(workspaceId, userId);

		if (!result.success) {
			alert(result.error || "Failed to remove member");
		}
		setRemovingMemberId(null);
	}

	return (
		<div className="space-y-3">
			{members.map((member) => (
				<div
					key={member.userId}
					className="flex items-center justify-between rounded-lg border p-4"
				>
					<div className="flex items-center gap-3">
						{getProxiedImageUrl(member.userId) ? (
							<img
								src={getProxiedImageUrl(member.userId)!}
								alt={member.user?.name || "User"}
								className="h-10 w-10 rounded-full"
							/>
						) : (
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
								<span className="text-lg font-medium">{getUserInitials(member.user?.name)}</span>
							</div>
						)}
						<div>
							<p className="font-medium">{member.user?.name || "Unknown"}</p>
							<p className="text-sm text-gray-500">{member.user?.email}</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{member.role === "owner" ? (
							<div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
								<Crown className="h-3 w-3" />
								Owner
							</div>
						) : (
							<span className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
								Member
							</span>
						)}

						{isOwner && member.userId !== currentUserId && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => handleRemoveMember(member.userId)}
								disabled={removingMemberId === member.userId}
							>
								<Trash2 className="h-4 w-4 text-red-500" />
							</Button>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
