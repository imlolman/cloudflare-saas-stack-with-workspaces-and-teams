"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { updateWorkspace, deleteWorkspace, leaveWorkspace } from "@/server/actions/workspace";
import { Settings, Trash2, LogOut, Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Workspace {
	id: string;
	name: string;
	slug: string;
	role: string;
}

interface SettingsPageClientProps {
	workspace: Workspace;
	isOwner: boolean;
	hasMultipleWorkspaces: boolean;
}

export function SettingsPageClient({
	workspace,
	isOwner,
	hasMultipleWorkspaces,
}: SettingsPageClientProps) {
	const [workspaceName, setWorkspaceName] = useState(workspace.name);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLeaving, setIsLeaving] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showLeaveDialog, setShowLeaveDialog] = useState(false);
	const router = useRouter();

	async function handleUpdateWorkspace(e: React.FormEvent) {
		e.preventDefault();

		if (!workspaceName.trim()) {
			alert("Workspace name cannot be empty");
			return;
		}

		setIsUpdating(true);
		const result = await updateWorkspace(workspace.id, workspaceName.trim());

		if (result.success) {
			alert("Workspace updated successfully");
		} else {
			alert(result.error || "Failed to update workspace");
		}
		setIsUpdating(false);
	}

	async function handleDeleteWorkspace() {
		setIsDeleting(true);
		const result = await deleteWorkspace(workspace.id);

		if (result.success) {
			router.push("/dashboard");
			router.refresh();
		} else {
			alert(result.error || "Failed to delete workspace");
			setIsDeleting(false);
		}
	}

	async function handleLeaveWorkspace() {
		setIsLeaving(true);
		const result = await leaveWorkspace(workspace.id);

		if (result.success) {
			router.push("/dashboard");
			router.refresh();
		} else {
			alert(result.error || "Failed to leave workspace");
			setIsLeaving(false);
		}
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="mb-2 text-3xl font-bold">Workspace Settings</h1>
				<p className="text-gray-600 dark:text-gray-400">Manage settings for {workspace.name}</p>
			</div>

			{/* General Settings */}
			<div className="rounded-lg border p-6">
				<div className="mb-4 flex items-center gap-2">
					<Settings className="h-5 w-5" />
					<h2 className="text-xl font-semibold">General</h2>
				</div>

				<form onSubmit={handleUpdateWorkspace} className="space-y-4">
					<div>
						<label htmlFor="workspace-name" className="mb-2 block text-sm font-medium">
							Workspace Name
						</label>
						<input
							id="workspace-name"
							type="text"
							value={workspaceName}
							onChange={(e) => setWorkspaceName(e.target.value)}
							disabled={!isOwner}
							className="w-full rounded-lg border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-950"
						/>
						<p className="mt-1 text-sm text-gray-500">Slug: {workspace.slug}</p>
					</div>

					{isOwner && (
						<Button type="submit" disabled={isUpdating}>
							<Save className="mr-2 h-4 w-4" />
							{isUpdating ? "Saving..." : "Save Changes"}
						</Button>
					)}

					{!isOwner && (
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Only workspace owners can edit these settings.
						</p>
					)}
				</form>
			</div>

			{/* Danger Zone */}
			<div className="rounded-lg border border-red-200 p-6 dark:border-red-800">
				<h2 className="mb-4 text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>

				<div className="space-y-4">
					{isOwner ? (
						<div className="flex items-center justify-between rounded-lg border border-red-200 p-4 dark:border-red-800">
							<div>
								<h3 className="mb-1 font-medium">Delete Workspace</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Permanently delete this workspace and all its data. This action cannot be undone.
								</p>
							</div>
							<Button
								variant="destructive"
								onClick={() => setShowDeleteDialog(true)}
								disabled={isDeleting}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								{isDeleting ? "Deleting..." : "Delete"}
							</Button>
						</div>
					) : (
						<div className="flex items-center justify-between rounded-lg border border-red-200 p-4 dark:border-red-800">
							<div>
								<h3 className="mb-1 font-medium">Leave Workspace</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Remove yourself from this workspace. You'll need a new invite to rejoin.
								</p>
							</div>
							<Button
								variant="destructive"
								onClick={() => setShowLeaveDialog(true)}
								disabled={isLeaving || !hasMultipleWorkspaces}
							>
								<LogOut className="mr-2 h-4 w-4" />
								{isLeaving ? "Leaving..." : "Leave"}
							</Button>
						</div>
					)}

					{!isOwner && !hasMultipleWorkspaces && (
						<p className="text-sm text-gray-600 dark:text-gray-400">
							You cannot leave this workspace as it's your only workspace. Create or join another
							workspace first.
						</p>
					)}
				</div>
			</div>

			{/* Confirmation Dialogs */}
			<ConfirmDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={handleDeleteWorkspace}
				title="Delete Workspace"
				description={`Are you sure you want to delete "${workspace.name}"? This action cannot be undone and all data will be permanently lost.`}
				confirmText="Delete Workspace"
				variant="destructive"
			/>

			<ConfirmDialog
				isOpen={showLeaveDialog}
				onClose={() => setShowLeaveDialog(false)}
				onConfirm={handleLeaveWorkspace}
				title="Leave Workspace"
				description={`Are you sure you want to leave "${workspace.name}"? You'll need a new invite to rejoin.`}
				confirmText="Leave Workspace"
				variant="destructive"
			/>
		</div>
	);
}
