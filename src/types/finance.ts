export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'airbnb' | 'other'

export interface Account {
  id: string
  name: string
  institution: string
  type: AccountType
  lastUpdated: string
  balance: number
}

export interface Transaction {
  id: string
  accountId: string
  date: string
  description: string
  amount: number
  category: string
  subcategory?: string
  notes?: string
  isAirbnb?: boolean
}

export interface CategoryRule {
  keyword: string
  category: string
  subcategory?: string
}

export interface AirbnbEntry {
  id: string
  propertyName: string
  date: string
  type: 'income' | 'expense' | 'cleaning_fee' | 'airbnb_fee' | 'tax' | 'mortgage' | 'utility' | 'supply' | 'repair' | 'depreciation' | 'insurance' | 'other_expense'
  description: string
  amount: number
  year: number
}

export interface InvestmentAccount {
  id: string
  name: string
  institution: string
  lastUpdated: string
  totalValue: number
  holdings: InvestmentHolding[]
}

export interface InvestmentHolding {
  symbol: string
  name: string
  shares: number
  price: number
  value: number
  costBasis?: number
  gainLoss?: number
}

export interface TaxDocument {
  id: string
  year: number
  type: '1099-NEC' | '1099-MISC' | '1099-K' | '1099-INT' | '1099-DIV' | 'W2' | 'K1' | 'mortgage_interest' | 'property_tax' | 'other'
  description: string
  payer: string
  amount: number
  uploadedAt: string
  fileName: string
}

export interface FinanceStore {
  accounts: Account[]
  transactions: Transaction[]
  categoryRules: CategoryRule[]
  airbnbEntries: AirbnbEntry[]
  investmentAccounts: InvestmentAccount[]
  taxDocuments: TaxDocument[]
  monthlyBudget: number
}

export const SPENDING_CATEGORIES = [
  'Mortgage',
  'Housing',
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Health & Medical',
  'Utilities',
  'Insurance',
  'Travel',
  'Business',
  'Airbnb',
  'Kids & Family',
  'Personal Care',
  'Subscriptions',
  'Taxes & Fees',
  'Transfer',
  'Venmo',
  'Income',
  'Other',
] as const

export type SpendingCategory = typeof SPENDING_CATEGORIES[number]

