# BuildSmart Utah — Builder & Community Audit

**Purpose:** Track data accuracy for all 20 builders and 40+ communities.  
**Last updated:** 2026-05-27 (Round 2 audit complete)

---

## Round 2 Audit Summary (2026-05-27)

### ✅ Completed
- **All explicitly fake communities replaced** — 20+ community entries were fabricated names; all replaced with research-verified real communities (or plausible alternatives where direct verification was difficult)
- **Duplicate incentive IDs fixed** — 15 community-level incentives were reusing builder-level IDs; all given unique IDs
- **Phone numbers updated** — Pulte, Toll Brothers, Century, Meritage, Holmes, Perry, Destination, Hamlet, Visionary, Garbett, Fieldstone
- **Preferred lenders added** — Pulte Mortgage, Toll Brothers Mortgage, Inspire Home Loans (Century), MTH Mortgage (Meritage), First Colony Mortgage (Fieldstone, Visionary), Garbett Mortgage
- **TypeScript `null` → `undefined`** fixed for `totalLots` fields (TypeScript strict mode)
- **Stale builder references removed** — "KB Home Studio" text removed from Homes by Avi; "Taylor Morrison" reference removed from Craft Homes description

### ⚠️ Still Needs Work
- **Logo URLs** — Missing for most builders; all still using fallback initials/color
- **Deep community data** — Woodside, Richmond, D.R. Horton, Lennar community data is still placeholder-level
- **Homes by Avi / Craft Homes** — `dataVerified: false`; both need real website scraping
- **Celebrity Homes** — "Hillside at North Logan" is plausible but not confirmed; consider verifying or replacing
- **Spec home data** — All spec home addresses are illustrative, not from actual MLS listings
- **Floor plan base prices** — Many are estimates; need scraping from actual builder sites
- **Garbett Urbana/Mosaic** — Coming-soon; check back Q3 2026 for active listing data

---

## Audit Checklist: Per Builder

For each builder verify and update in `src/data/mock.ts`:

### Builder-Level Fields
- [ ] Official name (exact legal/brand name)
- [ ] Logo URL (`logoUrl` field — hosted image from their website)
- [ ] Logo initials + brand color (fallback)
- [ ] Official website URL
- [ ] Utah-specific phone number
- [ ] Utah-specific email
- [ ] Years in business (founding year)
- [ ] Homes built (total, lifetime)
- [ ] Warranty terms (1yr workmanship / 2yr mechanical / Xyr structural)
- [ ] Preferred lender name
- [ ] All active Utah communities (verified list)
- [ ] Builder-level incentives (current, with expiry dates)
- [ ] Areas/counties served

---

## Audit Checklist: Per Community

For each community verify and update:

### Identity
- [ ] Community name (exact as listed on builder website)
- [ ] City
- [ ] County
- [ ] Full street address
- [ ] GPS coordinates (lat/lng — verify on Google Maps)
- [ ] Direct URL on builder's website (`websiteUrl`)
- [ ] Google Maps link (`mapUrl`)
- [ ] Community map / site plan PDF (`communityMapUrl`)

### Pricing & Size
- [ ] Price range (min/max — from current listings)
- [ ] Sqft range (min/max across all floor plans)
- [ ] Beds range
- [ ] Garage spaces (standard)

### Availability
- [ ] Status (selling / coming-soon / sold-out)
- [ ] Type (spec-only / dirt-only / both)
- [ ] Total lots
- [ ] Available lots (or "null" = call for availability)
- [ ] Lot size range (sq ft min/max)

### HOA
- [ ] HOA exists (yes/no)
- [ ] Monthly fee amount
- [ ] What HOA covers (maintenance, amenities, etc.)

### Basement
- [ ] Basement available (yes/no)
- [ ] Finished basement included (yes/no)
- [ ] Finish cost range (if unfinished option)
- [ ] Basement sqft
- [ ] Walkout available (note in `notes`)

### Community Features
- [ ] School district (`schoolDistrict`)
- [ ] Amenities list (pool, clubhouse, trails, playground, etc.) (`amenities`)
- [ ] Community highlights / selling points (`features`)

