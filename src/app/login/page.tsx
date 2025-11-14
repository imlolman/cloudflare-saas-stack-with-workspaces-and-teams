import { auth, signIn } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const runtime = "edge";

interface LoginPageProps {
	searchParams: { callbackUrl?: string };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const session = await auth();

	// If already authenticated, redirect to callback URL or dashboard
	if (session?.user) {
		redirect(searchParams.callbackUrl || "/dashboard");
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
			<div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-xl dark:bg-gray-950">
				<div className="mb-8 flex flex-col items-center">
					<svg
						viewBox="0 0 256 116"
						xmlns="http://www.w3.org/2000/svg"
						width="60px"
						height="60px"
						preserveAspectRatio="xMidYMid"
						role="img"
						aria-label="Cloudflare logo"
						className="mb-4"
					>
						<path
							fill="currentColor"
							className="text-gray-900 dark:text-white"
							d="m202.357 49.394-5.311-2.124C172.085 103.434 72.786 69.289 66.81 85.997c-.996 11.286 54.227 2.146 93.706 4.059 12.039.583 18.076 9.671 12.964 24.484l10.069.031c11.615-36.209 48.683-17.73 50.232-29.68-2.545-7.857-42.601 0-31.425-35.497Z"
						/>
						<path
							fill="#F4811F"
							d="M176.332 108.348c1.593-5.31 1.062-10.622-1.593-13.809-2.656-3.187-6.374-5.31-11.154-5.842L71.17 87.634c-.531 0-1.062-.53-1.593-.53-.531-.532-.531-1.063 0-1.594.531-1.062 1.062-1.594 2.124-1.594l92.946-1.062c11.154-.53 22.839-9.56 27.087-20.182l5.312-13.809c0-.532.531-1.063 0-1.594C191.203 20.182 166.772 0 138.091 0 111.535 0 88.697 16.995 80.73 40.896c-5.311-3.718-11.684-5.843-19.12-5.31-12.747 1.061-22.838 11.683-24.432 24.43-.531 3.187 0 6.374.532 9.56C16.996 70.107 0 87.103 0 108.348c0 2.124 0 3.718.531 5.842 0 1.063 1.062 1.594 1.594 1.594h170.489c1.062 0 2.125-.53 2.125-1.594l1.593-5.842Z"
						/>
						<path
							fill="#FAAD3F"
							d="M205.544 48.863h-2.656c-.531 0-1.062.53-1.593 1.062l-3.718 12.747c-1.593 5.31-1.062 10.623 1.594 13.809 2.655 3.187 6.373 5.31 11.153 5.843l19.652 1.062c.53 0 1.062.53 1.593.53.53.532.53 1.063 0 1.594-.531 1.063-1.062 1.594-2.125 1.594l-20.182 1.062c-11.154.53-22.838 9.56-27.087 20.182l-1.063 4.78c-.531.532 0 1.594 1.063 1.594h70.108c1.062 0 1.593-.531 1.593-1.593 1.062-4.25 2.124-9.03 2.124-13.81 0-27.618-22.838-50.456-50.456-50.456"
						/>
					</svg>
					<h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
					<p className="text-center text-gray-600 dark:text-gray-400">
						Sign in to access your workspace
					</p>
				</div>

			<form
				action={async () => {
					"use server";
					const callbackUrl = searchParams.callbackUrl || "/dashboard";
					await signIn("google", { redirectTo: callbackUrl });
				}}
				className="w-full"
			>
					<Button className="w-full" size="lg">
						<svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Continue with Google
					</Button>
				</form>

				<p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
					By signing in, you agree to our Terms of Service and Privacy Policy
				</p>
			</div>
		</main>
	);
}
