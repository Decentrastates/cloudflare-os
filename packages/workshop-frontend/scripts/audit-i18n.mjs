import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript6'

const ATTRIBUTES = new Set([
  'aria-label', 'title', 'label', 'placeholder', 'description', 'alt',
  'emptyTitle', 'emptyDescription', 'confirmLabel', 'cancelLabel', 'submitLabel',
  'searchPlaceholder', 'tooltip', 'content', 'message', 'confirmingLabel', 'heading', 'subheading',
  'ariaLabel', 'actionLabel', 'busyLabel',
])
const EXCLUDED_ELEMENTS = new Set(['code', 'pre', 'style', 'script'])

function humanText(value) {
  const text = value.replace(/\s+/g, ' ').trim()
    .replaceAll('&times;', '×')
    .replaceAll('&middot;', '·')
    .replaceAll('&mdash;', '—')
  if (!text || !/[A-Za-z]/.test(text)) return null
  if (/^(?:ms|s|min|h|d)$/.test(text)) return null
  if (/^(https?:|[A-Za-z0-9_./-]+\.(tsx?|jsx?|json|css|md)|[A-Z0-9_]+|[a-z0-9]+(?:-[a-z0-9]+)+)$/.test(text)) return null
  return text
}

function elementName(node) {
  if (ts.isJsxElement(node)) return node.openingElement.tagName.getText()
  if (ts.isJsxSelfClosingElement(node)) return node.tagName.getText()
  return ''
}

function excluded(node) {
  for (let current = node.parent; current; current = current.parent) {
    if ((ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current))
      && EXCLUDED_ELEMENTS.has(elementName(current))) return true
  }
  return false
}

function auditSource(sourceText, filename, catalogKeys = null) {
  const source = ts.createSourceFile(filename, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const findings = []

  function add(node, value, kind) {
    const message = humanText(value)
    if (!message || excluded(node)) return
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
    findings.push({ filename, line, kind, message })
  }

  function displayBranch(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      add(node, node.text, 'display branch')
    } else if (ts.isTemplateExpression(node)) {
      const fixedText = [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(' ')
      add(node, fixedText, 'display template')
    } else if (ts.isConditionalExpression(node)) {
      displayBranch(node.whenTrue)
      displayBranch(node.whenFalse)
    } else if (ts.isParenthesizedExpression(node)) {
      displayBranch(node.expression)
    } else if (ts.isBinaryExpression(node)
      && (node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
        || node.operatorToken.kind === ts.SyntaxKind.BarBarToken)) {
      displayBranch(node.right)
    }
  }

  function visit(node) {
    if (ts.isJsxText(node)) add(node, node.getText(source), 'JSX text')

    if (ts.isJsxAttribute(node) && ATTRIBUTES.has(node.name.getText(source)) && node.initializer) {
      if (ts.isStringLiteral(node.initializer)) add(node.initializer, node.initializer.text, 'attribute')
      if (ts.isJsxExpression(node.initializer) && node.initializer.expression
        && ts.isStringLiteral(node.initializer.expression)) {
        add(node.initializer.expression, node.initializer.expression.text, 'attribute')
      }
      if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        displayBranch(node.initializer.expression)
      }
    }

    if (ts.isJsxExpression(node) && !ts.isJsxAttribute(node.parent) && node.expression) {
      if (ts.isStringLiteral(node.expression)) add(node.expression, node.expression.text, 'JSX expression')
      if (ts.isConditionalExpression(node.expression)) {
        displayBranch(node.expression.whenTrue)
        displayBranch(node.expression.whenFalse)
      }
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)
      && /Error$/.test(node.name.text) && node.initializer) {
      function errorValue(child) {
        if (ts.isCallExpression(child) && child.expression.getText(source) === 't') return
        if (ts.isStringLiteral(child) || ts.isNoSubstitutionTemplateLiteral(child)) {
          add(child, child.text, 'error')
          return
        }
        ts.forEachChild(child, errorValue)
      }
      errorValue(node.initializer)
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)
      && /(Label|Title|Description|Placeholder|Hint)$/.test(node.name.text) && node.initializer) {
      displayBranch(node.initializer)
    }

    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(source)
      if (callee === 't' && catalogKeys && node.arguments.length > 0
        && (ts.isStringLiteral(node.arguments[0]) || ts.isNoSubstitutionTemplateLiteral(node.arguments[0]))) {
        const key = node.arguments[0].text
        if (!catalogKeys.has(key)) add(node.arguments[0], key, 'missing catalog key')
      }
      const localizedCall = callee === 'useDocumentTitle' || callee === 'confirm'
        || callee === 'window.confirm' || /^set[A-Za-z0-9]*(Error|ErrorMessage)$/.test(callee)
      if (localizedCall) {
        function argumentValue(child) {
          if (ts.isCallExpression(child) && child.expression.getText(source) === 't') return
          if (ts.isStringLiteral(child) || ts.isNoSubstitutionTemplateLiteral(child)) {
            add(child, child.text, `call ${callee}`)
            return
          }
          ts.forEachChild(child, argumentValue)
        }
        node.arguments.forEach(argumentValue)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(source)
  return findings
}

function readEnglishCatalog() {
  const filename = path.resolve('src/i18n/catalogs/en.ts')
  if (!fs.existsSync(filename)) return null
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true)
  const keys = new Set()
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'en'
      && node.initializer) {
      const initializer = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer
      if (!ts.isObjectLiteralExpression(initializer)) return
      for (const property of initializer.properties) {
        if (ts.isPropertyAssignment(property)
          && (ts.isStringLiteral(property.name) || ts.isNoSubstitutionTemplateLiteral(property.name))) {
          keys.add(property.name.text)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return keys
}

function sourceFiles(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...sourceFiles(filename))
    else if (entry.name.endsWith('.tsx') && !entry.name.includes('.test.')) files.push(filename)
  }
  return files
}

const sourceIndex = process.argv.indexOf('--source')
const catalogKeys = readEnglishCatalog()
let findings
if (sourceIndex >= 0) {
  findings = auditSource(process.argv[sourceIndex + 1] ?? '', '<inline>.tsx', catalogKeys)
} else {
  const root = path.resolve('src')
  findings = sourceFiles(root)
    .filter((filename) => !filename.includes(`${path.sep}i18n${path.sep}`))
    .flatMap((filename) => auditSource(fs.readFileSync(filename, 'utf8'), path.relative(root, filename), catalogKeys))
}

for (const finding of findings) {
  console.log(`${finding.filename}:${finding.line} [${finding.kind}] ${finding.message}`)
}

if (findings.length > 0) {
  console.log(`Found ${findings.length} untranslated user-facing string(s).`)
  process.exit(1)
}

console.log('i18n audit passed: no raw user-facing JSX strings found.')
