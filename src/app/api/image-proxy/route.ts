import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const userId = searchParams.get("userId");

	if (!userId) {
		return new NextResponse("Missing user ID", { status: 400 });
	}

	try {
		// Fetch the user from the database to get their image URL
		const user = await db
			.select({ image: users.image })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)
			.then((rows) => rows[0]);

		if (!user || !user.image) {
			return new NextResponse("User or image not found", { status: 404 });
		}

		// Only proxy Google images
		if (!user.image.includes("googleusercontent.com") && !user.image.includes("google.com")) {
			return new NextResponse("Image URL not supported", { status: 400 });
		}

		// Fetch the image from Google
		const response = await fetch(user.image, {
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
			},
		});

		if (!response.ok) {
			return new NextResponse("Failed to fetch image", { status: 404 });
		}

		// Get the image data
		const imageData = await response.arrayBuffer();
		const contentType = response.headers.get("content-type") || "image/jpeg";

		// Return the image with appropriate headers
		return new NextResponse(imageData, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
			},
		});
	} catch (error) {
		console.error("Image proxy error:", error);
		return new NextResponse("Error fetching image", { status: 500 });
	}
}
