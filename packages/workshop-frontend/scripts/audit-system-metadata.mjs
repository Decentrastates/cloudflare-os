import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript6'

const frontendRoot = process.cwd()
const packagesRoot = path.resolve(frontendRoot, '..')
const sharedCatalogFile = path.join(packagesRoot, 'workshop-shared', 'src', 'i18n.ts')
const brandNames = new Set([
  'BigQuery', 'Cloudflare', 'Confluence', 'GitHub', 'Google', 'Linear', 'Notion', 'Slack',
  'Spotify', 'Supabase', 'ZoomInfo',
])

function staticString(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = staticString(node.left)
    const right = staticString(node.right)
    return left === null || right === null ? null : left + right
  }
  return null
}

function objectProperties(node) {
  const result = new Map()
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    const name = property.name.getText().replace(/^['"]|['"]$/g, '')
    const value = staticString(property.initializer)
    if (value !== null) result.set(name, value)
  }
  return result
}

function collectGatekeeperMetadata() {
  const values = new Map()
  for (const entry of fs.readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('gatekeeper-')) continue
    const sourceRoot = path.join(packagesRoot, entry.name, 'src')
    if (!fs.existsSync(sourceRoot)) continue
    for (const filename of fs.readdirSync(sourceRoot)) {
      if (!filename.endsWith('.ts')) continue
      const absolute = path.join(sourceRoot, filename)
      const source = ts.createSourceFile(absolute, fs.readFileSync(absolute, 'utf8'),
        ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
      function visit(node) {
        if (ts.isObjectLiteralExpression(node)) {
          const properties = objectProperties(node)
          const isResource = properties.has('urlPattern') && properties.has('title')
          const isVendor = properties.has('displayName') && properties.has('url')
            && (properties.has('tagline') || properties.has('description'))
          if (isResource) {
            for (const key of ['title', 'description']) {
              const value = properties.get(key)
              if (value) values.set(value, `${entry.name}/src/${filename}`)
            }
          }
          if (isVendor) {
            for (const key of ['displayName', 'tagline', 'description']) {
              const value = properties.get(key)
              if (value) values.set(value, `${entry.name}/src/${filename}`)
            }
          }
        }
        ts.forEachChild(node, visit)
      }
      visit(source)
    }
  }
  return values
}

function collectFormatMetadata() {
  const values = new Map()
  const directory = path.join(packagesRoot, 'workshop-backend', 'format-blueprints')
  for (const filename of fs.readdirSync(directory)) {
    if (!filename.endsWith('.json')) continue
    const data = JSON.parse(fs.readFileSync(path.join(directory, filename), 'utf8'))
    for (const value of [data.title, data.description, data.output?.noun, data.output?.plural]) {
      if (value) values.set(value, `workshop-backend/format-blueprints/${filename}`)
    }
  }
  for (const value of ['App', 'Apps']) values.set(value, 'workshop-frontend/src/components/format/formats.ts')
  return values
}

function catalogKeys() {
  const source = ts.createSourceFile(sharedCatalogFile, fs.readFileSync(sharedCatalogFile, 'utf8'),
    ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const catalogs = new Map()
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)
      && (node.name.text === 'zhCN' || node.name.text === 'zhTW')
      && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      catalogs.set(node.name.text, new Set(objectProperties(node.initializer).keys()))
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return catalogs
}

const metadata = new Map([...collectGatekeeperMetadata(), ...collectFormatMetadata()])
const catalogs = catalogKeys()
const missing = []
for (const [value, source] of metadata) {
  if (brandNames.has(value)) continue
  for (const locale of ['zhCN', 'zhTW']) {
    if (!catalogs.get(locale)?.has(value)) missing.push(`${locale}: ${value} (${source})`)
  }
}

const forbiddenFrontendTranslators = []
function auditFrontendRuntime(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      auditFrontendRuntime(filename)
      continue
    }
    if (!/\.(?:ts|tsx)$/.test(entry.name) || entry.name.includes('.test.')) continue
    const source = fs.readFileSync(filename, 'utf8')
    if (/translateSystemMetadata|systemText/.test(source)) {
      forbiddenFrontendTranslators.push(path.relative(frontendRoot, filename))
    }
  }
}
auditFrontendRuntime(path.join(frontendRoot, 'src'))

if (forbiddenFrontendTranslators.length > 0) {
  console.error('Backend metadata must be localized by the backend and rendered unchanged by the frontend:')
  for (const filename of forbiddenFrontendTranslators) console.error(`- ${filename}`)
  process.exit(1)
}

if (missing.length > 0) {
  console.error(`System metadata i18n audit found ${missing.length} missing translation(s):`)
  for (const item of missing) console.error(`- ${item}`)
  process.exit(1)
}

console.log(`System metadata i18n audit passed: ${metadata.size} fixed metadata string(s) covered.`)
