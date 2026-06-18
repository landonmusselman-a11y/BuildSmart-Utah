import { mockBuilders } from '@/data/mock';
import { Builder } from '@/types';

export interface BuilderCategory {
  slug: string;
  title: string;
  headline: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  builderSlugs: string[];  // ordered by fit for this category
  whyTheseBuildersIntro: string;
  builderReasons: Record<string, string>;  // slug → why they fit this category
  buyerTips: string[];
  faqItems: { q: string; a: string }[];
  cta: string;
}

export const categories: BuilderCategory[] = [
  {
    slug: 'first-time-buyers',
    title: 'Best Utah Builders for First-Time Buyers',
    headline: 'The Best Utah Home Builders for First-Time Buyers',
    metaTitle: 'Best Utah Home Builders for First-Time Buyers (2025 Guide)',
    metaDescription: 'Which Utah new construction builders are best for first-time buyers? Compare price ranges, included features, loan programs, and builder support. Free expert guidance.',
    intro: "Buying your first home is one of the most significant financial decisions you'll ever make. New construction in Utah offers first-time buyers a real advantage: warranty coverage, modern energy efficiency, and the ability to negotiate incentives that help with down payment and closing costs. But not every builder is equally suited to first-time buyers — price points, included features, and loan program compatibility vary significantly.",
    builderSlugs: ['perry-homes', 'woodside-homes', 'richmond-american', 'edge-homes', 'lennar'],
    whyTheseBuildersIntro: "These builders combine accessible price points, strong included features packages, and financing programs that work well for buyers purchasing their first home.",
    builderReasons: {
      'perry-homes': 'Perry Homes offers some of the most competitive base prices in Utah, with strong included features that keep upgrade costs manageable. Their communities in Utah County and Salt Lake Valley are within reach for buyers using FHA or conventional financing.',
      'woodside-homes': "Woodside's entry-level communities start below $400K with solid inclusions, and their sales teams are experienced helping first-time buyers navigate the contract and design center process.",
      'richmond-american': "Richmond American's design center credit programs and preferred lender incentives make them a strong option for buyers who need help with closing costs — a common challenge for first-time purchasers.",
      'edge-homes': "Edge builds in several Utah County communities with competitive pricing and HOA-free options, which reduces monthly carrying costs — important for first-time buyers on tighter budgets.",
      'lennar': "Lennar's 'Everything's Included' model eliminates design center budget shock — the price you see is closer to the price you pay, which is ideal for buyers who need payment certainty.",
    },
    buyerTips: [
      "Ask each builder about FHA and conventional loan compatibility — not all communities qualify for FHA financing due to HOA structure or loan limits",
      "Compare total monthly payment (PITI + HOA) across builders, not just purchase price",
      "Use builder closing cost credits to reduce out-of-pocket at closing — can be worth $8,000–$15,000",
      "Register your buyer's agent before visiting model homes — first contact policies can disqualify you from representation",
      "Ask about the builder's preferred lender rate buydown programs — can significantly lower your first-year payment",
    ],
    faqItems: [
      { q: 'Can first-time buyers use FHA loans for new construction in Utah?', a: 'Yes, most Utah new construction communities are FHA-eligible, though some HOA structures can complicate approval. Your lender will verify eligibility for your specific community. FHA requires 3.5% down and is more flexible on credit scores than conventional loans.' },
      { q: 'What price range should first-time buyers target in Utah?', a: 'Most first-time buyers in Utah target the $380,000–$550,000 range, depending on income, down payment, and target area. Utah County generally offers more entry-level options than Salt Lake County.' },
      { q: 'How much do I need for a down payment on new construction?', a: "Conventional loans require 3–20% down. FHA requires 3.5%. Many builders' preferred lender programs can help reduce closing costs, effectively lowering your total cash needed at closing." },
    ],
    cta: "Get matched with the right first-time-buyer-friendly community for your budget and location.",
  },
  {
    slug: 'luxury',
    title: 'Best Utah Luxury Home Builders',
    headline: 'The Best Luxury New Construction Builders in Utah (2025)',
    metaTitle: 'Best Luxury New Construction Builders in Utah 2025 | BuildSmart Utah',
    metaDescription: 'Looking for luxury new construction in Utah? Compare Toll Brothers, Ivory Homes, Hamlet, and other premium builders. Expert free guidance from a new construction specialist.',
    intro: "Utah's luxury new construction market has expanded significantly, with options ranging from elevated production builders to semi-custom luxury specialists. The definition of 'luxury' varies — but in Utah's new construction context, we define it as homes starting above $700,000 with high-spec standard inclusions, premium lot options, and elevated design center standards.",
    builderSlugs: ['toll-brothers', 'ivory-homes', 'hamlet-homes', 'camden-homes', 'garbett-homes'],
    whyTheseBuildersIntro: "These builders deliver premium construction quality, elevated standard inclusions, and communities in Utah's most desirable locations — from Traverse Mountain to the Wasatch Back.",
    builderReasons: {
      'toll-brothers': "Toll Brothers is the national leader in luxury new construction, with communities in Traverse Mountain and other premium Utah locations. Their homes include high-spec standard finishes, luxury design studios, and structural options not available from production builders.",
      'ivory-homes': "Utah's largest local builder, Ivory has expanded into the luxury segment with premium communities and a reputation built over decades of Utah construction. Their warranty program and local knowledge are unmatched.",
      'hamlet-homes': "Hamlet specializes in the $600K–$900K range with genuine semi-custom flexibility — lot options, structural modifications, and design center depth beyond what production builders offer.",
      'camden-homes': "Camden focuses on the Wasatch Back and premium Utah County locations with architecturally distinctive designs and included features that production builders charge extra for.",
      'garbett-homes': "Garbett is Utah's DOE Zero Energy Ready builder — premium construction with solar included, 2x6 framing, and energy efficiency standards that reduce long-term ownership costs while commanding premium value.",
    },
    buyerTips: [
      "At the luxury level, the lot matters as much as the home — ask about lot premiums, views, and backing options early",
      "Get the structural option list before signing — luxury builders offer basement configurations, main-floor masters, and modifications production builders don't",
      "Third-party inspections are especially important at this price point — hire an independent inspector for pre-drywall and final walks",
      "Compare warranty programs carefully — a 10-year transferable structural warranty adds real resale value at the luxury level",
      "Negotiate lot premiums aggressively — on a $900K home, a $25K lot premium waiver is a smaller percentage than it sounds but represents real savings",
    ],
    faqItems: [
      { q: 'What counts as luxury new construction in Utah?', a: "We define Utah luxury new construction as homes starting above $700,000 with premium standard inclusions, elevated design studio options, and communities in desirable locations. Semi-custom builders like Hamlet and Camden offer additional flexibility beyond typical production builders." },
      { q: "What's the difference between a luxury production builder and a semi-custom builder?", a: "A luxury production builder (Toll Brothers, upper-tier Ivory) builds from a catalog of floor plans with premium standard inclusions. A semi-custom builder (Hamlet, Camden) allows structural modifications — moving walls, adding rooms, changing layouts — within limits. True custom builders build from scratch from your architect's plans." },
      { q: 'Are luxury builder incentives negotiable?', a: "Yes — luxury builders have more flexibility than entry-level builders, especially on lot premiums, design center credits, and rate buydown packages. End-of-quarter timing and longer-sitting spec homes are your best leverage points." },
    ],
    cta: "Ready to tour Utah's top luxury new construction communities? Get expert representation at no cost.",
  },
  {
    slug: 'fast-move-in',
    title: 'Best Utah Builders for Fast Move-In (Spec Homes)',
    headline: 'Need to Move Fast? The Best Utah Builders for Quick Move-In Homes',
    metaTitle: 'Utah New Construction Spec Homes — Move In 30–90 Days | BuildSmart Utah',
    metaDescription: 'Need to move into a new home fast? These Utah builders have spec homes ready in 30–90 days. Compare move-in-ready inventory across Salt Lake, Utah County, and Davis County.',
    intro: "Not everyone can wait 8 months for a new home to be built. Whether you're relocating, under a lease deadline, or just want to skip the construction wait, spec homes — homes a builder started without a buyer — are the answer. Several Utah builders consistently carry strong spec home inventory across price ranges and cities.",
    builderSlugs: ['richmond-american', 'lennar', 'perry-homes', 'edge-homes', 'meritage-homes'],
    whyTheseBuildersIntro: "These builders consistently carry the most spec home inventory across Utah, with move-in-ready and near-completion homes available at competitive price points.",
    builderReasons: {
      'richmond-american': "Richmond American typically carries the largest spec home inventory across Utah communities, with move-in-ready homes available in multiple cities simultaneously. Their homes are generally complete-finish ready with design selections already made.",
      'lennar': "Lennar's high-volume production model means strong spec inventory. Their 'Everything's Included' approach means no design center surprises — you know exactly what you're getting.",
      'perry-homes': "Perry builds proactively and often has move-in-ready or 30-60 day completion homes available in their Utah County and Salt Lake communities.",
      'edge-homes': "Edge carries spec inventory in several Utah County communities and is known for clean, well-finished spec homes that show well.",
      'meritage-homes': "Meritage typically has spec homes at various completion stages, from framing to move-in-ready, allowing buyers to get involved early in the process if they can wait 60-90 days.",
    },
    buyerTips: [
      "Check how long a spec home has been listed — homes sitting 30+ days give you the most negotiating leverage",
      "Get a rate lock started immediately once you identify a spec home — your timeline is real and rate locks have expiration dates",
      "Ask specifically about 'quick close' incentives — builders often sweeten deals for buyers who can close in 30 days",
      "Even on spec homes, hire a third-party inspector — you're buying as-built and want to know what you're getting",
      "Negotiate lot premiums and closing cost credits harder on spec homes — the builder has carrying costs every day it sits",
    ],
    faqItems: [
      { q: 'How quickly can I close on a spec home in Utah?', a: "Move-in-ready spec homes can close in as little as 21–30 days depending on your lender and title company. Homes still under construction have a known completion date — typically 30–90 days from listing. Your agent can verify the actual completion timeline directly with the builder." },
      { q: 'Can I still negotiate on a spec home?', a: "Yes — often more so than a dirt build. The builder has carrying costs (taxes, insurance, utilities) every month a completed home sits. Lot premiums are frequently waivable, and closing cost credits are common on spec inventory." },
      { q: 'Are spec home finishes negotiable?', a: "Generally no — spec homes are already built with finishes selected. However, if the home is early in construction (framing stage), you may be able to make some design center selections. Ask your agent what stage the home is in." },
    ],
    cta: "Let us show you what's move-in ready right now across all Utah builders.",
  },
  {
    slug: 'no-hoa',
    title: 'Best Utah New Construction Builders with No HOA',
    headline: 'Utah New Construction Without the HOA: Best Builders and Communities',
    metaTitle: 'Utah New Construction No HOA Communities 2025 | BuildSmart Utah',
    metaDescription: 'Find Utah new construction communities with no HOA fees. Compare builders and communities without homeowners associations across Utah County, Salt Lake, and Davis County.',
    intro: "HOA fees in Utah new construction communities range from $0 to $300+/month. For buyers who want full control of their property — or who simply want to keep monthly costs down — knowing which builders and communities operate without an HOA is essential information that's surprisingly hard to find.",
    builderSlugs: ['edge-homes', 'perry-homes', 'woodside-homes', 'garbett-homes', 'richmond-american'],
    whyTheseBuildersIntro: "These builders have communities without HOAs or with minimal-fee HOAs across Utah. Note: HOA presence varies by specific community — always verify with your agent before signing.",
    builderReasons: {
      'edge-homes': "Several Edge communities in Utah County operate without HOAs or with very minimal maintenance-only fees. Their Haven and Millpond communities are worth asking about specifically.",
      'perry-homes': "Perry has a mix of HOA and non-HOA communities. Their rural and semi-rural Utah County communities are more likely to be HOA-free — ask your agent for the current list.",
      'woodside-homes': "Woodside operates communities in northern Utah (Davis/Weber counties) where HOAs are less common than in planned communities further south.",
      'garbett-homes': "Garbett's infill and urban communities in Salt Lake City are generally not governed by traditional HOAs.",
      'richmond-american': "Richmond's more rural communities and some Utah County locations operate without HOAs. Inventory changes — ask which current communities are HOA-free.",
    },
    buyerTips: [
      "Always ask the builder directly: 'Is there an HOA for this community?' — it should be disclosed upfront but sometimes isn't",
      "Check if the community has a Community Development District (CDD) instead of an HOA — these are different structures but still carry fees",
      "No HOA means you're responsible for your own landscaping standards — ensure the neighborhood's upkeep meets your expectations",
      "In HOA communities, the HOA often covers front yard landscaping, road maintenance, and shared amenities — factor this into the value equation",
      "Ask about future HOA formation — some communities start without an HOA but establish one as they develop",
    ],
    faqItems: [
      { q: 'Why do some new construction communities have HOAs?', a: "HOAs in new construction communities manage shared amenities (pools, parks, trails), enforce appearance standards, and maintain common areas. Builders often establish HOAs to protect property values and ensure consistent community appearance." },
      { q: "Are communities without HOAs lower quality?", a: "Not at all. Many of Utah's most desirable new construction communities operate without HOAs. HOA presence is more a function of community design (planned vs. subdivision) than quality." },
      { q: 'What are typical HOA fees in Utah new construction?', a: "Utah new construction HOA fees typically range from $35/month (basic maintenance) to $250+/month (full amenity communities with pools, clubhouses, trails). Some communities charge both a monthly fee and special assessments." },
    ],
    cta: "We'll help you identify which current communities in your target area are HOA-free.",
  },
  {
    slug: 'basement',
    title: 'Best Utah Builders that Include Basements',
    headline: 'Utah New Construction with Basements: Best Builders and Communities',
    metaTitle: 'Utah New Construction Homes with Basement 2025 | BuildSmart Utah',
    metaDescription: 'Find Utah new construction builders that offer basements. Compare which builders include finished vs unfinished basements, basement costs, and communities with basement options.',
    intro: "In Utah, a basement isn't just extra storage — it's often 800–1,200 square feet of potential living space that can add $80K–$150K in finished value. But basement availability, standard inclusion, and finish costs vary dramatically between builders and communities. Here's what you need to know.",
    builderSlugs: ['richmond-american', 'ivory-homes', 'perry-homes', 'hamlet-homes', 'toll-brothers'],
    whyTheseBuildersIntro: "These builders consistently offer basement options across their Utah communities, with clear pricing for both unfinished and finished configurations.",
    builderReasons: {
      'richmond-american': "Richmond American offers basements in most Utah communities, with rough-in plumbing standard and finished basement options available through their design center. Unfinished basements are typically included; finishing adds $40K–$80K.",
      'ivory-homes': "As Utah's largest builder, Ivory has extensive basement experience across all price points. Many Ivory floor plans are designed with basements in mind from the foundation up.",
      'perry-homes': "Perry offers walkout basements in communities with suitable topography and standard basement rough-ins across most floor plans.",
      'hamlet-homes': "Hamlet's semi-custom approach means genuine flexibility on basement configuration — finished, partially finished, or unfinished with whatever rough-in plumbing you want.",
      'toll-brothers': "Toll Brothers' luxury communities in Utah include basement options with premium finish packages through their design studios.",
    },
    buyerTips: [
      "Ask specifically: 'Is a basement included, or is it an upgrade?' — some builders include an unfinished basement as standard; others charge $15K–$30K just for the excavation",
      "Rough-in plumbing in the basement (for a future bathroom) is cheap to add now (~$1,500–$3,000) and expensive to add later ($8K–$15K)",
      "An unfinished basement adds value at resale even without finishing — buyers see potential",
      "A finished basement permit is required in Utah — builder-finished basements have permits; post-close DIY may not",
      "Ask about egress windows — required for legal bedrooms in a finished basement, and easier to include during construction",
    ],
    faqItems: [
      { q: 'How much does a basement cost to finish in Utah?', a: "Builder-finished basements in Utah typically cost $35–$65/sqft through the builder's design center. A 1,000 sqft basement runs $35,000–$65,000 finished. Post-close contractor finishing is often 20-30% less but requires separate permits and takes longer." },
      { q: 'Is an unfinished basement worth it if I might not finish it?', a: "Yes. An unfinished basement adds value at resale because buyers can envision the potential. It also provides storage, utility space, and a mechanical room. The marginal cost of including a basement during construction is far less than adding one later (which is extremely expensive or impossible)." },
      { q: 'What is a walkout basement?', a: "A walkout basement has at least one full-size door or set of doors that open to grade level — typically at the back of the home where the lot slopes away. Walkouts allow natural light and direct exterior access, making them easier to finish as legal living space." },
    ],
    cta: "Tell us your basement requirements and we'll match you with communities that deliver.",
  },
  {
    slug: 'utah-county',
    title: 'Best New Construction Home Builders in Utah County',
    headline: 'The Best New Construction Home Builders in Utah County (2025)',
    metaTitle: 'Best New Construction Home Builders Utah County 2025 | BuildSmart Utah',
    metaDescription: 'Compare every new construction home builder active in Utah County — Lehi, Saratoga Springs, Eagle Mountain, Vineyard, Spanish Fork, Springville, and Payson. Free buyer guidance.',
    intro: "Utah County is the most active new construction market in the state, with major developments in Lehi's tech corridor, the rapidly growing cities of Saratoga Springs and Eagle Mountain, and established communities in Provo, Spanish Fork, and Springville. Over a dozen builders are currently active in Utah County across a wide range of price points.",
    builderSlugs: ['richmond-american', 'perry-homes', 'edge-homes', 'ivory-homes', 'lennar', 'woodside-homes', 'meritage-homes'],
    whyTheseBuildersIntro: "These builders have the strongest Utah County presence with the most active communities across Lehi, Saratoga Springs, Eagle Mountain, Vineyard, and surrounding cities.",
    builderReasons: {
      'richmond-american': "Richmond American has multiple active communities across Utah County cities including Saratoga Springs, Eagle Mountain, and Spanish Fork — one of the broadest Utah County footprints of any builder.",
      'perry-homes': "Perry Homes is deeply rooted in Utah County with communities from Lehi down through Spanish Fork, offering competitive pricing with strong included features.",
      'edge-homes': "Edge focuses heavily on Utah County with communities in Saratoga Springs, Eagle Mountain, and Traverse Mountain — known for well-designed communities and competitive lot selection.",
      'ivory-homes': "Ivory is Utah's largest builder with significant Utah County presence across all price points and multiple active communities.",
      'lennar': "Lennar's Utah County communities are popular for their 'Everything's Included' model, eliminating design center upgrade anxiety.",
      'woodside-homes': "Woodside has expanded into Utah County with competitive pricing and clean modern designs.",
      'meritage-homes': "Meritage brings national builder capabilities with a focus on energy efficiency — their Utah County communities feature built-in efficiency upgrades.",
    },
    buyerTips: [
      "Commute to Salt Lake City from Eagle Mountain and Saratoga Springs can be 45–60 minutes during peak hours — test drive the commute at rush hour before committing",
      "Lehi and Vineyard are closest to the tech corridor (Adobe, Qualtrics, IM Flash) with shorter commutes but higher price points",
      "Eagle Mountain and Saratoga Springs offer the most affordable new construction in Utah County with newer infrastructure",
      "Spanish Fork and Springville are underrated — established cities with good schools and lower land costs translating to better value",
      "Ask about planned infrastructure: schools, roads, and commercial development coming to the specific area affect long-term value",
    ],
    faqItems: [
      { q: 'What are the most affordable cities for new construction in Utah County?', a: "Eagle Mountain, Saratoga Springs, and Payson consistently offer the most affordable new construction in Utah County, with entry-level homes available below $450,000 from several builders." },
      { q: 'Which Utah County cities have the best schools for new construction buyers?', a: "Alpine School District (Lehi, Cedar Hills, American Fork, Saratoga Springs, Eagle Mountain) and Nebo School District (Spanish Fork, Springville, Salem) both have strong reputations. Check specific school ratings at GreatSchools.org for your target neighborhood." },
      { q: 'Is Utah County growing too fast?', a: "Utah County is one of the fastest-growing counties in the US. Growth brings new amenities and infrastructure but also traffic and congestion. Buy for your lifestyle today and the infrastructure of the next 5 years — not the next 30." },
    ],
    cta: "We know every active Utah County community. Let us help you find the right one.",
  },
  {
    slug: 'salt-lake-county',
    title: 'Best New Construction Home Builders in Salt Lake County',
    headline: 'New Construction Home Builders in Salt Lake County (2025 Guide)',
    metaTitle: 'Best New Construction Home Builders Salt Lake County 2025 | BuildSmart Utah',
    metaDescription: 'Compare new construction builders in Salt Lake County — South Jordan, Herriman, Riverton, Draper, Bluffdale, and West Jordan. Current communities, prices, and incentives.',
    intro: "Salt Lake County new construction is concentrated in the south end — Herriman, Bluffdale, South Jordan, and Riverton — where land remains available for master-planned communities. The northern and central parts of the county are largely built out, making new construction a southern sub-market with its own dynamics, commute patterns, and price premiums.",
    builderSlugs: ['toll-brothers', 'ivory-homes', 'richmond-american', 'hamlet-homes', 'lennar', 'garbett-homes'],
    whyTheseBuildersIntro: "These builders have the strongest Salt Lake County presence with active communities in Herriman, South Jordan, Bluffdale, and Draper.",
    builderReasons: {
      'toll-brothers': "Toll Brothers has premium communities in the Traverse Mountain and Salt Lake County luxury corridor, targeting buyers who want proximity to Salt Lake City with new construction quality.",
      'ivory-homes': "Ivory is active throughout Salt Lake County with communities across price points and a deep knowledge of local markets built over decades.",
      'richmond-american': "Richmond has strong Salt Lake County presence with communities in Herriman and surrounding areas, offering a range of price points.",
      'hamlet-homes': "Hamlet's semi-custom approach is popular with Salt Lake County buyers who want to be close to the city but have more design flexibility than production builders offer.",
      'lennar': "Lennar's Salt Lake County communities are positioned for buyers who want value certainty and the 'Everything's Included' model.",
      'garbett-homes': "Garbett's Salt Lake City and nearby communities are unique — energy-efficient, solar-included homes in established urban and suburban contexts rather than distant master-planned communities.",
    },
    buyerTips: [
      "Herriman and Bluffdale are the fastest-growing new construction cities in Salt Lake County — more inventory but longer commutes to downtown Salt Lake",
      "South Jordan and Riverton command a slight price premium for established schools, retail, and shorter commutes",
      "Garbett's urban-adjacent builds near Salt Lake City proper are rare — if walkability and urban access matter, explore these specifically",
      "I-15 congestion southbound from Herriman and Bluffdale into Salt Lake is real — the Mountain View Corridor (Bangerter Hwy extension) has improved but plan accordingly",
      "Salt Lake County new construction is priced 10-20% above comparable Utah County homes — you're paying for proximity and established infrastructure",
    ],
    faqItems: [
      { q: 'Where is most of the new construction in Salt Lake County?', a: "The vast majority of Salt Lake County new construction is in the southern cities: Herriman, Bluffdale, South Jordan, and Riverton. Limited new construction exists in Draper, Sandy, and West Jordan due to land constraints." },
      { q: 'Is Salt Lake County new construction more expensive than Utah County?', a: "Generally yes — by 10–20% for comparable homes. The premium reflects proximity to Salt Lake City, established infrastructure, and typically shorter commutes." },
      { q: 'What about new construction in Draper or Sandy?', a: "New construction in Draper and Sandy is very limited — these cities are largely built out. Occasional infill projects and tear-down rebuilds occur, but active new construction communities are rare. Your options are primarily in Herriman, Bluffdale, South Jordan, and Riverton." },
    ],
    cta: "We track every active Salt Lake County community. Let's find your fit.",
  },
];

// Helper: get Builder objects for a category's builderSlugs
export function getCategoryBuilders(category: BuilderCategory): Builder[] {
  return category.builderSlugs
    .map((slug) => mockBuilders.find((b) => b.slug === slug))
    .filter((b): b is Builder => b !== undefined);
}