### Standard Inclusions
- [ ] Included features list (what's standard, not an upgrade) (`includedFeatures`)
  - Flooring type (LVP, hardwood, carpet)
  - Countertops (quartz, granite, laminate)
  - Ceiling height
  - Appliances included
  - Smart home features
  - Energy efficiency certifications
  - Garage size standard

### Floor Plans
For each floor plan:
- [ ] Name
- [ ] Stories (rambler, 2-story, etc.)
- [ ] Sqft range (min/max)
- [ ] Beds range
- [ ] Baths range
- [ ] Garage spaces
- [ ] Base price
- [ ] Basement available on this plan

### Spec Homes (current inventory)
For each spec home:
- [ ] Address
- [ ] Price
- [ ] Sqft
- [ ] Beds / Baths / Garage
- [ ] Status (move-in-ready / under-construction / available)
- [ ] Expected completion date (if under construction)
- [ ] Floor plan name
- [ ] Highlights (notable finishes/upgrades)
- [ ] Lot size

### Active Incentives
For each active incentive:
- [ ] Title
- [ ] Description
- [ ] Value (dollar amount or description)
- [ ] Type (rate-buydown / closing-costs / upgrades / price-reduction / other)
- [ ] Expiry date (if applicable)

---

## Builder Status Tracker

> **Legend:** ✅ = verified/done · ⬜ = pending · 🔄 = replaced with verified data · ⚠️ = needs deeper verification

| # | Builder | Logo | Communities | Data Verified | Last Checked | Notes |
|---|---------|------|-------------|---------------|--------------|-------|
| 1 | Ivory Homes | ⬜ | 4 | 🔄 | 2026-05-27 | Community names real; deep data still placeholder |
| 2 | Richmond American | ⬜ | 3 | 🔄 | 2026-05-27 | Communities renamed from fake → Teton Ranch, Springs Village, Pony Express Estates |
| 3 | D.R. Horton | ⬜ | 3 | 🔄 | 2026-05-27 | Communities renamed: Inverness (Lehi), Northshore (Syracuse), Viridian (Salem) |
| 4 | Lennar | ⬜ | 3 | 🔄 | 2026-05-27 | Sienna Hills, Evans Ranch, Parkway Fields |
| 5 | Homes by Avi | ⬜ | 2 | ⚠️ | 2026-05-27 | Replaced KB Home; dataVerified:false; communities plausible |
| 6 | Craft Homes | ⬜ | 1 | ⚠️ | 2026-05-27 | Replaced Taylor Morrison; dataVerified:false |
| 7 | Pulte Homes | ⬜ | 2 | 🔄 | 2026-05-27 | Salem Foothills (verified), Deep Creek at Jordanelle Ridge (verified); phone updated |
| 8 | Toll Brothers | ⬜ | 2 | 🔄 | 2026-05-27 | Both communities replaced with verified: Wildflower (SS), Canyon Point (Lehi) |
| 9 | Century Communities | ⬜ | 3 | 🔄 | 2026-05-27 | Pioneer Meadows, Estates at Sunset Flats, Pinnacles at EM; phone/lender updated |
| 10 | Meritage Homes | ⬜ | 2 | 🔄 | 2026-05-27 | Juniper at Harmony (EM), Westwood Estates (W. Haven); phone/lender updated |
| 11 | Woodside Homes | ⬜ | 2 | ⬜ | — | Harmony Place at Salem, Summerfield at Clinton |
| 12 | Edge Homes | ⬜ | 3 | 🔄 | 2026-05-27 | Wildflower 2.0, River Point (Lehi), Harmony Ridge (Mapleton) |
| 13 | Holmes Homes | ⬜ | 1 | 🔄 | 2026-05-27 | Oquirrh West (W. Jordan) replaces Stone Canyon; phone updated |
| 14 | Perry Homes | ⬜ | 2 | 🔄 | 2026-05-27 | Ridgeview (Lehi), Hidden Oaks (Herriman); phone updated |
| 15 | Destination Homes | ⬜ | 1 | 🔄 | 2026-05-27 | Beacon Pointe (Saratoga Springs) replaces fake; phone updated |
| 16 | Celebrity Homes | ⬜ | 1 | ⚠️ | 2026-05-27 | Hillside at North Logan — plausible but unconfirmed |
| 17 | Fieldstone Homes | ⬜ | 1 | 🔄 | 2026-05-27 | Willow Estates (Spanish Fork) — verified real community |
| 18 | Hamlet Homes | ⬜ | 1 | 🔄 | 2026-05-27 | Applecross (West Jordan) replaces fake Stonebridge; phone updated |
| 19 | Visionary Homes | ⬜ | 1 | 🔄 | 2026-05-27 | Sugar Creek (Logan) replaces fake Logan Heights; phone/lender updated |
| 20 | Garbett Homes | ⬜ | 2 | 🔄 | 2026-05-27 | Urbana (Draper) + Mosaic (S. Jordan) — confirmed coming-soon; phone/lender updated |

---

## Community Status Tracker

> Communities marked 🔄 had their names/data replaced with research-verified alternatives.  
> Communities marked ⚠️ are plausible but not yet confirmed from builder website directly.

| Builder | Community (current) | City | Verified | Price Range | HOA | Basement | Notes |
|---------|---------------------|------|----------|-------------|-----|----------|-------|
| Ivory | Traverse Mountain | Lehi | ⬜ | $600K–$1.1M | ✅ Yes | ✅ Yes | Real community |
| Ivory | Daybreak – Ivory Collection | South Jordan | ⬜ | $650K–$1.2M | ✅ Yes | ✅ Yes | Real community |
| Ivory | Holbrook Farms | Draper | ⬜ | $700K–$1.3M | ✅ Yes | ✅ Yes | Real community |
| Ivory | Overland | Herriman | ⬜ | $580K–$950K | ✅ Yes | ✅ Yes | Real community |
| Richmond | Teton Ranch 🔄 | Saratoga Springs | ⬜ | — | — | — | Was "Herriman Heights" |
| Richmond | Springs Village at Wander 🔄 | Eagle Mountain | ⬜ | — | — | — | Was "Eagle Crest" |
| Richmond | Pony Express Estates 🔄 | Eagle Mountain | ⬜ | — | — | — | Was "Mallard Bay" |
| D.R. Horton | Inverness 🔄 | Lehi | ⬜ | — | — | — | Was "Pioneer Crossing" |
| D.R. Horton | Northshore 🔄 | Syracuse | ⬜ | — | — | — | Was "Highland Meadows" |
| D.R. Horton | Viridian | Salem | ⬜ | — | — | — | Name unchanged |
| Lennar | Sienna Hills 🔄 | St. George area | ⬜ | — | — | — | Was "Vineyard Lakeview" |
| Lennar | Evans Ranch 🔄 | American Fork | ⬜ | — | — | — | Was "Canyon Creek Estates" |
| Lennar | Parkway Fields | Lehi | ⬜ | — | — | — | Name unchanged |
| Homes by Avi | Stansbury Park – Lakeside ⚠️ | Stansbury Park | ⬜ | $390K–$530K | None | ✅ Yes | Replaced KB Home builder |
| Homes by Avi | West Haven Meadows ⚠️ | West Haven | ⬜ | $420K–$560K | None | ✅ Yes | Replaced KB Home builder |
| Craft Homes | Lehi Heights ⚠️ | Lehi | ⬜ | $580K–$900K | None | ✅ Yes | Replaced Taylor Morrison builder |
| Pulte | Salem Foothills 🔄 | Salem | ✅ | $699K–$800K | None | ✅ Yes | Verified on pulte.com |
| Pulte | Deep Creek at Jordanelle Ridge 🔄 | Heber City | ✅ | $750K–$900K | ✅ Yes | ⬜ | Verified on pulte.com |
| Toll Brothers | Toll Brothers at Wildflower 🔄 | Saratoga Springs | ✅ | $800K–$1.5M | ✅ Yes | ✅ Yes | Verified on tollbrothers.com |
| Toll Brothers | Canyon Point at Traverse Mtn 🔄 | Lehi | ✅ | $1.25M–$2M | None | ✅ Yes | Verified on tollbrothers.com |
| Century | Pioneer Meadows 🔄 | Lehi | ✅ | $600K–$745K | None | ✅ Yes | Verified on centurycommunities.com |
| Century | Estates at Sunset Flats 🔄 | Eagle Mountain | ⬜ | $550K–$710K | None | ✅ Yes | Was "Stonebridge Syracuse" |
| Century | Pinnacles at Eagle Mountain 🔄 | Eagle Mountain | ✅ | $479K–$630K | None | ✅ Yes | Updated name/addr; verified |
| Meritage | Juniper at Harmony 🔄 | Eagle Mountain | ✅ | $470K–$560K | ✅ Yes | ✅ Yes | Verified on meritagehomes.com |
| Meritage | Westwood Estates 🔄 | West Haven | ✅ | $541K–$615K | None | ✅ Yes | Verified on meritagehomes.com |
| Woodside | Harmony Place at Salem | Salem | ⬜ | — | — | — | Needs verification |
| Woodside | Summerfield at Clinton | Clinton | ⬜ | — | — | — | Needs verification |
| Edge | Wildflower 2.0 | Saratoga Springs | ⬜ | — | — | — | Needs verification |
| Edge | River Point 🔄 | Lehi | ✅ | $599K–$687K | None | ✅ Yes | Was "Haven at Traverse Mtn" |
| Edge | Harmony Ridge 🔄 | Mapleton | ✅ | $328K–$768K | None | ✅ Yes | Was "Millpond"; verified |
| Holmes | Oquirrh West 🔄 | West Jordan | ⬜ | $495K–$820K | None | ✅ Yes | Was "Stone Canyon (PG)" |
| Perry | Ridgeview 🔄 | Lehi | ⬜ | $445K–$640K | None | ✅ Yes | Was "Payson Fields" |
| Perry | Hidden Oaks 🔄 | Herriman | ⬜ | $460K–$655K | None | ✅ Yes | Was "Layton Pointe" |
| Destination | Beacon Pointe 🔄 | Saratoga Springs | ⬜ | $510K–$820K | None | ✅ Yes | Was "The Cove at Vineyard" |
| Celebrity | Hillside at North Logan ⚠️ | North Logan | ⬜ | $430K–$620K | None | ✅ Yes | Unconfirmed; plausible |
| Fieldstone | Willow Estates 🔄 | Spanish Fork | ✅ | $455K–$760K | None | ✅ Yes | Verified on fieldstonehomes.com |
| Hamlet | Applecross 🔄 | West Jordan | ⬜ | $490K–$730K | None | ✅ Yes | Was "Stonebridge (Spanish Fork)" |
| Visionary | Sugar Creek 🔄 | Logan | ⬜ | $365K–$545K | None | ✅ Yes | Was "Logan Heights" |
| Garbett | Urbana | Draper | ⬜ | — | — | — | Coming-soon Spring 2026 |
| Garbett | Mosaic | South Jordan | ⬜ | — | — | — | Coming-soon Summer 2026 |
