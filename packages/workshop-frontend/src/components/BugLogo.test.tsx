// @vitest-environment jsdom
/* eslint-disable react/react-in-jsx-scope */

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import BugLogo from './BugLogo'

describe('BugLogo', () => {
  it('renders a current-color Bug OS mark at the requested size', () => {
    const markup = renderToStaticMarkup(
      <BugLogo size={24} className="brand-mark" eyeColor="var(--color-kumo-brand)" />,
    )

    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('width="24"')
    expect(markup).toContain('height="24"')
    expect(markup).toContain('class="brand-mark"')
    expect(markup).toContain('currentColor')
    expect(markup).toContain('var(--color-kumo-brand)')
  })
})
