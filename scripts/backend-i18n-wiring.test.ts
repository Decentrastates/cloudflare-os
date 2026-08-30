import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const serverSource = readFileSync(
  new URL('../packages/workshop-backend/src/server.ts', import.meta.url),
  'utf8',
)

test('authenticated backend responses retain the requested UI locale', () => {
  assert.match(
    serverSource,
    /listGatekeeperVendors[\s\S]*?\.map\(info => localizeVendorInfo\(info, this\.locale\)\)/,
  )
  assert.match(
    serverSource,
    /listAddableGatekeepers[\s\S]*?\.map\(info => localizeVendorInfo\(info, this\.locale\)\)/,
  )
  assert.match(
    serverSource,
    /subscribeConnectedAccounts\(subscriber, filter, this\.locale\)/,
  )
  assert.match(
    serverSource,
    /listLibraryBlueprints[\s\S]*?localizeBlueprintMetadata\(blueprint\.id, blueprint\.metadata, this\.locale\)/,
  )
})
