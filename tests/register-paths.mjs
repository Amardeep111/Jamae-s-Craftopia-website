/**
 * Node module resolution hook for running the app's source files directly
 * under plain Node (no bundler).
 *
 * The Next.js app uses:
 *   - extensionless relative imports  (e.g. './client')
 *   - the '@/' path alias             (e.g. '@/lib/db/client')
 *
 * This hook makes both resolvable so the tests can import app modules
 * directly instead of duplicating the logic.
 */
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Mirrors the "paths" mapping in jsconfig.json
const ALIASES = {
  '@/': path.join(projectRoot, 'app') + '/',
  '@lib/': path.join(projectRoot, 'app', 'lib') + '/',
  '@data/': path.join(projectRoot, 'app', 'data') + '/',
  '@components/': path.join(projectRoot, 'app', 'components') + '/',
  '@hooks/': path.join(projectRoot, 'app', 'hooks') + '/',
}

function toFileUrl(candidate) {
  return candidate.endsWith('.js') || candidate.endsWith('.jsx')
    ? pathToFileURL(candidate).href
    : null
}

function resolveWithExtension(specifier, parentURL) {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) return null
  const parentDir = parentURL ? path.dirname(fileURLToPath(parentURL)) : projectRoot
  const base = specifier.startsWith('/')
    ? path.join(projectRoot, specifier)
    : path.resolve(parentDir, specifier)
  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const url = toFileUrl(candidate)
      if (url) return url
    }
  }
  return null
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    // Path alias '@/' -> project root
    if (specifier.startsWith('@/')) {
      const resolved = resolveWithExtension(`/${specifier.slice(2)}`, context.parentURL)
      if (resolved) return { url: resolved, shortCircuit: true }
    }
    if (specifier.startsWith('.')) {
      const resolved = resolveWithExtension(specifier, context.parentURL)
      if (resolved) return { url: resolved, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})