export const DEFAULT_CATEGORY_RULES: CategoryRule[] = [
  // ── Income / Transfers (check first) ──────────────────────────────────────
  { keyword: 'direct deposit', category: 'Income' },
  { keyword: 'payroll', category: 'Income' },
  { keyword: 'zelle', category: 'Transfer' },
  { keyword: 'venmo', category: 'Transfer' },
  { keyword: 'paypal', category: 'Transfer' },
  { keyword: 'robinhood', category: 'Transfer' },
  { keyword: 'transfer', category: 'Transfer' },
  { keyword: 'thank you', category: 'Transfer' },
  { keyword: 'payment', category: 'Transfer' },
  { keyword: 'autopay', category: 'Transfer' },

  // ── Mortgage servicers (check before generic Housing) ────────────────────
  { keyword: 'mr. cooper', category: 'Mortgage' },
  { keyword: 'mr cooper', category: 'Mortgage' },
  { keyword: 'pennymac', category: 'Mortgage' },
  { keyword: 'penny mac', category: 'Mortgage' },
  { keyword: 'loandepot', category: 'Mortgage' },
  { keyword: 'loan depot', category: 'Mortgage' },
  { keyword: 'shellpoint', category: 'Mortgage' },
  { keyword: 'newrez', category: 'Mortgage' },
  { keyword: 'new rez', category: 'Mortgage' },
  { keyword: 'loancare', category: 'Mortgage' },
  { keyword: 'bsi financial', category: 'Mortgage' },
  { keyword: 'nationstar', category: 'Mortgage' },
  { keyword: 'phh mortgage', category: 'Mortgage' },
  { keyword: 'sps mortgage', category: 'Mortgage' },
  { keyword: 'wells fargo home', category: 'Mortgage' },
  { keyword: 'quicken loans', category: 'Mortgage' },
  { keyword: 'rocket mortgage', category: 'Mortgage' },
  { keyword: 'home loan', category: 'Mortgage' },
  { keyword: 'mortgage payment', category: 'Mortgage' },
  { keyword: 'mtg pmt', category: 'Mortgage' },

  // ── Housing ───────────────────────────────────────────────────────────────
  { keyword: 'mortgage', category: 'Mortgage' },
  { keyword: 'rent', category: 'Housing' },
  { keyword: 'hoa', category: 'Housing' },
  { keyword: 'property management', category: 'Housing' },
  { keyword: 'turno', category: 'Airbnb' },

  // ── Utilities ─────────────────────────────────────────────────────────────
  { keyword: 'rocky mountain power', category: 'Utilities' },
  { keyword: 'questar', category: 'Utilities' },
  { keyword: 'dominion energy', category: 'Utilities' },
  { keyword: 'electric', category: 'Utilities' },
  { keyword: 'gas company', category: 'Utilities' },
  { keyword: 'starlink', category: 'Utilities' },
  { keyword: 'xfinity', category: 'Utilities' },
  { keyword: 'comcast', category: 'Utilities' },
  { keyword: 'internet', category: 'Utilities' },
  { keyword: 'att', category: 'Utilities' },
  { keyword: 'at&t', category: 'Utilities' },
  { keyword: 'verizon', category: 'Utilities' },
  { keyword: 't-mobile', category: 'Utilities' },
  { keyword: 'tmobile', category: 'Utilities' },
  { keyword: 'water', category: 'Utilities' },
  { keyword: 'waste', category: 'Utilities' },

  // ── Subscriptions ─────────────────────────────────────────────────────────
  { keyword: 'netflix', category: 'Subscriptions' },
  { keyword: 'hulu', category: 'Subscriptions' },
  { keyword: 'spotify', category: 'Subscriptions' },
  { keyword: 'youtube', category: 'Subscriptions' },
  { keyword: 'disney', category: 'Subscriptions' },
  { keyword: 'apple.com/bill', category: 'Subscriptions' },
  { keyword: 'icloud', category: 'Subscriptions' },
  { keyword: 'openai', category: 'Subscriptions' },
  { keyword: 'chatgpt', category: 'Subscriptions' },
  { keyword: 'patreon', category: 'Subscriptions' },
  { keyword: 'amazon prime', category: 'Subscriptions' },
  { keyword: 'adobe', category: 'Subscriptions' },
  { keyword: 'dropbox', category: 'Subscriptions' },

  // ── Food & Dining ─────────────────────────────────────────────────────────
  { keyword: 'costco', category: 'Food & Dining' },
  { keyword: 'smiths', category: 'Food & Dining' },
  { keyword: "smith's", category: 'Food & Dining' },
  { keyword: 'harmons', category: 'Food & Dining' },
  { keyword: 'whole foods', category: 'Food & Dining' },
  { keyword: 'trader joe', category: 'Food & Dining' },
  { keyword: 'kroger', category: 'Food & Dining' },
  { keyword: 'instacart', category: 'Food & Dining' },
  { keyword: 'doordash', category: 'Food & Dining' },
  { keyword: 'grubhub', category: 'Food & Dining' },
  { keyword: 'ubereats', category: 'Food & Dining' },
  { keyword: 'starbucks', category: 'Food & Dining' },
  { keyword: 'chipotle', category: 'Food & Dining' },
  { keyword: 'mcdonald', category: 'Food & Dining' },
  { keyword: 'chick-fil', category: 'Food & Dining' },
  { keyword: 'chick fil', category: 'Food & Dining' },
  { keyword: 'wendys', category: 'Food & Dining' },
  { keyword: 'taco bell', category: 'Food & Dining' },
  { keyword: 'subway', category: 'Food & Dining' },
  { keyword: 'pizza', category: 'Food & Dining' },
  { keyword: 'restaurant', category: 'Food & Dining' },
  { keyword: 'cafe', category: 'Food & Dining' },
  { keyword: 'diner', category: 'Food & Dining' },
  { keyword: 'grill', category: 'Food & Dining' },
  { keyword: 'sushi', category: 'Food & Dining' },

  // ── Transportation ────────────────────────────────────────────────────────
  { keyword: 'uber', category: 'Transportation' },
  { keyword: 'lyft', category: 'Transportation' },
  { keyword: 'shell', category: 'Transportation' },
  { keyword: 'chevron', category: 'Transportation' },
  { keyword: 'maverik', category: 'Transportation' },
  { keyword: 'phillips 66', category: 'Transportation' },
  { keyword: 'exxon', category: 'Transportation' },
  { keyword: 'sinclair', category: 'Transportation' },
  { keyword: 'fuel', category: 'Transportation' },
  { keyword: 'parking', category: 'Transportation' },
  { keyword: 'autozone', category: 'Transportation' },
  { keyword: 'jiffy lube', category: 'Transportation' },
  { keyword: 'car wash', category: 'Transportation' },
  { keyword: 'tesla', category: 'Transportation' },

  // ── Shopping ──────────────────────────────────────────────────────────────
  { keyword: 'amazon', category: 'Shopping' },
  { keyword: 'walmart', category: 'Shopping' },
  { keyword: 'target', category: 'Shopping' },
  { keyword: 'best buy', category: 'Shopping' },
  { keyword: 'home depot', category: 'Shopping' },
  { keyword: 'lowes', category: 'Shopping' },
  { keyword: "lowe's", category: 'Shopping' },
  { keyword: 'floor and decor', category: 'Shopping' },
  { keyword: 'pottery barn', category: 'Shopping' },
  { keyword: 'west elm', category: 'Shopping' },
  { keyword: 'ikea', category: 'Shopping' },
  { keyword: 'wayfair', category: 'Shopping' },
  { keyword: 'chewy', category: 'Shopping' },
  { keyword: 'etsy', category: 'Shopping' },
  { keyword: 'ebay', category: 'Shopping' },

  // ── Travel ────────────────────────────────────────────────────────────────
  { keyword: 'delta', category: 'Travel' },
  { keyword: 'united', category: 'Travel' },
  { keyword: 'southwest', category: 'Travel' },
  { keyword: 'american airlines', category: 'Travel' },
  { keyword: 'frontier', category: 'Travel' },
  { keyword: 'hotel', category: 'Travel' },
  { keyword: 'marriott', category: 'Travel' },
  { keyword: 'hilton', category: 'Travel' },
  { keyword: 'hyatt', category: 'Travel' },
  { keyword: 'vrbo', category: 'Travel' },
  { keyword: 'ski', category: 'Travel' },
  { keyword: 'wolf creek', category: 'Travel' },

  // ── Health & Medical ──────────────────────────────────────────────────────
  { keyword: 'pharmacy', category: 'Health & Medical' },
  { keyword: 'walgreen', category: 'Health & Medical' },
  { keyword: 'cvs', category: 'Health & Medical' },
  { keyword: 'doctor', category: 'Health & Medical' },
  { keyword: 'dental', category: 'Health & Medical' },
  { keyword: 'vision', category: 'Health & Medical' },
  { keyword: 'hospital', category: 'Health & Medical' },
  { keyword: 'medical', category: 'Health & Medical' },
  { keyword: 'health', category: 'Health & Medical' },
  { keyword: 'gym', category: 'Health & Medical' },
  { keyword: 'fitness', category: 'Health & Medical' },

  // ── Insurance ─────────────────────────────────────────────────────────────
  { keyword: 'insurance', category: 'Insurance' },
  { keyword: 'progressive', category: 'Insurance' },
  { keyword: 'allstate', category: 'Insurance' },
  { keyword: 'state farm', category: 'Insurance' },
  { keyword: 'geico', category: 'Insurance' },

  // ── Kids & Family ─────────────────────────────────────────────────────────
  { keyword: 'school', category: 'Kids & Family' },
  { keyword: 'daycare', category: 'Kids & Family' },
  { keyword: 'toys', category: 'Kids & Family' },

  // ── Personal Care ─────────────────────────────────────────────────────────
  { keyword: 'salon', category: 'Personal Care' },
  { keyword: 'barber', category: 'Personal Care' },
  { keyword: 'spa', category: 'Personal Care' },

  // ── Business ──────────────────────────────────────────────────────────────
  { keyword: 'office depot', category: 'Business' },
  { keyword: 'staples', category: 'Business' },
  { keyword: 'fedex', category: 'Business' },
  { keyword: 'ups', category: 'Business' },
  { keyword: 'usps', category: 'Business' },
  { keyword: 'godaddy', category: 'Business' },
  { keyword: 'namecheap', category: 'Business' },
  { keyword: 'vercel', category: 'Business' },
  { keyword: 'supabase', category: 'Business' },

  // ── Airbnb ────────────────────────────────────────────────────────────────
  { keyword: 'airbnb', category: 'Airbnb' },

  // ── Taxes ─────────────────────────────────────────────────────────────────
  { keyword: 'irs', category: 'Taxes & Fees' },
  { keyword: 'tax', category: 'Taxes & Fees' },
]
