"use client";

import { Button } from "@/components/ui/button";
import { Copy, Trash2, Check } from "lucide-react";
import { revokeInvite } from "@/server/actions/workspace";
import { useState } from "react";

interface Invite {
	id: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
}

interface InviteLinkCardProps {
	invite: Invite;
	baseUrl: string;
}

export function InviteLinkCard({ invite, baseUrl }: InviteLinkCardProps) {
	const [copied, setCopied] = useState(false);
	const [isRevoking, setIsRevoking] = useState(false);

	const inviteUrl = `${baseUrl}/invite/${invite.token}`;
	const expiresAt = new Date(invite.expiresAt);
	const isExpired = expiresAt < new Date();

	async function handleCopy() {
		await navigator.clipboard.writeText(inviteUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	async function handleRevoke() {
		if (!confirm("Are you sure you want to revoke this invite link?")) return;

		setIsRevoking(true);
		const result = await revokeInvite(invite.id);

		if (!result.success) {
			alert(result.error || "Failed to revoke invite");
		}
		setIsRevoking(false);
	}

	return (
		<div className="flex items-center justify-between p-4 border rounded-lg">
			<div className="flex-1 min-w-0 mr-4">
				<p className="text-sm font-mono truncate text-gray-600 dark:text-gray-400">
					{inviteUrl}
				</p>
				<p className="text-xs text-gray-500 mt-1">
					{isExpired ? (
						<span className="text-red-500">Expired</span>
					) : (
						`Expires ${expiresAt.toLocaleDateString()}`
					)}
				</p>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					onClick={handleCopy}
					disabled={isExpired}
				>
					{copied ? (
						<Check className="h-4 w-4 text-green-500" />
					) : (
						<Copy className="h-4 w-4" />
					)}
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onClick={handleRevoke}
					disabled={isRevoking}
				>
					<Trash2 className="h-4 w-4 text-red-500" />
				</Button>
			</div>
		</div>
	);
}

