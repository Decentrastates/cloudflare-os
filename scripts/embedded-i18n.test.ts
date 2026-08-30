import assert from 'node:assert/strict'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import ts from 'typescript6'
import { translateEmbeddedUi } from '../packages/workshop-shared/src/embedded-ui-i18n.ts'

const root = new URL('../', import.meta.url).pathname
const properties = new Set(['label', 'title', 'description', 'placeholder', 'aria-label'])
const examples = new Set(['alerts', 'from:alerts@example.com newer_than:30d', 'https://your-workspace.slack.com/archives/C.../p...', 'Worker'])

function parse(path: string) {
  return ts.createSourceFile(path, readFileSync(join(root, path), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
}

function literal(node: ts.Node | undefined): string | undefined {
  if (!node) return undefined
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isJsxExpression(node)) return literal(node.expression)
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = literal(node.left), right = literal(node.right)
    if (left !== undefined && right !== undefined) return left + right
  }
}

const translated = new Set<string>()
for (const path of ['packages/workshop-shared/src/embedded-ui-i18n.ts', 'packages/workshop-shared/src/i18n.ts']) {
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.name)) translated.add(node.name.text)
    ts.forEachChild(node, visit)
  }
  visit(parse(path))
}

test('embedded app and configurator static copy has Chinese catalog coverage', () => {
  const missing = new Set<string>()
  const raw = new Set<string>()
  const paths: string[] = []
  for (const name of readdirSync(join(root, 'packages')).filter(name => name.startsWith('gatekeeper-'))) {
    for (const subdir of ['app', 'src/configurator']) {
      const dir = `packages/${name}/${subdir}`
      if (existsSync(join(root, dir))) for (const file of readdirSync(join(root, dir))) {
        if (file.endsWith('.tsx') && !file.endsWith('.test.tsx')) paths.push(`${dir}/${file}`)
      }
    }
  }
  const check = (value: string | undefined) => {
    if (value && /[A-Za-z]/.test(value) && !translated.has(value) && !examples.has(value)) missing.add(value)
  }
  for (const path of paths) {
    const file = parse(path)
    const configurator = path.includes('/configurator/')
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && node.expression.getText(file) === 't') check(literal(node.arguments[0]))
      if (ts.isJsxText(node) && /[A-Za-z]/.test(node.text)) raw.add(`${path}: ${node.text.trim()}`)
      if (configurator && ts.isJsxAttribute(node) && properties.has(node.name.getText(file))) check(literal(node.initializer))
      if (configurator && ts.isPropertyAssignment(node) && properties.has(node.name.getText(file))) check(literal(node.initializer))
      ts.forEachChild(node, visit)
    }
    visit(file)
  }
  assert.deepEqual([...raw], [], 'Untranslated JSX text')
  assert.deepEqual([...missing], [], 'Missing Chinese static UI catalog entries')
})

test('dynamic Gatekeeper resource options are displayed without frontend translation', () => {
  const source = readFileSync(join(root, 'scripts/build-gatekeeper-configurator.ts'), 'utf8')
  assert.match(source, /autocomplete-option-title", text: option\.title/)
  assert.match(source, /checkbox-title", text: option\.title/)
  assert.match(source, /await host\.getLocale\(\)/)
})

test('embedded translations preserve English, render both Chinese locales, and interpolate without translating values', () => {
  assert.equal(translateEmbeddedUi('en', 'Search collections…'), 'Search collections…')
  assert.equal(translateEmbeddedUi('zh-CN', 'Search collections…'), '搜索集合…')
  assert.equal(translateEmbeddedUi('zh-TW', 'Search collections…'), '搜尋集合…')
  assert.equal(translateEmbeddedUi('zh-TW', 'Choose an account'), '選擇帳戶')
  assert.equal(translateEmbeddedUi('zh-TW', 'Every {{count}} {{unit}}', { count: 5, unit: '分鐘' }), '每 5 分鐘')
  assert.equal(translateEmbeddedUi('zh-CN', '{{action}} why {{title}} needs attention', { action: '显示', title: 'My Daily Brief' }), '显示“My Daily Brief”需要处理的原因')
})
