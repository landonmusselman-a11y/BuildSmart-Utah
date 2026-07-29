# DIVVI — Utah Divorce Platform

**DivviUtah.com** | Free self-help divorce platform for Utah residents
**Repo:** `~/Documents/GitHub/divvi-utah`
**Dev server:** `nohup npm run dev -- -p 3005 > /tmp/divvi-dev.log 2>&1 &` → localhost:3005

---

## What is Divvi?

A free web platform that guides Utah residents through the divorce process — collecting their information through a structured wizard, generating court-ready legal documents, and connecting them to professional help (mediators, attorneys) when needed.

Revenue comes from professional services (mediator sessions, attorney review, AI document audit) and a family co-parenting subscription — not from the core divorce service.

---

## Stack
- **Next.js 16** App Router, TypeScript
- **Supabase** — auth, database (Postgres + RLS), storage
- **Anthropic** — Claude Haiku (stipulation AI), Claude Sonnet (document audit)
- **Stripe** — payments (partially integrated)
- **Port 3005** (not 3000 — avoid conflicts)
- Design: Playfair Display + Inter, CSS custom properties (`--cream`, `--navy`, `--terracotta`)

---

## Build Sequence — LOCKED

**Phase 1 (active):** Uncontested cooperative divorce — complete end-to-end
**Phase 2 (later):** Contested / uncooperative divorce

Do NOT build Phase 2 until Phase 1 is done.

---

## Document Engine

All legal document generation lives in `src/lib/documents/`.

- `types.ts` — `CaseData` type (single source of truth)
- `engine.ts` — `generateDocuments(c)` + `wizardStateToCaseData()` mapper
- `format.ts` — shared utilities: `courtCaption()`, `partyHeader()`, `judicialDistrict()`, `docShell()`
- `docs/*.ts` — one builder function per document

### All 20 document builders are built and compliance-verified.

**Compliance rules (enforce strictly):**
- All Utah Code citations use **Title 81** (recodified 2024–2025) — no old Title 30 or 78B
- URCP Rule 10: `partyHeader()` at top of every document
- OCAP $20 box on Civil Cover Sheet: **NEVER checked** — Divvi is not an OCAP filer
- SSNs: **last 4 digits only** — never stored in full
- Judicial district: always dynamic via `judicialDistrict(county)` — never hardcode

### Key statute mappings (current Title 81)
| Topic | Statute |
|---|---|
| Grounds (irreconcilable differences) | §81-4-405(1)(h) |
| Jurisdiction (residency) | §81-4-402 |
| 30-day waiting period | §81-4-406 |
| Alimony factors | §81-4-502 |
| Alimony termination | §81-4-505 |
| QDRO | §81-4-506 |
| Divorce education | §81-4-105 |
| UCCJEA jurisdiction | §81-11-201, §81-11-209 |
| Best interest of child | §81-9-204 |
| Joint custody factors | §81-9-205 |
| Minimum parent-time | §81-9-302 |
| Expanded parent-time | §81-9-303 |
| Child support guidelines | §81-6-202 |
| Income withholding | §26B-9-302 |

---

## Wizard — How Data Flows

1. User completes wizard steps → each section saves to `wizard_state` table in Supabase
2. `POST /api/generate-documents` → calls `wizardStateToCaseData()` → `generateDocuments()`
3. Engine builds 15–20 HTML documents, uploads to Supabase Storage
4. Review page (`/wizard/documents/review`) renders signed-URL iframes for each doc
5. User approves each doc, downloads as PDF (PDF layer: **still to build**)

### Wizard sections & saved keys
| Step | Route | Key saved fields |
|---|---|---|
| Intake | `/wizard/intake` | `petitioner_*`, `respondent_*`, `date_of_marriage`, `petitioner_county`, incomes |
| Children | `/wizard/children` | `legal_custody`, `physical_custody`, `parent_time_schedule`, `children[]` |
| Alimony | `/wizard/alimony` | `applies`, `payor_role`, `monthly_amount`, `duration_months`, `duration_label` |
| Assets | `/wizard/assets` | `assets[]`, `no_assets` |
| Property | `/wizard/property` | `disposition`, `address`, `value`, `mortgage_balance` |
| Debts | `/wizard/debts` | `debts[]`, `no_debts` |

### Parent-time schedule values
`"minimum"` / `"expanded"` / `"week_on_week_off"` / `"2_2_3"` / `"school_year_split"` / `"custom"`
— week_on_week_off, 2_2_3, school_year_split map to prose in `parentTimeDetail` via engine

---

## What's Left to Build (Phase 1)

1. **PDF generation** — convert HTML builder output to downloadable PDFs (Puppeteer or DocRaptor)
2. **Mediator scheduling** — booking flow for mediator/attorney sessions (Calendly or custom)
3. **Review page verification** — confirm iframe rendering works with actual HTML output

---

## Supabase Schema
- `cases` — id, case_type, has_children, status, petitioner_id
- `parties` — case_id, user_id, role, name fields, accepted_service
- `wizard_state` — case_id, section, data (JSONB), completed
- `upsells` — purchased add-ons per case
- `audit_log` — insert-only event log
- Storage: `case-documents/{case_id}/documents/{doc_id}.html`

**RLS is on every table. Never bypass it.**

---

## Key Components
- `WizardProgress` / `WizardProgressLoader` — sidebar progress tracker
- `LegalHelpBanner` — contextual legal help nudge, appears on sensitive wizard steps
- `StatuteChip` — inline statute citation chips (link to statute library)
- `AlimonyCalculator` — factor-based alimony estimator
- `MediatorBooking` — mediator/attorney scheduling widget (exists, not yet fully wired)
- `DivviLogo` — brand logo component (dark/light variants)

---

## Revenue Model
| Product | Price |
|---|---|
| Core divorce wizard | Free |
| AI Document Audit | $100 one-time |
| Divvi Family (co-parenting tools) | $14/month |
| QDRO service | $450 |
| Modification wizard | $500 (not yet built) |
| Mediator session | $150/hr |
| Attorney review | $250/hr |

---

## Mobile Strategy
Divvi is PWA / mobile-first. All authenticated pages target 390px screens. Bottom tab nav replaces top nav inside the app shell. Design for touch — 44px+ tap targets.
