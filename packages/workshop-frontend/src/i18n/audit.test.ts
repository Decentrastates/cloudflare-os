// @ts-nocheck -- the frontend tsconfig intentionally excludes Node.js ambient types.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('i18n source audit', () => {
  it('rejects raw JSX copy and user-facing attributes', () => {
    const script = fileURLToPath(new URL('../../scripts/audit-i18n.mjs', import.meta.url))
    const result = spawnSync(process.execPath, [
      script,
      '--source',
      '<main aria-label="Raw label">Raw visible copy</main>',
    ], { encoding: 'utf8' })

    expect(result.status).toBe(1)
    expect(result.stdout).toContain('Raw label')
    expect(result.stdout).toContain('Raw visible copy')
  })
})
