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

export function InvitePageClient({
	token,
	workspaceName,
	userName,
}: InvitePageClientProps) {
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
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			<div className="w-full max-w-md px-8 py-10 bg-white dark:bg-gray-950 rounded-2xl shadow-xl">
				<div className="flex flex-col items-center mb-8">
					<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
						<Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
						You're Invited!
					</h1>
					<p className="text-gray-600 dark:text-gray-400 text-center">
						You've been invited to join
					</p>
					<p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
						{workspaceName}
					</p>
				</div>

				<div className="space-y-4 mb-6">
					<div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
							You'll be joining as:
						</p>
						<p className="font-medium text-gray-900 dark:text-white">
							{userName}
						</p>
					</div>

					<div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
						<p className="text-sm text-blue-900 dark:text-blue-100">
							<strong>What happens next?</strong>
							<br />
							You'll be added as a member to this workspace and will be able to
							collaborate with the team.
						</p>
					</div>
				</div>

				<Button
					className="w-full"
					size="lg"
					onClick={handleAcceptInvite}
					disabled={isAccepting}
				>
					<UserPlus className="mr-2 h-5 w-5" />
					{isAccepting ? "Joining..." : "Accept Invitation"}
				</Button>

				<div className="mt-6 text-center">
					<a
						href="/dashboard"
						className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
					>
						Go to Dashboard
					</a>
				</div>
			</div>
		</div>
	);
}

