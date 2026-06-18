import { mockBuilders } from '@/data/mock';
import { Builder } from '@/types';

// Returns mock data if Google Sheets is not configured.
// To enable Google Sheets: set GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL,
// and GOOGLE_PRIVATE_KEY in .env.local.
//
// Sheet structure expected:
//   Tab "Builders":   id | name | slug | description | phone | email | website |
//                     years_in_business | homes_built | warranty_years | areas |
//                     price_min | price_max | featured
//   Tab "Communities": id | builder_id | name | slug | city | county | address |
//                      price_min | price_max | sqft_min | sqft_max | beds |
//                      status | description | features | map_url | photo_color
//   Tab "Incentives":  id | builder_id | community_id | title | description |
//                      value | type | expires | active

export async function getBuilders(): Promise<Builder[]> {
  const sheetsConfigured =
    process.env.GOOGLE_SHEETS_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetsConfigured) {
    return mockBuilders;
  }

  try {
    const { google } = await import('googleapis');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const [buildersRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Builders!A2:Z' }),
    ]);

    const rows = buildersRes.data.values;
    if (!rows?.length) return mockBuilders;

    // TODO: parse rows into Builder objects matching the sheet columns above
    // For now, fall back to mock data until mapping is implemented
    console.info('Google Sheets connected — sheet parsing not yet implemented, using mock data');
    return mockBuilders;
  } catch (err) {
    console.error('Google Sheets error, falling back to mock data:', err);
    return mockBuilders;
  }
}
