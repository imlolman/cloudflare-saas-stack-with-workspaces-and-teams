import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { workspaces, workspaceMembers } from "./db/schema";
import { eq } from "drizzle-orm";

export const {
	handlers: { GET, POST },
	signIn,
	signOut,
	auth,
} = NextAuth({
	trustHost: true,
	adapter: DrizzleAdapter(db),
	providers: [
		Google
	],
	events: {
		createUser: async ({ user }) => {
			if (!user.id || !user.name) return;

			// Create a default workspace for the new user
			const workspaceName = `${user.name}'s Workspace`;
			const workspaceSlug = `${user.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${user.id.slice(0, 8)}`;

			const [workspace] = await db.insert(workspaces).values({
				name: workspaceName,
				slug: workspaceSlug,
				ownerId: user.id,
			}).returning();

			// Add user as owner to the workspace
			if (workspace) {
				await db.insert(workspaceMembers).values({
					workspaceId: workspace.id,
					userId: user.id,
					role: "owner",
				});
			}
		},
	},
});