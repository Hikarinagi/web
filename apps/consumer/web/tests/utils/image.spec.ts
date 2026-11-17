import { describe, expect, it } from 'vitest'
import type { ContentLimits } from '../../app/utils/media/image'
import { imageLimit, imageSourceSafety, strictestLimit } from '../../app/utils/media/image'

const limits: ContentLimits = {
  sexual_1_limit: 'JUST_SHOW',
  sexual_2_limit: 'SHOW_WITH_SPOILER',
  violence_1_limit: 'SHOW_WITH_SPOILER',
  violence_2_limit: 'NEVER_SHOW_NSFW_CONTENT',
}

const limitOf = (source: Parameters<typeof imageSourceSafety>[0]) =>
  imageLimit(imageSourceSafety(source), limits)

describe('strictestLimit', () => {
  it('picks the strictest of the given settings', () => {
    expect(strictestLimit('JUST_SHOW', 'SHOW_WITH_SPOILER')).toBe('SHOW_WITH_SPOILER')
    expect(strictestLimit('SHOW_WITH_SPOILER', 'NEVER_SHOW_NSFW_CONTENT', 'JUST_SHOW')).toBe(
      'NEVER_SHOW_NSFW_CONTENT',
    )
    expect(strictestLimit('JUST_SHOW')).toBe('JUST_SHOW')
  })
})

describe('imageLimit', () => {
  it('always shows an image rated 0 on both scales', () => {
    const strict: ContentLimits = {
      sexual_1_limit: 'NEVER_SHOW_NSFW_CONTENT',
      sexual_2_limit: 'NEVER_SHOW_NSFW_CONTENT',
      violence_1_limit: 'NEVER_SHOW_NSFW_CONTENT',
      violence_2_limit: 'NEVER_SHOW_NSFW_CONTENT',
    }
    expect(imageLimit(imageSourceSafety({ src: 'a.webp', sexual: 0, violence: 0 }), strict)).toBe(
      'JUST_SHOW',
    )
    expect(imageLimit(imageSourceSafety('a.webp'), strict)).toBe('JUST_SHOW')
  })

  it('treats each adult level by its own setting', () => {
    expect(limitOf({ src: 'a.webp', sexual: 1, violence: 0 })).toBe('JUST_SHOW')
    expect(limitOf({ src: 'a.webp', sexual: 2, violence: 0 })).toBe('SHOW_WITH_SPOILER')
  })

  it('treats each violence level by its own setting', () => {
    expect(limitOf({ src: 'a.webp', sexual: 0, violence: 1 })).toBe('SHOW_WITH_SPOILER')
    expect(limitOf({ src: 'a.webp', sexual: 0, violence: 2 })).toBe('NEVER_SHOW_NSFW_CONTENT')
  })

  it('takes the stricter setting when an image is rated on both scales', () => {
    expect(limitOf({ src: 'a.webp', sexual: 1, violence: 1 })).toBe('SHOW_WITH_SPOILER')
    expect(limitOf({ src: 'a.webp', sexual: 2, violence: 2 })).toBe('NEVER_SHOW_NSFW_CONTENT')
  })

  it('treats an unrated image as the sexual act level', () => {
    expect(limitOf({ src: 'a.webp', sexual: null, violence: null })).toBe('SHOW_WITH_SPOILER')
    expect(limitOf({ media: { src: 'a.webp', sexual: null, violence: 0 } })).toBe(
      'SHOW_WITH_SPOILER',
    )
    expect(limitOf({ src: 'a.webp', nsfw: true, sexual: 0, violence: 0 })).toBe('SHOW_WITH_SPOILER')
  })

  it('treats an image rated 2 as the sexual act level', () => {
    expect(limitOf({ src: 'a.webp', sexual: 2, violence: 0 })).toBe('SHOW_WITH_SPOILER')
    expect(limitOf({ media: { src: 'a.webp', nsfw: false, sexual: 2, violence: 0 } })).toBe(
      'SHOW_WITH_SPOILER',
    )
  })

  it('shows an image rated 0 of a work marked nsfw', () => {
    const cover = { media: { src: 'a.webp', nsfw: false, sexual: 0, violence: 0 }, nsfw: true }
    expect(limitOf(cover)).toBe('JUST_SHOW')
    expect(imageSourceSafety(cover)).toEqual({ unrated: false, sexual: 0, violence: 0 })
  })

  it('matches the single setting of an existing user when all four levels hold it', () => {
    for (const limit of ['JUST_SHOW', 'SHOW_WITH_SPOILER', 'NEVER_SHOW_NSFW_CONTENT'] as const) {
      const same: ContentLimits = {
        sexual_1_limit: limit,
        sexual_2_limit: limit,
        violence_1_limit: limit,
        violence_2_limit: limit,
      }
      for (const source of [
        { src: 'a.webp', sexual: 1, violence: 0 },
        { src: 'a.webp', sexual: 0, violence: 2 },
        { src: 'a.webp', sexual: null, violence: null },
        { src: 'a.webp', nsfw: true, sexual: 0, violence: 0 },
      ]) {
        expect(imageLimit(imageSourceSafety(source), same)).toBe(limit)
      }
    }
  })
})
