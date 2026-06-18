# Utah New Construction Website — Setup Guide

## Step 1: Install Node.js

Go to **https://nodejs.org** and download the **LTS** version (the left button). Install it.

Verify by opening Terminal and running:
```
node --version
npm --version
```

You should see version numbers for both.

---

## Step 2: Install Dependencies

In Terminal, navigate to this folder and install packages:
```
cd "/Users/courtfam/Real Estate"
npm install
```

This takes 1–2 minutes the first time.

---

## Step 3: Configure Your Info

Copy the example environment file:
```
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

| Variable | What to put |
|---|---|
| `HIGHLEVEL_WEBHOOK_URL` | Your GHL webhook URL (see below) |
| `NEXT_PUBLIC_AGENT_NAME` | Your full name |
| `NEXT_PUBLIC_AGENT_PHONE` | Your phone number |
| `NEXT_PUBLIC_AGENT_EMAIL` | Your email |
| `NEXT_PUBLIC_AGENT_BROKERAGE` | Your brokerage name |
| `NEXT_PUBLIC_AGENT_LICENSE` | Your Utah license number |

### Getting Your HighLevel Webhook URL

1. In GoHighLevel, go to **Settings → Integrations → Webhooks**
2. Click **+ Add Webhook**
3. Name it "Utah New Construction Website"
4. Copy the webhook URL and paste it into `.env.local`

---

## Step 4: Run the Site Locally

```
npm run dev
```

Open your browser to **http://localhost:3000**

---

## Step 5: Update Builder & Incentive Data

All builder data is in:
```
src/data/mock.ts
```

To update incentives, find the builder and edit the `incentives` array. Each incentive has:
- `title` — short name of the offer
- `description` — full details
- `value` — the amount/value (e.g., "$20,000" or "2-1 Buydown")
- `type` — `rate-buydown`, `closing-costs`, `upgrades`, `price-reduction`, or `other`
- `expiresDate` — optional expiry date (format: "YYYY-MM-DD")
- `active` — set to `false` to hide it

---

## Step 6: Add More Builders / Communities

Copy an existing builder object in `mock.ts` and fill in the new details. The `slug` must be unique (lowercase, dashes).

---

## Step 7 (Optional): Connect Google Sheets as CMS

If you want to update content without editing code:

1. Create a Google Sheet with tabs: **Builders**, **Communities**, **Incentives**
2. Enable the Google Sheets API in Google Cloud Console
3. Create a Service Account and download the JSON key
4. Add credentials to `.env.local`

_(Full sheet column structure is documented in `src/lib/sheets.ts`)_

---

## Deploying to Vercel (Free)

1. Create a free account at **vercel.com**
2. Connect your GitHub account
3. Push this folder to a GitHub repo
4. Import it in Vercel — it auto-detects Next.js
5. Add your `.env.local` variables in Vercel's Environment Variables settings
6. Deploy! Your site will be live at `your-project.vercel.app`

You can connect a custom domain (e.g., utahnewbuilds.com) in Vercel's domain settings.
