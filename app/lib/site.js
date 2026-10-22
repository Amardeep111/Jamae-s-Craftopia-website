import fs from 'fs'
import path from 'path'
import os from 'os'
import defaultSite from '@/data/site-content.json'
import { prisma } from '@/lib/db/client'

const SITE_FILE = path.join(process.cwd(), 'app', 'data', 'site-content.json')

let inMemorySiteContent = null
let dbColumnsEnsured = false

async function ensureDbColumns() {
  if (dbColumnsEnsured || !prisma) return
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "StoreSetting" 
      ADD COLUMN IF NOT EXISTS "aboutContent" JSONB,
      ADD COLUMN IF NOT EXISTS "siteContent" JSONB;
    `)
    dbColumnsEnsured = true
  } catch (err) {
    // Non-critical if table doesn't exist yet or connection fails
  }
}

function readDiskOrTmp(targetFile, filename) {
  try {
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, 'utf-8')
      return JSON.parse(raw)
    }
  } catch {}
  try {
    const tmpFile = path.join(os.tmpdir(), filename)
    if (fs.existsSync(tmpFile)) {
      const raw = fs.readFileSync(tmpFile, 'utf-8')
      return JSON.parse(raw)
    }
  } catch {}
  return null
}

export function mergeSiteContent(parsed) {
  if (!parsed || typeof parsed !== 'object') return defaultSite
  return {
    ...defaultSite,
    ...parsed,
    social: {
      ...defaultSite.social,
      ...(parsed.social || {}),
    },
    visibility: {
      ...defaultSite.visibility,
      ...(parsed.visibility || {}),
    },
    images: {
      ...defaultSite.images,
      ...(parsed.images || {}),
      hero: {
        ...(defaultSite.images?.hero || {}),
        ...(parsed.images?.hero || {}),
      },
      brandStory: {
        ...(defaultSite.images?.brandStory || {}),
        ...(parsed.images?.brandStory || {}),
      },
      customOrderCta: {
        ...(defaultSite.images?.customOrderCta || {}),
        ...(parsed.images?.customOrderCta || {}),
      },
      customOrdersPage: {
        ...(defaultSite.images?.customOrdersPage || {}),
        ...(parsed.images?.customOrdersPage || {}),
      },
      craftTable: Array.isArray(parsed.images?.craftTable) && parsed.images.craftTable.length
        ? parsed.images.craftTable
        : defaultSite.images?.craftTable || [],
    },
  }
}

export async function getSiteContent() {
  if (inMemorySiteContent) return inMemorySiteContent

  try {
    if (prisma?.storeSetting) {
      await ensureDbColumns()
      const setting = await prisma.storeSetting.findUnique({
        where: { id: 'main' },
        select: { siteContent: true, merchantName: true, whatsappNumber: true },
      }).catch(() => null)

      if (setting?.siteContent && typeof setting.siteContent === 'object') {
        const merged = mergeSiteContent(setting.siteContent)
        if (setting.merchantName && !merged.name) merged.name = setting.merchantName
        inMemorySiteContent = merged
        return inMemorySiteContent
      }
    }
  } catch (err) {
    console.warn('Failed to load site content from database:', err.message)
  }

  const disk = readDiskOrTmp(SITE_FILE, 'site-content.json')
  if (disk) {
    inMemorySiteContent = mergeSiteContent(disk)
    return inMemorySiteContent
  }

  inMemorySiteContent = defaultSite
  return inMemorySiteContent
}

export function getSiteContentSync() {
  if (inMemorySiteContent) return inMemorySiteContent
  const disk = readDiskOrTmp(SITE_FILE, 'site-content.json')
  if (disk) {
    inMemorySiteContent = mergeSiteContent(disk)
    return inMemorySiteContent
  }
  return defaultSite
}

export async function saveSiteContent(content) {
  try {
    const current = await getSiteContent()
    const merged = mergeSiteContent({
      ...current,
      ...content,
      social: {
        ...current.social,
        ...(content.social || {}),
      },
      visibility: {
        ...current.visibility,
        ...(content.visibility || {}),
      },
      images: {
        ...current.images,
        ...(content.images || {}),
        hero: {
          ...(current.images?.hero || {}),
          ...(content.images?.hero || {}),
        },
        brandStory: {
          ...(current.images?.brandStory || {}),
          ...(content.images?.brandStory || {}),
        },
        customOrderCta: {
          ...(current.images?.customOrderCta || {}),
          ...(content.images?.customOrderCta || {}),
        },
        customOrdersPage: {
          ...(current.images?.customOrdersPage || {}),
          ...(content.images?.customOrdersPage || {}),
        },
        craftTable: Array.isArray(content.images?.craftTable)
          ? content.images.craftTable
          : current.images?.craftTable || [],
      },
    })

    inMemorySiteContent = merged

    // 1. Persist to database if prisma is available
    try {
      if (prisma?.storeSetting) {
        await ensureDbColumns()
        const updateData = { siteContent: merged }
        if (merged.name) updateData.merchantName = merged.name
        if (merged.whatsapp) {
          const digits = String(merged.whatsapp).replace(/\D/g, '')
          if (digits) updateData.whatsappNumber = digits
        }
        await prisma.storeSetting.upsert({
          where: { id: 'main' },
          create: { id: 'main', ...updateData },
          update: updateData,
        })
      }
    } catch (dbErr) {
      console.warn('Failed to persist site content to database:', dbErr.message)
    }

    // 2. Persist to disk (safely catching EROFS on read-only serverless filesystems)
    try {
      fs.writeFileSync(SITE_FILE, JSON.stringify(merged, null, 2), 'utf-8')
    } catch (fsErr) {
      // Read-only filesystem (Vercel/Lambda) or permission denied — fallback to /tmp
      try {
        const tmpFile = path.join(os.tmpdir(), 'site-content.json')
        fs.writeFileSync(tmpFile, JSON.stringify(merged, null, 2), 'utf-8')
      } catch {}
    }

    return { success: true, data: merged }
  } catch (err) {
    console.error('Error saving site content:', err)
    throw new Error('Failed to save site content: ' + err.message)
  }
}
