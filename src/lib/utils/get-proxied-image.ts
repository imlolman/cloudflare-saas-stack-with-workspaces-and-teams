export function getProxiedImageUrl(imageUrl: string | null | undefined): string | null {
	if (!imageUrl) return null;
	
	// Check if it's a Google image URL that needs proxying
	if (imageUrl.includes("googleusercontent.com") || imageUrl.includes("google.com")) {
		return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
	}
	
	// Return other image URLs as-is
	return imageUrl;
}

export function getUserInitials(name: string | null | undefined): string {
	if (!name) return "?";
	
	const parts = name.trim().split(" ");
	if (parts.length >= 2) {
		return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
	}
	return name.charAt(0).toUpperCase();
}

