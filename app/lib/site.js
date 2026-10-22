import fs from 'fs'
import path from 'path'
import defaultSite from '@/data/site-content.json'

const SITE_FILE = path.join(process.cwd(), 'app', 'data', 'site-content.json')

export function getSiteContent() {
  try {
    if (fs.existsSync(SITE_FILE)) {
      const raw = fs.readFileSync(SITE_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
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
  } catch (err) {
    console.error('Error reading site content file:', err)
  }
  return defaultSite
}

export function saveSiteContent(content) {
  try {
    const current = getSiteContent()
    const merged = {
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
    }
    fs.writeFileSync(SITE_FILE, JSON.stringify(merged, null, 2), 'utf-8')
    return { success: true, data: merged }
  } catch (err) {
    console.error('Error saving site content file:', err)
    throw new Error('Failed to save site content: ' + err.message)
  }
}
