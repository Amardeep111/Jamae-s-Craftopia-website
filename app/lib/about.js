import fs from 'fs'
import path from 'path'
import os from 'os'
import defaultContent from '@/data/about-content.json'
import { prisma } from '@/lib/db/client'

const CONTENT_FILE = path.join(process.cwd(), 'app', 'data', 'about-content.json')

let inMemoryAboutContent = defaultContent

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

export function mergeAboutContent(parsed) {
  if (!parsed || typeof parsed !== 'object') return defaultContent
  return {
    ...defaultContent,
    ...parsed,
    header: { ...defaultContent.header, ...(parsed.header || {}) },
    story: { ...defaultContent.story, ...(parsed.story || {}) },
    makersHeading: { ...defaultContent.makersHeading, ...(parsed.makersHeading || {}) },
    makers: Array.isArray(parsed.makers) && parsed.makers.length ? parsed.makers : defaultContent.makers,
    values: Array.isArray(parsed.values) && parsed.values.length ? parsed.values : defaultContent.values,
    crafting: { ...defaultContent.crafting, ...(parsed.crafting || {}) },
  }
}

export async function getAboutContent() {
  try {
    if (prisma?.storeSetting) {
      const queryPromise = prisma.storeSetting.findUnique({
        where: { id: 'main' },
        select: { aboutContent: true },
      }).then(async (row) => {
        if (row?.aboutContent) return row
        return prisma.storeSetting.findFirst({
          select: { aboutContent: true },
        })
      })

      const row = await Promise.race([
        queryPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500)),
      ]).catch(() => null)

      let rawContent = row?.aboutContent
      if (typeof rawContent === 'string') {
        try {
          rawContent = JSON.parse(rawContent)
        } catch {}
      }

      if (rawContent && typeof rawContent === 'object') {
        inMemoryAboutContent = mergeAboutContent(rawContent)
        return inMemoryAboutContent
      }
    }
  } catch (err) {
    console.warn('Failed to load about content from database:', err.message)
  }

  if (inMemoryAboutContent && inMemoryAboutContent !== defaultContent) {
    return inMemoryAboutContent
  }

  const disk = readDiskOrTmp(CONTENT_FILE, 'about-content.json')
  if (disk) {
    inMemoryAboutContent = mergeAboutContent(disk)
    return inMemoryAboutContent
  }

  inMemoryAboutContent = defaultContent
  return inMemoryAboutContent
}

export function getAboutContentSync() {
  if (inMemoryAboutContent) return inMemoryAboutContent
  const disk = readDiskOrTmp(CONTENT_FILE, 'about-content.json')
  if (disk) {
    inMemoryAboutContent = mergeAboutContent(disk)
    return inMemoryAboutContent
  }
  return defaultContent
}

export async function saveAboutContent(content) {
  try {
    const current = inMemoryAboutContent || defaultContent
    const merged = mergeAboutContent({
      ...current,
      ...content,
      header: { ...(current.header || defaultContent.header), ...(content.header || {}) },
      story: { ...(current.story || defaultContent.story), ...(content.story || {}) },
      makersHeading: { ...(current.makersHeading || defaultContent.makersHeading), ...(content.makersHeading || {}) },
      makers: Array.isArray(content.makers) ? content.makers : (current.makers || defaultContent.makers),
      values: Array.isArray(content.values) ? content.values : (current.values || defaultContent.values),
      crafting: { ...(current.crafting || defaultContent.crafting), ...(content.crafting || {}) },
    })

    inMemoryAboutContent = merged

    // 1. Persist to database if prisma is available (with 5s safety timeout)
    try {
      if (prisma?.storeSetting) {
        await Promise.race([
          prisma.storeSetting.upsert({
            where: { id: 'main' },
            create: { id: 'main', aboutContent: merged },
            update: { aboutContent: merged },
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Database write timeout')), 5000)),
        ])
      }
    } catch (dbErr) {
      console.warn('Failed to persist about content to database:', dbErr.message)
    }

    // 2. Persist to disk (safely catching EROFS on read-only serverless filesystems)
    try {
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(merged, null, 2), 'utf-8')
    } catch (fsErr) {
      // Read-only filesystem (Vercel/Lambda) or permission denied — fallback to /tmp
      try {
        const tmpFile = path.join(os.tmpdir(), 'about-content.json')
        fs.writeFileSync(tmpFile, JSON.stringify(merged, null, 2), 'utf-8')
      } catch {}
    }

    return { success: true, data: merged }
  } catch (err) {
    console.error('Error saving about content:', err)
    throw new Error('Failed to save about content: ' + err.message)
  }
}
