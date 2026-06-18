export interface Article {
  slug: string;
  title: string;
  description: string;
  category: 'buying-process' | 'financing' | 'builders-communities' | 'negotiation' | 'incentives';
  categoryLabel: string;
  readTime: number; // minutes
  publishedDate: string;
  content: Section[];
}

export interface Section {
  heading?: string;
  body?: string;
  list?: string[];
  tip?: string; // renders as a gold callout box
  warning?: string; // renders as a navy callout box
}

export const articles: Article[] = [
  {
    slug: 'do-i-need-a-buyers-agent-for-new-construction',
    title: "Do I Need a Buyer's Agent for New Construction?",
    description: "The builder's sales rep works for the builder — not you. Here's exactly what you gain (and what you risk losing) by going unrepresented.",
    category: 'buying-process',
    categoryLabel: 'Buying Process',
    readTime: 5,
    publishedDate: '2025-01-15',
    content: [
      { body: "When you walk into a new construction model home, you'll be greeted by a friendly sales representative. They'll give you a tour, answer your questions, and offer you a purchase agreement. What they won't tell you: they work for the builder, not for you." },
      { heading: "The Commission Myth", body: "Most buyers assume that using a buyer's agent will cost them more money. It won't. Builder-paid buyer agent commissions are baked into every builder's sales and marketing budget. Whether or not you bring an agent, you pay the same purchase price. The only question is who gets the commission — you (in the form of negotiated benefits) or the builder (as extra margin)." },
      { tip: "Register your agent before your first official appointment with a builder's sales rep. Many builders have 'first contact' policies that can disqualify you from having representation if you visit unregistered." },
      { heading: "What a Buyer's Agent Actually Does", list: ["Reviews the purchase contract for builder-favorable clauses before you sign", "Negotiates lot premiums, upgrade credits, closing cost assistance, and rate buydowns", "Advises which upgrades add resale value vs. personal preference", "Attends pre-drywall and final walkthroughs with you", "Connects you with independent inspectors (builder inspections aren't independent)", "Helps you compare lender incentive packages across preferred and outside lenders"] },
      { heading: "The Risk of Going Unrepresented", body: "New construction contracts heavily favor the builder. Earnest money terms, construction delays, material substitution clauses, and warranty limitations are all written by the builder's legal team. An experienced new construction agent knows what's standard vs. what should be pushed back on." },
      { warning: "If you visit a builder's model home and register your information without an agent, the builder may refuse to allow representation later — even if you haven't signed anything. Always register your agent first." },
      { heading: "The Bottom Line", body: "Free representation from a specialist who knows every builder's contract, knows what to negotiate, and has no financial incentive to push you toward any particular community — that's the offer. There's no rational reason to go without it." },
    ],
  },
  {
    slug: 'how-builder-incentives-really-work',
    title: 'How Builder Incentives Really Work (And How to Get the Best Deal)',
    description: "Rate buydowns, closing cost credits, upgrade packages — builders offer them all. But they're not always what they seem. Here's how to evaluate and maximize every dollar.",
    category: 'incentives',
    categoryLabel: 'Incentives',
    readTime: 6,
    publishedDate: '2025-01-22',
    content: [
      { body: "Utah home builders advertise incentives constantly — rate buydowns, closing cost assistance, design center credits, price reductions. These offers are real, but understanding how they work (and how to compare them) is what separates a good deal from a great one." },
      { heading: "Types of Builder Incentives", list: ["Rate Buydown: Builder pays points to lower your mortgage rate (permanently or for 2-3 years)", "Closing Cost Assistance: Builder credit applied at closing to cover lender fees, title, etc.", "Design Center Credits: Dollar amount toward upgrades — flooring, cabinets, counters, fixtures", "Price Reduction: Straight discount off the purchase price", "Lot Premium Waiver: Builder waives the extra cost for a premium lot (cul-de-sac, view, larger)"] },
      { heading: "The Preferred Lender Trap", body: "Builders typically tie their best incentives to their preferred lender. A builder might offer $15,000 in closing costs — but only if you use their in-house lender. This isn't inherently bad, but it requires careful math." },
      { tip: "Always get a competing quote from an outside lender. Compare total cost of ownership (rate × loan term + closing costs), not just the interest rate. Sometimes a higher rate with $15K in credits beats a lower rate without them." },
      { heading: "How Rate Buydowns Work", body: "A 2-1 buydown reduces your rate by 2% in year one, 1% in year two, then resets to your permanent rate in year three. A permanent buydown (buying points) lowers your rate for the life of the loan. On a $500K loan, 1 point costs roughly $5,000 and lowers your rate by about 0.25% — saving roughly $80/month permanently." },
      { heading: "Design Center Credits: Spend Them Wisely", list: ["Prioritize: hardwood/LVP over carpet (resale value)", "Prioritize: larger kitchen island, quartz counters over granite (perceived value)", "Avoid: trendy colors, specialty tiles that date quickly", "Skip: upgraded appliances (often cheaper to buy retail post-close)", "Skip: media/tech packages (overpriced vs. aftermarket)"] },
      { warning: "Unused design center credits typically cannot be converted to cash or a price reduction. Spend them intentionally — not just to use them up." },
      { heading: "Timing Matters", body: "Incentives are usually strongest at two moments: end of quarter (builders hitting sales targets) and when a spec home has been sitting for 30+ days. If a home is still listed after a month, the builder will often negotiate more aggressively. Ask your agent to check days-on-market." },
    ],
  },
  {
    slug: 'spec-vs-dirt-build-which-is-right-for-you',
    title: 'Spec Home vs. Dirt Build: Which Is Right for You?',
    description: "Buy a move-in-ready spec home or choose your lot and floor plan from scratch? Each path has real trade-offs. Here's how to decide.",
    category: 'buying-process',
    categoryLabel: 'Buying Process',
    readTime: 5,
    publishedDate: '2025-02-01',
    content: [
      { body: "When buying new construction in Utah, you have two fundamentally different paths: a spec home (already built or under construction) or a dirt build (you buy a lot and choose a floor plan). Each has real advantages — and real trade-offs." },
      { heading: "Spec Homes: Speed and Certainty", body: "A spec home is one the builder started without a specific buyer in mind. It may be move-in ready, or it may be weeks from completion. Either way, you know exactly what you're getting: the lot, the floor plan, the finishes — no surprises." },
      { list: ["Move-in timelines of 0–90 days", "Finishes already selected (you see exactly what you're buying)", "Often eligible for rate lock immediately (less rate risk)", "Builders are more motivated to negotiate on price and incentives", "No design center decisions — less stress, faster process"] },
      { heading: "Dirt Builds: Customization and Control", body: "A dirt build means you sign a contract, then visit the design center to choose your finishes before construction begins. You'll typically wait 6–10 months for completion." },
      { list: ["Choose your lot (corner, cul-de-sac, backing to open space)", "Select all finishes to your taste", "Upgrade strategically at design center pricing", "Choose your floor plan from available options", "More time to prepare financially (close in 6-10 months)"] },
      { tip: "If you need to move within 90 days or want rate certainty right now, go spec. If you have 6+ months and want to personalize, a dirt build is worth it — but budget an extra $20–50K for design center upgrades beyond what's included." },
      { heading: "The Hidden Advantage of Spec Homes in a Down Market", body: "When builder inventory is sitting, spec homes become negotiating leverage. A builder carrying a completed home pays carry costs every month. That urgency means more room to negotiate lot premiums, rate buydowns, and closing cost credits." },
      { heading: "Questions to Ask Your Agent", list: ["How long has this spec home been on market?", "What's included vs. what's an upgrade in this community?", "What floor plan options are available for dirt builds?", "What's the current completion estimate and how firm is that?", "Can we negotiate the lot premium on a dirt build?"] },
    ],
  },
  {
    slug: 'understanding-new-construction-contracts',
    title: 'Understanding New Construction Contracts: 7 Things to Know Before You Sign',
    description: "New construction purchase agreements are nothing like resale contracts. They're written by builder lawyers to protect the builder. Here's what to watch for.",
    category: 'buying-process',
    categoryLabel: 'Buying Process',
    readTime: 7,
    publishedDate: '2025-02-10',
    content: [
      { body: "The purchase agreement you sign with a new construction builder is typically 30–60 pages long, written by the builder's legal team, and heavily weighted in the builder's favor. Understanding the key provisions before you sign can save you significant money — and stress." },
      { heading: "1. Non-Refundable Earnest Money", body: "Many builder contracts make earnest money (typically $5,000–$20,000+) non-refundable after a short review period (3–10 days). Unlike resale where earnest money is often refundable during inspection, builder contracts may keep your deposit even if you cancel for legitimate reasons." },
      { heading: "2. Material Substitution Clauses", body: "Builders reserve the right to substitute materials of 'equal or greater value' without your approval. This means the specific flooring, cabinets, or fixtures you selected could be swapped without notice. Get any material commitments in writing as an addendum." },
      { heading: "3. Construction Delay Provisions", body: "Builder contracts almost always allow for delays — sometimes open-ended. Force majeure clauses cover weather, supply chain, and labor. Some contracts allow the builder to delay indefinitely without penalty. Know your rights and the cancellation terms if delays become extreme." },
      { warning: "If you're locking a mortgage rate, understand that builder delays can cause your rate lock to expire. Budget for a rate lock extension (typically 0.125–0.25% of loan amount per month) if your timeline is uncertain." },
      { heading: "4. Right to Modify Plans", body: "Builders may change floor plans, elevation styles, or community layout based on permitting, engineering, or business decisions. Your contract may allow them to build a different elevation than what you selected if supply issues arise." },
      { heading: "5. Warranty Limitations", body: "Builder warranties are typically: 1 year workmanship/materials, 2 years mechanical systems, 10 years structural. What's not covered matters as much as what is. Get the full warranty booklet before closing and note what's excluded." },
      { heading: "6. Preferred Lender Requirements", body: "Some incentive packages require you to close with the builder's preferred lender. If you switch lenders, you may forfeit significant credits. Understand this before committing — and make sure your outside lender quote is genuinely better after accounting for lost incentives." },
      { tip: "Ask for an addendum that lists every incentive explicitly — the dollar amount, what it covers, and any conditions. Verbal promises from sales reps don't hold up." },
      { heading: "7. HOA Disclosures", body: "If the community has an HOA, you have a right to review CC&Rs, bylaws, and budget before closing. HOA fees, special assessments, and restrictions (fencing, landscaping, parking) can materially affect your lifestyle and resale value. Don't skip this." },
      { heading: "The Bottom Line", body: "A new construction contract review isn't optional — it's how you protect a $400K–$700K purchase. An experienced new construction buyer's agent knows what's standard, what's negotiable, and what's a red flag." },
    ],
  },
  {
    slug: 'utah-new-construction-rate-buydowns-explained',
    title: 'Utah Builder Rate Buydowns Explained: 2-1, 3-2-1, and Permanent Buydowns',
    description: "Builders across Utah are offering to buy down your mortgage rate. Here's exactly how each type works, what it costs the builder, and how to decide if it's worth it.",
    category: 'financing',
    categoryLabel: 'Financing',
    readTime: 6,
    publishedDate: '2025-02-18',
    content: [
      { body: "Rate buydowns have become one of the most popular builder incentives in Utah's higher-rate environment. But not all buydowns are equal — and knowing the difference between a 2-1 buydown, a 3-2-1 buydown, and permanent points helps you evaluate which offer is actually best for your situation." },
      { heading: "How a 2-1 Buydown Works", body: "With a 2-1 buydown, your rate is reduced by 2% in year one, 1% in year two, then resets to your permanent note rate in year three. Example: if your note rate is 6.5%, you pay 4.5% in year one, 5.5% in year two, 6.5% from year three onward." },
      { tip: "A 2-1 buydown doesn't change your note rate — it only subsidizes the difference in years 1 and 2. If rates fall and you refinance in year 2, you've received the subsidy without needing the full term. This is often the best scenario." },
      { heading: "How a 3-2-1 Buydown Works", body: "Same concept but the reduction starts at 3% below your note rate in year one. Example at 6.5% note rate: 3.5% year one, 4.5% year two, 5.5% year three, 6.5% from year four onward. This costs the builder more and is less common — but worth asking for on slower-moving inventory." },
      { heading: "Permanent Buydown (Discount Points)", body: "Paying discount points permanently reduces your note rate. Each point costs 1% of the loan amount and typically reduces the rate by 0.25%. On a $500K loan: 1 point = $5,000 cost, saves roughly $80/month. Break-even: $5,000 ÷ $80 = ~62 months (5 years). If you plan to stay or hold for 5+ years, permanent points often beat a 2-1 buydown." },
      { heading: "Which Is Better?", list: ["2-1 buydown: Best if you expect to refinance within 2-3 years (common in higher-rate environments)", "Permanent points: Best if you plan to hold long-term and rates aren't expected to fall significantly", "Closing cost credit: Best if you're short on cash to close or plan to refinance soon anyway"] },
      { heading: "How to Compare Offers", body: "Don't compare rate buydowns in isolation — compare total cost of ownership. Take the builder's preferred lender offer AND an outside lender offer, calculate total payments over your expected holding period for each, then subtract any builder credits. The one with the lowest net cost wins." },
      { warning: "Watch for builders who advertise a low 'buydown rate' in year one as if it's your permanent rate. Always ask: 'What is the note rate?' That's the rate that matters for qualification and long-term payments." },
    ],
  },
  {
    slug: 'how-to-pick-the-right-utah-builder',
    title: "How to Pick the Right Utah Builder: 8 Questions to Ask Before You Commit",
    description: "Not all Utah builders are equal. Quality, warranty, trade relationships, and communication standards vary significantly. Here's how to evaluate before you sign.",
    category: 'builders-communities',
    categoryLabel: 'Builders & Communities',
    readTime: 6,
    publishedDate: '2025-03-01',
    content: [
      { body: "Utah has over 20 active new construction builders ranging from national production builders to local custom-adjacent builders. The right one for you depends on your budget, timeline, quality expectations, and what's actually available in your target area. Here are the questions that matter." },
      { heading: "1. How Long Have They Been Building in Utah?", body: "Local longevity matters. A builder who has been in Utah for 20+ years has established trade relationships, knows local permitting timelines, and has a track record you can research. National builders sometimes bring regional teams with limited local experience." },
      { heading: "2. What Is Their Warranty Program?", body: "All builders are required by Utah law to provide certain structural warranties. But the voluntary workmanship and mechanical warranties vary significantly — from 1-year basic coverage to comprehensive 10-year transferable warranties. A transferable warranty adds resale value." },
      { heading: "3. What's Included vs. What's an Upgrade?", body: "Two builders quoting $500K may deliver very different homes. One includes LVP flooring, quartz counters, and a full appliance package. Another's $500K is entry-level with carpet, laminate, and basic fixtures. Always compare 'as-built at comparable price,' not just sticker price." },
      { tip: "Ask for a spec sheet of standard inclusions before visiting the design center. This tells you what you're actually starting with and what the design center is selling you on top of." },
      { heading: "4. What Are Their Current Completion Times?", body: "Builder estimates for completion vary widely and can shift with trade availability. Ask specifically: 'What is the current completion time for a dirt build in this community?' Then talk to buyers who've recently closed to verify." },
      { heading: "5. Do They Use Framed or Concrete Construction?", body: "Most Utah production builders use wood frame. Some (particularly in higher-end or green-build segments) offer ICF (insulated concrete form) foundations or full ICF walls. Know what you're buying — it affects energy efficiency, sound, and long-term maintenance." },
      { heading: "6. What Is Their Service Record Post-Close?", body: "A builder's warranty is only as good as their service team. Search '[Builder Name] Utah warranty' and '[Builder Name] Utah complaints' online. Read recent Google and Yelp reviews specifically mentioning warranty service — not just the sales experience." },
      { heading: "7. Are They Financially Stable?", body: "Builder bankruptcies do happen. A builder that goes under mid-construction leaves buyers in a difficult position. Stick with established builders, or if buying from a smaller builder, research their financial backing and how many active projects they're running." },
      { heading: "8. What Communities Do They Have in My Target Area?", body: "Even if a builder has great overall reviews, their communities may not be where you need to be. Match the builder to your commute requirements, school district preferences, and lifestyle priorities — then evaluate quality." },
      { warning: "Never choose a builder based solely on the model home. Model homes are staged with every upgrade selected and professionally decorated. Ask to walk a 'base plan' home with standard finishes before committing." },
    ],
  },
  {
    slug: 'navigating-the-design-center',
    title: "Navigating the Builder Design Center: How to Spend Your Credits Wisely",
    description: "The design center is exciting — and expensive. Most buyers spend $30K–$80K beyond what's included. Here's how to prioritize and avoid costly mistakes.",
    category: 'buying-process',
    categoryLabel: 'Buying Process',
    readTime: 5,
    publishedDate: '2025-03-10',
    content: [
      { body: "After signing your new construction contract, you'll be scheduled for a design center appointment — typically 4–8 hours of choosing finishes for your new home. It's one of the most exciting (and financially dangerous) parts of the process." },
      { heading: "What to Expect", body: "You'll walk through showrooms selecting: flooring, cabinetry, countertops, plumbing fixtures, lighting, door hardware, tile, paint colors, and optional upgrades (fireplace, outdoor living, media packages, etc.). A design consultant guides you through — but remember, they work for the builder." },
      { heading: "High-Value Upgrades (Worth the Money)", list: ["Hardwood or luxury vinyl plank over carpet in main living areas — adds resale value and durability", "Kitchen island extension — more counter space is always wanted at resale", "Quartz countertops in kitchen — perceived as standard in your price range", "Soft-close cabinets and drawers — buyers notice this at resale", "Pre-wire for future ceiling fans and exterior outlets — cheap now, expensive later", "Rough-in plumbing in basement — dramatically lowers future finish costs"] },
      { heading: "Low-Value Upgrades (Skip if Budget Is Tight)", list: ["Appliance packages — buy Samsung, LG, or Bosch at Costco post-close for 30-40% less", "Media/technology packages — overpriced vs. aftermarket installation", "Trendy tile in secondary bathrooms — dates quickly and matters less at resale", "Window treatments — buy quality blinds retail after close", "Upgraded carpet in bedrooms — any carpet will be replaced before you sell anyway"] },
      { tip: "Before your design center appointment, tour model homes from other builders and note which finishes look timeless vs. trendy. Classic white/gray/natural palettes have the broadest buyer appeal at resale." },
      { heading: "How to Use Your Credits", body: "If the builder gave you a design center credit (say $10,000), you must spend it at the design center — it typically cannot be converted to cash. Spend it on structural or hard-surface upgrades that are expensive to change later: flooring, counters, cabinet finishes, tile work." },
      { heading: "Managing the Upsell", body: "Design center consultants are trained to present upgrades as a small monthly payment increase rather than a total cost. A $15,000 upgrade sounds like '$60/month' on a 30-year mortgage. Always think in total dollars, not monthly payments." },
      { warning: "Your design center selections are legally binding once signed. Take photos of every sample you select and keep copies of your design center paperwork. Discrepancies between what you selected and what gets installed do happen — documentation is your protection." },
    ],
  },
  {
    slug: 'what-to-negotiate-with-a-utah-builder',
    title: "What Can You Actually Negotiate With a Utah Home Builder?",
    description: "Most buyers think new construction prices are fixed. They're not. Here's what's negotiable — and how to negotiate it without killing the deal.",
    category: 'negotiation',
    categoryLabel: 'Negotiation',
    readTime: 5,
    publishedDate: '2025-03-18',
    content: [
      { body: "One of the most common misconceptions about buying new construction is that the price is the price. In reality, Utah builders have significant flexibility — especially on spec homes, end-of-quarter pushes, and in slower markets. Here's what's actually on the table." },
      { heading: "What Builders Can Negotiate", list: ["Lot premiums — often $5,000–$30,000 added to base price for corner lots, cul-de-sacs, or view lots. These are frequently waivable.", "Design center credits — builders can add credits beyond advertised offers when motivated to close.", "Closing cost assistance — a builder credit at closing reduces your out-of-pocket, often negotiable up to 2-3% of purchase price.", "Rate buydowns — the size and structure of the buydown is negotiable, especially on spec homes.", "Fencing or landscaping — front yard landscaping completion, side fence inclusion, or tree planting are common asks.", "Appliance upgrades — adding a refrigerator, washer/dryer, or upgraded range to the contract.", "HOA prepayment — some builders will prepay 6–12 months of HOA fees.", "Earnest money terms — occasionally negotiable, especially if you're asking for extended close timelines."] },
      { heading: "What Builders Won't Typically Negotiate", list: ["Base price (publicly listed) — builders protect their comps for future sales in the same community", "Material substitutions mid-build — once construction is underway, structural changes are off the table", "Warranty terms — these are standardized across the builder's operation"] },
      { tip: "Spec homes are the highest-leverage negotiation scenario. A completed home costs the builder money every month it sits — property taxes, insurance, utilities, and opportunity cost. Ask your agent to check how long the home has been listed." },
      { heading: "How to Negotiate Without Killing the Deal", body: "Builder sales reps don't have unilateral authority. They escalate requests to a sales manager. The most effective approach: make a specific, reasonable request (not a lowball), frame it as 'what would it take to sign today,' and be prepared to close quickly if they say yes." },
      { heading: "Timing Leverage", body: "End of month and end of quarter are the highest-leverage times. Builders have sales targets and their reps earn bonuses on monthly and quarterly numbers. A deal that closes by the 30th is worth more to a rep than one that closes on the 5th of next month." },
      { warning: "Never tell the builder's sales rep your maximum budget. Once they know your ceiling, there's no incentive to offer you anything below it. Let your agent handle price conversations." },
    ],
  },
];
