import { google } from 'googleapis'
import { Readable } from 'stream'

const ROOT_FOLDER_NAME = 'Rose Family Finances'

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
  return new google.auth.JWT(email, undefined, key, ['https://www.googleapis.com/auth/drive'])
}

function getDrive() {
  return google.drive({ version: 'v3', auth: getAuth() })
}

// Find or create a folder by name under a parent
async function ensureFolder(name: string, parentId: string): Promise<string> {
  const drive = getDrive()
  const res = await drive.files.list({
    q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id)',
  })
  if (res.data.files && res.data.files.length > 0) return res.data.files[0].id!

  const created = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id',
  })
  return created.data.id!
}

// Get or create the root "Rose Family Finances" folder
async function getRootFolderId(): Promise<string> {
  const drive = getDrive()
  const res = await drive.files.list({
    q: `name='${ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
  })
  if (res.data.files && res.data.files.length > 0) return res.data.files[0].id!
  const created = await drive.files.create({
    requestBody: { name: ROOT_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' },
    fields: 'id',
  })
  return created.data.id!
}

// Map section + docType to a subfolder name
function subfolderName(section: string, label?: string): string {
  if (section === 'spending') return 'Bank Statements'
  if (section === 'investments') return 'Investment Statements'
  if (section === 'airbnb') return 'Airbnb & Receipts'
  if (section === 'taxes') {
    if (label?.includes('1099')) return '1099s'
    if (label?.includes('W-2')) return 'W-2s'
    if (label?.includes('Mortgage')) return 'Mortgage'
    if (label?.includes('Property Tax')) return 'Property Tax'
    return 'Tax Documents'
  }
  return 'Other'
}

export async function uploadToDrive({
  fileName,
  fileBuffer,
  mimeType,
  section,
  label,
  year,
}: {
  fileName: string
  fileBuffer: Buffer
  mimeType: string
  section: string
  label?: string
  year?: number
}): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDrive()
  const rootId = await getRootFolderId()
  const yearStr = String(year || new Date().getFullYear())
  const yearFolderId = await ensureFolder(yearStr, rootId)
  const subFolderId = await ensureFolder(subfolderName(section, label), yearFolderId)

  const stream = Readable.from(fileBuffer)
  const res = await drive.files.create({
    requestBody: { name: fileName, parents: [subFolderId] },
    media: { mimeType, body: stream },
    fields: 'id,webViewLink',
  })

  return {
    fileId: res.data.id!,
    webViewLink: res.data.webViewLink!,
  }
}
