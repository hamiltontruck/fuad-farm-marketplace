export type ListingStatus = "active" | "pending" | "sold" | "hidden";

export type DatabaseListing = {
  id: string;
  ownerId: string;
  title: string;
  category: string;
  categoryLabel: string;
  transaction: string;
  price: number;
  priceSuffix: string;
  location: string;
  seller: string;
  phone: string;
  role: string;
  condition: string;
  description: string;
  icon: string;
  accent: string;
  status: ListingStatus;
  images: string[];
  verified: boolean;
  createdAt: string;
};
