export type AccountType = 'individual' | 'businessman';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: AccountType;
  city: string;
  avatar?: string;
  // Businessman specific fields
  businessName?: string;
  businessRole?: BusinessRole;
  category?: string;
  gstNumber?: string;
  address?: string;
}

export type BusinessRole =
  | 'Bakery & Food'
  | 'Grocery & Supermarket'
  | 'Clothing & Apparel'
  | 'Electronics & Appliances'
  | 'Auto Spare Parts & Mechanic'
  | 'Beauty Parlour & Salon'
  | 'Cafe & Restaurant'
  | 'Footwear & Shoes'
  | 'Sanitary & Hardware'
  | 'Stationery & Books'
  | 'Jewellery & Accessories'
  | 'Medical & Pharmacy'
  | 'Manufacturer'
  | 'Super Wholesaler'
  | 'Wholesaler'
  | 'Distributor'
  | 'Retailer'
  | 'Service Provider';

export interface BusinessLocation {
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
  unitPrice: number;
  moq: number; // Minimum Order Quantity
  unit: string; // e.g. 'pieces', 'boxes', 'meters', 'kg', 'portions'
  inStock: boolean;
  leadTimeDays: number;
  imageUrl?: string;
}

export interface Review {
  id: string;
  authorName: string;
  authorBusiness?: string;
  authorRole?: string;
  rating: number;
  date: string;
  comment: string;
  source: 'platform_verified' | 'serpapi_google' | 'b2b_trade' | 'google_maps';
  isVerifiedBuyer: boolean;
}

export interface Business {
  id: string;
  businessCode: string; // e.g. "BL-AMB-000124"
  name: string;
  ownerName: string;
  roles: BusinessRole[];
  primaryRole: BusinessRole;
  categories: string[];
  description: string;
  location: BusinessLocation;
  rating: number;
  reviewCount: number;
  verified: boolean;
  phone: string;
  email: string;
  website?: string;
  imageUrl?: string; // Real photo from SerpApi / Google Maps
  photos?: string[];
  googleMapsUrl?: string; // Direct link to Google Maps
  directionsUrl?: string; // Direct turn-by-turn navigation link
  openStatus?: string; // e.g. "Open now · Closes 9 PM", "Closed"
  operatingHours?: Record<string, string>;
  serviceOptions?: Record<string, boolean>; // e.g. Delivery, Dine-in, In-store shopping
  placeId?: string;
  gstNumber?: string;
  establishedYear: number;
  minOrderValue?: number;
  priceLevel?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  suppliesTo: BusinessRole[];
  purchasesFrom: BusinessRole[];
  products: ProductItem[];
  reviews: Review[];
  totalSuppliersCount: number;
  totalCustomersCount: number;
  trustScore: number; // 0 - 100
  fulfillmentRate: number; // e.g. 98%
  avatarUrl?: string;
  bannerGradient?: string;
  source?: 'serpapi' | 'verified_bizlink' | 'mock_directory' | 'google_maps';
  sourcePlatform?: string;
}

export interface SupplyRelationship {
  id: string;
  sourceId: string; // Supplier ID
  targetId: string; // Buyer ID
  sourceName: string;
  targetName: string;
  sourceRole: BusinessRole;
  targetRole: BusinessRole;
  category: string;
  volumeMonthly: string;
  activeSince: string;
  status: 'active' | 'pending' | 'alternative';
  creditTermDays: number;
}

export interface LedgerTransaction {
  id: string;
  date: string;
  businessId: string;
  businessName: string;
  businessRole?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  type: 'Credit' | 'Debit'; // Debit: You Gave (Udhaar / Receivable) | Credit: You Received (Jama / Payment Got)
  amount: number;
  status: 'Pending' | 'Settled' | 'Overdue';
  invoiceNumber: string;
  description: string;
  dueDate: string;
  category: string;
  paymentMode?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Credit / Udhaar';
  notes?: string;
}

export interface SerpApiSearchParams {
  query: string;
  location: string;
  radiusKm?: number;
  businessType?: BusinessRole | 'All';
  category?: string;
  forceMock?: boolean;
  userLat?: number;
  userLng?: number;
}

export interface SearchResultResponse {
  results: Business[];
  totalResults: number;
  source: 'serpapi_live' | 'mock_fallback' | 'mock_mode';
  query: string;
  location: string;
  radiusKm: number;
  latencyMs: number;
  serpApiQueryUsed?: string;
  detectedCategory?: string;
}
