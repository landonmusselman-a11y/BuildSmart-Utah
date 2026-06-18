export interface Incentive {
  id: string;
  builderId: string;
  communityId?: string;
  title: string;
  description: string;
  value: string;
  type: 'rate-buydown' | 'closing-costs' | 'upgrades' | 'price-reduction' | 'other';
  expiresDate?: string;
  active: boolean;
}

export interface HOA {
  monthly: number;
  includes: string[];
}

export interface Basement {
  available: boolean;
  finishedIncluded: boolean;
  finishCostMin?: number;
  finishCostMax?: number;
  sqft?: number;
  notes?: string;
}

export interface SpecHome {
  id: string;
  address: string;
  price: number;
  sqft: number;
  beds: number;
  baths: number;
  garage: number;
  status: 'move-in-ready' | 'under-construction' | 'available';
  completionDate?: string;  // e.g. "August 2025"
  floorPlan?: string;
  highlights: string[];    // what's already selected/upgraded
  lotSize?: string;        // e.g. "6,200 sq ft"
  basement?: boolean;
}

export interface FloorPlan {
  name: string;
  sqftMin: number;
  sqftMax: number;
  beds: string;           // e.g. "3-5"
  baths: string;          // e.g. "2-3"
  garage: number;
  stories: string;        // e.g. "2-Story", "Rambler"
  basePrice: number;
  hasBasement: boolean;
}

export interface Community {
  id: string;
  builderId: string;
  builderName: string;
  builderSlug: string;
  name: string;
  slug: string;
  city: string;
  county: string;
  address: string;
  lat: number;
  lng: number;
  priceMin: number;
  priceMax: number;
  sqftMin: number;
  sqftMax: number;
  bedsRange: string;
  garageSpaces: number;
  status: 'selling' | 'coming-soon' | 'sold-out';
  type: 'spec-only' | 'dirt-only' | 'both';   // spec = built inventory, dirt = buy lot & choose plan
  totalLots?: number;
  availableLots?: number | null;              // null = call for availability
  lotSizeMin?: number;                        // sq ft
  lotSizeMax?: number;
  communityMapUrl?: string;                   // link to PDF or image
  mapUrl: string;                             // Google Maps link
  description: string;
  features: string[];
  includedFeatures: string[];
  floorPlans: FloorPlan[];
  specHomes: SpecHome[];
  basement: Basement;
  hoa: HOA | null;
  photoColor: string;
  incentives: Incentive[];
  // Extended audit fields
  schoolDistrict?: string;
  amenities?: string[];      // pool, clubhouse, trails, playground, etc.
  websiteUrl?: string;       // direct URL to this community on builder's site
  dataVerified?: boolean;
}

export interface Builder {
  id: string;
  name: string;
  slug: string;
  logoInitials: string;
  logoColor: string;
  logoUrl?: string;          // URL to official builder logo image
  tagline: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  yearsInBusiness: number;
  homesBuilt: string;
  warrantyYears: number;
  areas: string[];
  priceMin: number;
  priceMax: number;
  communities: Community[];
  incentives: Incentive[];
  featured: boolean;
  // Audit metadata
  dataVerified?: boolean;    // true = scraped/verified from builder website
  dataVerifiedDate?: string; // ISO date of last verification
  preferredLender?: string;  // builder's preferred lender name
  schoolDistricts?: string[];
}

export interface AuditStatus {
  builderSlug: string;
  builderName: string;
  verified: boolean;
  lastChecked?: string;
  communityCount: number;
  verifiedCommunities: string[];
  missingData: string[];
  notes?: string;
}

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Quick modal fields
  builderInterest?: string;
  communityInterest?: string;
  message?: string;
  // Matchmaker fields
  budget?: string;
  areas?: string[];
  priorities?: string[];
  homeType?: string;
  timeline?: string;
  preApproval?: string;
  matchedCommunities?: string[];
  // Meta
  priceRange?: string;
  source: string;
}
