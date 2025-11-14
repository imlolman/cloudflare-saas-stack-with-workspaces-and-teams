import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const imageUrl = searchParams.get("url");

	if (!imageUrl) {
		return new NextResponse("Missing image URL", { status: 400 });
	}

	try {
		// Fetch the image from the external URL
		const response = await fetch(imageUrl, {
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

