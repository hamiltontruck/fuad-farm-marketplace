export const listingStatuses = ["active", "sold", "hidden"] as const;
export type ListingStatus = (typeof listingStatuses)[number];

export function parseImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.startsWith("/api/uploads?key="))
      .slice(0, 5);
  }

  if (typeof value !== "string" || !value.trim()) return [];
  try {
    return parseImageUrls(JSON.parse(value));
  } catch {
    return [];
  }
}

export function serializeListing<T extends { images: string }>(listing: T) {
  return { ...listing, images: parseImageUrls(listing.images) };
}

export function isListingStatus(value: unknown): value is ListingStatus {
  return typeof value === "string" && listingStatuses.includes(value as ListingStatus);
}
