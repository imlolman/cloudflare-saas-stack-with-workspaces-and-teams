import { integer, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/libsql";
import type { AdapterAccountType } from "next-auth/adapters";
import { db } from ".";

export const users = sqliteTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique(),
	emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
	image: text("image"),
});

export const accounts = sqliteTable(
	"account",
	{
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<AdapterAccountType>().notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId],
		}),
	})
);

export const sessions = sqliteTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
	"verificationToken",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
	},
	(verificationToken) => ({
		compositePk: primaryKey({
			columns: [verificationToken.identifier, verificationToken.token],
		}),
	})
);

export const authenticators = sqliteTable(
	"authenticator",
	{
		credentialID: text("credentialID").notNull().unique(),
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		providerAccountId: text("providerAccountId").notNull(),
		credentialPublicKey: text("credentialPublicKey").notNull(),
		counter: integer("counter").notNull(),
		credentialDeviceType: text("credentialDeviceType").notNull(),
		credentialBackedUp: integer("credentialBackedUp", {
			mode: "boolean",
		}).notNull(),
		transports: text("transports"),
	},
	(authenticator) => ({
		compositePK: primaryKey({
			columns: [authenticator.userId, authenticator.credentialID],
		}),
	})
);

export const workspaces = sqliteTable("workspace", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	ownerId: text("ownerId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: integer("createdAt", { mode: "timestamp_ms" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const workspaceMembers = sqliteTable(
	"workspace_member",
	{
		workspaceId: text("workspaceId")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: text("role", { enum: ["owner", "member"] }).notNull(),
		joinedAt: integer("joinedAt", { mode: "timestamp_ms" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(member) => ({
		compoundKey: primaryKey({
			columns: [member.workspaceId, member.userId],
		}),
	})
);

export const workspaceInvites = sqliteTable("workspace_invite", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	workspaceId: text("workspaceId")
		.notNull()
		.references(() => workspaces.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
	createdById: text("createdById")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: integer("createdAt", { mode: "timestamp_ms" })
		.notNull()
		.$defaultFn(() => new Date()),
});
