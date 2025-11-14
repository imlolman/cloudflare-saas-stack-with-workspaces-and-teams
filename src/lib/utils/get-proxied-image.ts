export function getProxiedImageUrl(userId: string | null | undefined): string | null {
	if (!userId) return null;

	// Return the proxied URL using userId instead of the actual image URL
	return `/api/image-proxy?userId=${encodeURIComponent(userId)}`;
}

export function getUserInitials(name: string | null | undefined): string {
	if (!name) return "?";

	const parts = name.trim().split(" ");
	if (parts.length >= 2) {
		return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
	}
	return name.charAt(0).toUpperCase();
}
