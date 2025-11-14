# 🚀 Full-Stack Cloudflare SaaS Kit

**_Build and deploy scalable products on Cloudflare with ease._**

An opinionated, batteries-included starter kit for quickly building and deploying SaaS products on Cloudflare. This is a [Next.js](https://nextjs.org/) project bootstrapped with [`c3`](https://developers.cloudflare.com/pages/get-started/c3).

This is the same stack used to build [Supermemory.ai](https://Supermemory.ai) which is open source at [git.new/memory](https://git.new/memory)

Supermemory now has 20k+ users and it runs on $5/month. safe to say, it's _very_ effective.

## ✨ Features

- 🔐 **Authentication** - Google OAuth with NextAuth v5
- 👥 **Multi-tenancy** - Workspace & Team management with roles
- 🎫 **Invite System** - Shareable invite links with expiration
- 🎨 **Beautiful UI** - ShadcnUI components with dark mode
- 🖼️ **Image Proxy** - Bypass rate limits for external images
- 🚀 **Edge Runtime** - All routes optimized for Cloudflare Edge
- 📦 **Type-safe** - Full TypeScript support throughout
- ⚡ **Zero Config** - Environment variables via Cloudflare bindings

## The stack includes:

- [Next.js](https://nextjs.org/) for frontend
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Drizzle ORM](https://orm.drizzle.team/) for database access
- [NextAuth v5](https://next-auth.js.org/) for authentication
- [Cloudflare D1](https://www.cloudflare.com/developer-platform/d1/) for serverless databases
- [Cloudflare Pages](https://pages.cloudflare.com/) for hosting
- [ShadcnUI](https://shadcn.com/) as the component library

## Getting Started

1. Make sure that you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#installupdate-wrangler) installed. And also that you have logged in with `wrangler login` (You'll need a Cloudflare account)

2. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/imlolman/cloudflare-saas-stack-with-workspace
   cd cloudflare-saas-stack-with-workspace
   npm i -g bun
   bun install
   bun run setup
   ```

3. Run the development server:
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure

```
cloudflare-saas-stack/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard pages (protected)
│   │   │   ├── page.tsx        # Overview with workspace list
│   │   │   ├── team/           # Team management
│   │   │   └── settings/       # Workspace settings
│   │   ├── invite/[token]/     # Invite acceptance page
│   │   ├── login/              # Login page
│   │   └── api/
│   │       ├── [...nextauth]/  # NextAuth endpoints
│   │       └── image-proxy/    # Image proxy for external images
│   ├── components/
│   │   ├── ui/                 # ShadcnUI components
│   │   ├── workspace-switcher.tsx
│   │   ├── member-list.tsx
│   │   └── invite-link-card.tsx
│   ├── server/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── actions/
│   │   │   └── workspace.ts    # Server actions for workspaces
│   │   └── db/
│   │       ├── index.ts        # Database client
│   │       └── schema.ts       # Drizzle schema
│   ├── lib/
│   │   └── utils/              # Utility functions
│   └── middleware.ts           # Route protection
├── drizzle/                    # Database migrations
└── wrangler.toml              # Cloudflare configuration
```

## 🎯 Core Features Explained

### Workspace & Team Management

The kit includes a complete multi-tenancy system:

- **Workspaces**: Isolated environments for different projects/teams
- **Team Members**: Users can be part of multiple workspaces
- **Roles**: Owner and Member roles with appropriate permissions
- **Auto-creation**: New users automatically get a default workspace

### Authentication Flow

1. User signs in with Google OAuth
2. System automatically creates a default workspace
3. User is added as the workspace owner
4. Redirected to dashboard with their workspace

### Invite System

- **Generate Links**: Workspace owners can create invite links
- **Expiration**: Links expire after 7 days
- **One-time Use**: Links are deleted after acceptance
- **Access Control**: Only owners can invite members

### Image Proxy

Solves rate-limiting issues with external images (like Google profile photos):

```typescript
// Automatically proxies Google images
/api/image-proxy?url=https://lh3.googleusercontent.com/...
```

### Database Schema

```
users → workspace_members → workspaces
                          ↓
                   workspace_invites
```

- **workspaces**: Workspace information
- **workspace_members**: User-to-workspace relationships with roles
- **workspace_invites**: Shareable invite tokens with expiration

## Cloudflare Integration

Besides the `dev` script, `c3` has added extra scripts for Cloudflare Pages integration:

- `pages:build`: Build the application for Pages using [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) CLI
- `preview`: Locally preview your Pages application using [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI
- `deploy`: Deploy your Pages application using Wrangler CLI
- `cf-typegen`: Generate typescript types for Cloudflare env.

> **Note:** While the `dev` script is optimal for local development, you should preview your Pages application periodically to ensure it works properly in the Pages environment.

## Bindings

Cloudflare [Bindings](https://developers.cloudflare.com/pages/functions/bindings/) allow you to interact with Cloudflare Platform resources. You can use bindings during development, local preview, and in the deployed application.

For detailed instructions on setting up bindings, refer to the Cloudflare documentation.

## Database Migrations

Quick explaination of D1 set up:

- D1 is a serverless database that follows SQLite convention.
- Within Cloudflare pages and workers, you can directly query d1 with [client api](https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/) exposed by bindings (eg. `env.BINDING`)
- You can also query d1 via [rest api](https://developers.cloudflare.com/api/operations/cloudflare-d1-create-database)
- Locally, wrangler auto generates sqlite files at `.wrangler/state/v3/d1` after `bun run dev`.
- Local dev environment (`bun run dev`) interact with [local d1 session](https://developers.cloudflare.com/d1/build-with-d1/local-development/#start-a-local-development-session), which is based on some SQlite files located at `.wrangler/state/v3/d1`.
- In dev mode (`bun run db:<migrate or studio>:dev`), Drizzle-kit (migrate and studio) directly modifies these files as regular SQlite db. While `bun run db:<migrate or studio>:prod` use d1-http driver to interact with remote d1 via rest api. Therefore we need to set env var at `.env.example`

### Generate Migration Files

```bash
bun run db:generate
```

### Apply Database Migrations

**Development (Local D1):**

```bash
# Using Drizzle (may have issues with existing tables)
bun run db:migrate:dev

# Or directly with Wrangler (recommended)
wrangler d1 execute cloudflare-stack-test --local --file=./drizzle/0001_migration_name.sql
```

**Production (Remote D1):**

```bash
# Using Drizzle
bun run db:migrate:prod

# Or directly with Wrangler
wrangler d1 execute cloudflare-stack-test --remote --file=./drizzle/0001_migration_name.sql
```

### Inspect Database

**Local database:**

```bash
bun run db:studio:dev
```

**Remote database:**

```bash
bun run db:studio:prod
```

## 🛠️ Development Commands

```bash
# Run dev server
bun dev

# Type checking
npm run check

# Linting
npm run lint

# Build for production
bun run pages:build

# Preview production build
bun run preview

# Deploy to Cloudflare Pages
bun run deploy
```

## Cloudflare R2 Bucket CORS / File Upload

Don't forget to add the CORS policy to the R2 bucket. The CORS policy should look like this:

```json
[
	{
		"AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
		"AllowedMethods": ["GET", "PUT"],
		"AllowedHeaders": ["Content-Type"],
		"ExposeHeaders": ["ETag"]
	}
]
```

You can now even set up object upload.

## Manual Setup

If you prefer manual setup:

1. Create a Cloudflare account and install Wrangler CLI.
2. Create a D1 database: `bunx wrangler d1 create ${dbName}`
3. Create a `.dev.vars` file in the project root with your Google OAuth credentials and NextAuth secret.
   1. `AUTH_SECRET`, generate by command `openssl rand -base64 32` or `bunx auth secret`
   2. `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` for google oauth.
      1. First create [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent). Tips: no wait time if you skip logo upload.
      2. Create [credential](https://console.cloud.google.com/apis/credentials). Put `https://your-domain` and `http://localhost:3000` at "Authorized JavaScript origins". Put `https://your-domain/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google` at "Authorized redirect URIs".
4. Generate db migration files: `bun run db:generate`
5. Run local migration: `bunx wrangler d1 execute ${dbName} --local --file=migrations/0000_setup.sql` or using drizzle `bun run db:migrate:dev`
6. Run remote migration: `bunx wrangler d1 execute ${dbName} --remote --file=migrations/0000_setup.sql` or using drizzle `bun run db:migrate:prod`
7. Start development server: `bun run dev`
8. Deploy: `bun run deploy`

## 🎨 Key Pages & Routes

| Route                 | Description                 | Access    |
| --------------------- | --------------------------- | --------- |
| `/`                   | Landing page                | Public    |
| `/login`              | Google OAuth login          | Public    |
| `/dashboard`          | Workspace overview          | Protected |
| `/dashboard/team`     | Team member management      | Protected |
| `/dashboard/settings` | Workspace settings          | Protected |
| `/invite/[token]`     | Accept workspace invitation | Protected |

## 🔐 Server Actions

All workspace operations are handled via server actions (`src/server/actions/workspace.ts`):

- `getWorkspaces()` - List user's workspaces
- `getWorkspace(id)` - Get single workspace
- `createWorkspace(name)` - Create new workspace
- `updateWorkspace(id, name)` - Update workspace
- `deleteWorkspace(id)` - Delete workspace (owner only)
- `leaveWorkspace(id)` - Leave workspace (members only)
- `generateInviteLink(id)` - Create invite link (owner only)
- `acceptInvite(token)` - Join via invite
- `revokeInvite(id)` - Delete invite link (owner only)
- `removeMember(workspaceId, userId)` - Remove member (owner only)

## 🚀 The Beauty of This Stack

- **Fully scalable and composable** - Add features incrementally
- **No environment variables needed** - Use Cloudflare bindings (`env.DB`, `env.KV`, etc.)
- **Powerful CLI tools** - Wrangler for database, migrations, and deployment
- **Cost-effective** - Run multiple high-traffic projects on $5/month
- **Edge-first** - All routes optimized for Cloudflare Edge runtime
- **Type-safe** - End-to-end TypeScript with Drizzle ORM
- **Production-ready** - Workspace management, auth, and team features built-in

## 🤝 Contributing

Contributions are welcome! This is a starter template, so feel free to:

- Add new features
- Improve documentation
- Report bugs
- Suggest enhancements

## 📝 License

MIT License - feel free to use this for your own projects!

## 🙏 Credits

Built on top of the amazing work by [Dhravya](https://github.com/Dhravya) and the Cloudflare team.

---

**Ready to build your next SaaS?** Just change your Cloudflare account ID in the project settings, and you're good to go! 🚀
