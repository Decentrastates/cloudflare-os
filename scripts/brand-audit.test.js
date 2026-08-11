import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const legacyBrand = /Cloudflare\s+OS/i

function runtimeBrandFiles() {
  return execFileSync('git', [
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
  ], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean)
    // Historical implementation records describe the before/after migration explicitly.
    .filter((file) => !file.startsWith('docs/superpowers/'))
    .filter((file) => !/(?:^|\/)(?:__tests__|test|tests)(?:\/|$)/.test(file))
    .filter((file) => !/\.test\.[cm]?[jt]sx?$/.test(file))
    .filter((file) => /(?:\.(?:md|mdx|html|svg|[cm]?[jt]sx?|sh|jsonc?|ya?ml|css|scss|toml|txt|capnp)|(?:^|\/)(?:Dockerfile|Makefile))$/.test(file))
}

test('runtime and operator surfaces do not use the legacy product name', () => {
  const findings = runtimeBrandFiles().flatMap((file) => {
    const source = readFileSync(file, 'utf8')
    const match = source.match(legacyBrand)
    if (!match || match.index === undefined) return []
    const line = source.slice(0, match.index).split('\n').length
    return [`${file}:${line}:${match[0].replaceAll(/\s+/g, ' ')}`]
  })

  assert.deepEqual(findings, [])
})
