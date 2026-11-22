import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PickRing from '../../app/components/landing/PickRing.vue'

const ring = (seconds?: number | null) =>
  mount(PickRing, { props: { running: true, paused: false, cycle: 1, seconds } })

describe('LandingPickRing', () => {
  it('runs for the seconds a slide asks for', () => {
    expect(ring(20).get('rect').attributes('style')).toContain('animation-duration: 20s')
  })

  it('keeps the default length when a slide asks for none', () => {
    expect(ring(null).get('rect').attributes('style')).not.toContain('animation-duration')
    expect(ring().get('rect').attributes('style')).not.toContain('animation-duration')
  })
})
