import { FileUpload } from '@hina-ui/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { isAcceptedImage } from '../../app/components/media-library/lib/upload'
import WikiFieldImage from '../../app/components/wiki/field/Image.vue'
import { emptyValue } from '../../app/features/wiki/editor/draft'

describe('wiki image upload', () => {
  it('takes an AVIF image like the other formats the upload accepts', () => {
    expect(isAcceptedImage(new File([''], 'logo.avif', { type: 'image/avif' }))).toBe(true)
    expect(isAcceptedImage(new File([''], 'cover.webp', { type: 'image/webp' }))).toBe(true)
    expect(isAcceptedImage(new File([''], 'scan.bmp', { type: 'image/bmp' }))).toBe(false)
  })

  it('lets the image field of the editor pick an AVIF file', () => {
    const wrapper = mount(WikiFieldImage, {
      props: {
        label: '标题徽标',
        rating: { sexual: null, violence: null },
        modelValue: emptyValue(),
      },
      global: { stubs: { HikariImage: true } },
    })
    expect(String(wrapper.getComponent(FileUpload).props('accept')).split(',')).toContain(
      'image/avif',
    )
  })
})
