import fs from 'fs'
import path from 'path'
import defaultContent from '@/data/about-content.json'

const CONTENT_FILE = path.join(process.cwd(), 'app', 'data', 'about-content.json')

export function getAboutContent() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const raw = fs.readFileSync(CONTENT_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
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
  } catch (err) {
    console.error('Error reading about content file:', err)
  }
  return defaultContent
}

export function saveAboutContent(content) {
  try {
    const merged = {
      ...defaultContent,
      ...content,
      header: { ...defaultContent.header, ...(content.header || {}) },
      story: { ...defaultContent.story, ...(content.story || {}) },
      makersHeading: { ...defaultContent.makersHeading, ...(content.makersHeading || {}) },
      makers: Array.isArray(content.makers) ? content.makers : defaultContent.makers,
      values: Array.isArray(content.values) ? content.values : defaultContent.values,
      crafting: { ...defaultContent.crafting, ...(content.crafting || {}) },
    }
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(merged, null, 2), 'utf-8')
    return { success: true, data: merged }
  } catch (err) {
    console.error('Error writing about content file:', err)
    throw new Error('Failed to save about content to disk: ' + err.message)
  }
}

