"use client";

import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/server/actions/workspace";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, Building2 } from "lucide-react";

interface InvitePageClientProps {
	token: string;
	workspaceName: string;
	userName: string;
}

export function InvitePageClient({ token, workspaceName, userName }: InvitePageClientProps) {
	const [isAccepting, setIsAccepting] = useState(false);
	const router = useRouter();

	async function handleAcceptInvite() {
		setIsAccepting(true);
		const result = await acceptInvite(token);

		if (result.success) {
			router.push("/dashboard");
			router.refresh();
		} else {
			alert(result.error || "Failed to accept invite");
			setIsAccepting(false);
		}
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			<div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-xl dark:bg-gray-950">
				<div className="mb-8 flex flex-col items-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
						<Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
						You're Invited!
					</h1>
					<p className="text-center text-gray-600 dark:text-gray-400">
						You've been invited to join
					</p>
					<p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
						{workspaceName}
					</p>
				</div>

				<div className="mb-6 space-y-4">
					<div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
						<p className="mb-2 text-sm text-gray-600 dark:text-gray-400">You'll be joining as:</p>
						<p className="font-medium text-gray-900 dark:text-white">{userName}</p>
					</div>

					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
						<p className="text-sm text-blue-900 dark:text-blue-100">
							<strong>What happens next?</strong>
							<br />
							You'll be added as a member to this workspace and will be able to collaborate with the
							team.
						</p>
					</div>
				</div>

				<Button className="w-full" size="lg" onClick={handleAcceptInvite} disabled={isAccepting}>
					<UserPlus className="mr-2 h-5 w-5" />
					{isAccepting ? "Joining..." : "Accept Invitation"}
				</Button>

				<div className="mt-6 text-center">
					<a href="/dashboard" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
						Go to Dashboard
					</a>
				</div>
			</div>
		</div>
	);
}
