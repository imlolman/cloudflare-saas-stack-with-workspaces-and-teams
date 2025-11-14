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

export function MemberList({
	members,
	currentUserId,
	isOwner,
	workspaceId,
}: MemberListProps) {
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
					className="flex items-center justify-between p-4 border rounded-lg"
				>
					<div className="flex items-center gap-3">
						{getProxiedImageUrl(member.user?.image) ? (
							<img
								src={getProxiedImageUrl(member.user?.image)!}
								alt={member.user?.name || "User"}
								className="w-10 h-10 rounded-full"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
								<span className="text-lg font-medium">
									{getUserInitials(member.user?.name)}
								</span>
							</div>
						)}
						<div>
							<p className="font-medium">{member.user?.name || "Unknown"}</p>
							<p className="text-sm text-gray-500">{member.user?.email}</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{member.role === "owner" ? (
							<div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
								<Crown className="h-3 w-3" />
								Owner
							</div>
						) : (
							<span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
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

