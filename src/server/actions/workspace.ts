"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { workspaces, workspaceMembers, workspaceInvites } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface CreateWorkspaceResult {
	success: boolean;
	workspaceId?: string;
	error?: string;
}

interface UpdateWorkspaceResult {
	success: boolean;
	workspaceId?: string;
	error?: string;
}

interface InviteResult {
	success: boolean;
	token?: string;
	error?: string;
}

// Get all workspaces for the current user (ordered by most recently accessed)
export async function getWorkspaces() {
	const session = await auth();
	if (!session?.user?.id) return [];

	const userWorkspaces = await db
		.select({
			id: workspaces.id,
			name: workspaces.name,
			slug: workspaces.slug,
			ownerId: workspaces.ownerId,
			createdAt: workspaces.createdAt,
			role: workspaceMembers.role,
			lastAccessedAt: workspaceMembers.lastAccessedAt,
		})
		.from(workspaceMembers)
		.innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
		.where(eq(workspaceMembers.userId, session.user.id))
		.orderBy(workspaceMembers.lastAccessedAt);

	// Return in descending order (most recent first)
	return userWorkspaces.reverse();
}

// Get a single workspace by ID
export async function getWorkspace(workspaceId: string) {
	const session = await auth();
	if (!session?.user?.id) return null;

	const [workspace] = await db
		.select({
			id: workspaces.id,
			name: workspaces.name,
			slug: workspaces.slug,
			ownerId: workspaces.ownerId,
			createdAt: workspaces.createdAt,
			role: workspaceMembers.role,
		})
		.from(workspaceMembers)
		.innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
		.where(
			and(
				eq(workspaceMembers.workspaceId, workspaceId),
				eq(workspaceMembers.userId, session.user.id)
			)
		);

	return workspace || null;
}

// Get all members of a workspace
export async function getWorkspaceMembers(workspaceId: string) {
	const session = await auth();
	if (!session?.user?.id) return [];

	// Check if user is a member of this workspace
	const membership = await getWorkspace(workspaceId);
	if (!membership) return [];

	const members = await db
		.select()
		.from(workspaceMembers)
		.where(eq(workspaceMembers.workspaceId, workspaceId));

	return members;
}

// Create a new workspace
export async function createWorkspace(name: string): Promise<CreateWorkspaceResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

		const [workspace] = await db
			.insert(workspaces)
			.values({
				name,
				slug,
				ownerId: session.user.id,
			})
			.returning();

		if (!workspace) {
			return { success: false, error: "Failed to create workspace" };
		}

		// Add user as owner with current timestamp
		await db.insert(workspaceMembers).values({
			workspaceId: workspace.id,
			userId: session.user.id,
			role: "owner",
			lastAccessedAt: new Date(),
		});

		revalidatePath("/dashboard");
		return { success: true, workspaceId: workspace.id };
	} catch (error) {
		console.error("Error creating workspace:", error);
		return { success: false, error: "Failed to create workspace" };
	}
}

// Update workspace name
export async function updateWorkspace(
	workspaceId: string,
	name: string
): Promise<UpdateWorkspaceResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const workspace = await getWorkspace(workspaceId);
	if (!workspace || workspace.role !== "owner") {
		return { success: false, error: "Not authorized" };
	}

	try {
		await db
			.update(workspaces)
			.set({
				name,
				updatedAt: new Date(),
			})
			.where(eq(workspaces.id, workspaceId));

		revalidatePath("/dashboard");
		revalidatePath("/dashboard/settings");
		return { success: true };
	} catch (error) {
		console.error("Error updating workspace:", error);
		return { success: false, error: "Failed to update workspace" };
	}
}

// Delete workspace
export async function deleteWorkspace(workspaceId: string): Promise<UpdateWorkspaceResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const workspace = await getWorkspace(workspaceId);
	if (!workspace || workspace.role !== "owner") {
		return { success: false, error: "Not authorized" };
	}

	try {
		await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
		revalidatePath("/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Error deleting workspace:", error);
		return { success: false, error: "Failed to delete workspace" };
	}
}

// Leave workspace (for members, not owners)
export async function leaveWorkspace(workspaceId: string): Promise<UpdateWorkspaceResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const workspace = await getWorkspace(workspaceId);
	if (!workspace) {
		return { success: false, error: "Workspace not found" };
	}

	if (workspace.role === "owner") {
		return {
			success: false,
			error: "Owners cannot leave. Transfer ownership or delete the workspace.",
		};
	}

	try {
		await db
			.delete(workspaceMembers)
			.where(
				and(
					eq(workspaceMembers.workspaceId, workspaceId),
					eq(workspaceMembers.userId, session.user.id)
				)
			);

		revalidatePath("/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Error leaving workspace:", error);
		return { success: false, error: "Failed to leave workspace" };
	}
}

