import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WikiFieldImages from '../../app/components/wiki/field/Images.vue'
import { ENTRY_EDITOR } from '../../app/features/wiki/composables/useEntryEditor'

const uploadImage = vi.hoisted(() => vi.fn())
vi.mock('../../app/components/media-library/lib/upload', async importOriginal => ({
  ...(await importOriginal<object>()),
  uploadImage,
}))

const image = (name: string) => new File(['x'], name, { type: 'image/png' })

function render() {
  const editor = { add: vi.fn(), set: vi.fn() }
  const wrapper = mount(WikiFieldImages, {
    attachTo: document.body,
    props: {
      entry: 7,
      definition: {
        property: 'TITLE_LOGO',
        cardinality: 'single',
        qualifiers: ['LANGUAGE'],
      } as never,
      label: '标题徽标',
      view: { values: [], deprecated: [] },
    },
    global: { provide: { [ENTRY_EDITOR as symbol]: editor }, stubs: { WikiFieldValue: true } },
  })
  return { wrapper, editor }
}

async function pick(wrapper: ReturnType<typeof render>['wrapper'], files: File[]) {
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: files, configurable: true })
  await input.trigger('change')
  await flushPromises()
}

describe('WikiFieldImages', () => {
  beforeEach(() => {
    uploadImage.mockReset()
    uploadImage.mockImplementation(async (file: File) => ({
      id: file.name.length,
      src: `media/${file.name}`,
      width: 600,
      height: 300,
    }))
  })

  it('uploads only the files of each new pick', async () => {
    const { wrapper, editor } = render()
    await pick(wrapper, [image('a.png')])
    await pick(wrapper, [image('bb.png')])
    expect(uploadImage.mock.calls.map(([file]) => file.name)).toEqual(['a.png', 'bb.png'])
    expect(editor.add).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('uploads an image pasted while the pointer is over the field', async () => {
    const { wrapper } = render()
    const paste = (files: File[]) => {
      const event = new Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(event, 'clipboardData', { value: { files } })
      document.body.dispatchEvent(event)
    }
    paste([image('away.png')])
    await flushPromises()
    expect(uploadImage).not.toHaveBeenCalled()

    await wrapper.trigger('mouseenter')
    paste([image('logo.png'), new File(['x'], 'notes.txt', { type: 'text/plain' })])
    await flushPromises()
    expect(uploadImage.mock.calls.map(([file]) => file.name)).toEqual(['logo.png'])
    wrapper.unmount()
  })
})
