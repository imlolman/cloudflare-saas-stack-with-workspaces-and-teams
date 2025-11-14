import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export const runtime = "edge";

export default async function Page() {
	const session = await auth();

	// Redirect based on authentication status
	if (session?.user) {
		redirect("/dashboard");
	} else {
		redirect("/login");
	}
}