// Generate invite link
export async function generateInviteLink(workspaceId: string): Promise<InviteResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const workspace = await getWorkspace(workspaceId);
	if (!workspace || workspace.role !== "owner") {
		return { success: false, error: "Not authorized" };
	}

	try {
		const token = crypto.randomUUID();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

		await db.insert(workspaceInvites).values({
			workspaceId,
			token,
			expiresAt,
			createdById: session.user.id,
		});

		revalidatePath("/dashboard/team");
		return { success: true, token };
	} catch (error) {
		console.error("Error generating invite link:", error);
		return { success: false, error: "Failed to generate invite link" };
	}
}

// Get active invites for a workspace
export async function getActiveInvites(workspaceId: string) {
	const session = await auth();
	if (!session?.user?.id) return [];

	const workspace = await getWorkspace(workspaceId);
	if (!workspace) return [];

	const invites = await db
		.select()
		.from(workspaceInvites)
		.where(eq(workspaceInvites.workspaceId, workspaceId));

	// Filter out expired invites
	const now = new Date();
	return invites.filter((invite) => new Date(invite.expiresAt) > now);
}

// Revoke invite
export async function revokeInvite(inviteId: string): Promise<UpdateWorkspaceResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		// Get the invite to check workspace ownership
		const [invite] = await db
			.select()
			.from(workspaceInvites)
			.where(eq(workspaceInvites.id, inviteId));

		if (!invite) {
			return { success: false, error: "Invite not found" };
		}

		const workspace = await getWorkspace(invite.workspaceId);
		if (!workspace || workspace.role !== "owner") {
			return { success: false, error: "Not authorized" };
		}

		await db.delete(workspaceInvites).where(eq(workspaceInvites.id, inviteId));
		revalidatePath("/dashboard/team");
		return { success: true };
	} catch (error) {
		console.error("Error revoking invite:", error);
		return { success: false, error: "Failed to revoke invite" };
	}
}

// Accept invite
export async function acceptInvite(token: string): Promise<UpdateWorkspaceResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		const [invite] = await db
			.select()
			.from(workspaceInvites)
			.where(eq(workspaceInvites.token, token));

		if (!invite) {
			return { success: false, error: "Invalid invite link" };
		}

		if (new Date(invite.expiresAt) < new Date()) {
			return { success: false, error: "Invite link has expired" };
		}

		// Check if user is already a member
		const [existingMember] = await db
			.select()
			.from(workspaceMembers)
			.where(
				and(
					eq(workspaceMembers.workspaceId, invite.workspaceId),
					eq(workspaceMembers.userId, session.user.id)
				)
			);

		if (existingMember) {
			// Update lastAccessedAt if already a member
			await db
				.update(workspaceMembers)
				.set({ lastAccessedAt: new Date() })
				.where(
					and(
						eq(workspaceMembers.workspaceId, invite.workspaceId),
						eq(workspaceMembers.userId, session.user.id)
					)
				);
			return { success: true, workspaceId: invite.workspaceId };
		}

		// Add user as member with current timestamp as lastAccessedAt
		await db.insert(workspaceMembers).values({
			workspaceId: invite.workspaceId,
			userId: session.user.id,
			role: "member",
			lastAccessedAt: new Date(),
		});

		// Delete the invite after use
		await db.delete(workspaceInvites).where(eq(workspaceInvites.token, token));

		revalidatePath("/dashboard");
		return { success: true, workspaceId: invite.workspaceId };
	} catch (error) {
		console.error("Error accepting invite:", error);
		return { success: false, error: "Failed to accept invite" };
	}
}

// Update workspace access timestamp (called when user switches to a workspace)
export async function updateWorkspaceAccess(workspaceId: string): Promise<UpdateWorkspaceResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	try {
		// Verify user is a member of this workspace
		const workspace = await getWorkspace(workspaceId);
		if (!workspace) {
			return { success: false, error: "Workspace not found or access denied" };
		}

		// Update lastAccessedAt timestamp
		await db
			.update(workspaceMembers)
			.set({ lastAccessedAt: new Date() })
			.where(
				and(
					eq(workspaceMembers.workspaceId, workspaceId),
					eq(workspaceMembers.userId, session.user.id)
				)
			);

		return { success: true };
	} catch (error) {
		console.error("Error updating workspace access:", error);
		return { success: false, error: "Failed to update workspace access" };
	}
}

// Remove member from workspace
export async function removeMember(
	workspaceId: string,
	userId: string
): Promise<UpdateWorkspaceResult> {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Not authenticated" };
	}

	const workspace = await getWorkspace(workspaceId);
	if (!workspace || workspace.role !== "owner") {
		return { success: false, error: "Not authorized" };
	}

	if (userId === session.user.id) {
		return { success: false, error: "Cannot remove yourself. Use leave workspace instead." };
	}

	try {
		await db
			.delete(workspaceMembers)
			.where(
				and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId))
			);

		revalidatePath("/dashboard/team");
		return { success: true };
	} catch (error) {
		console.error("Error removing member:", error);
		return { success: false, error: "Failed to remove member" };
	}
}
