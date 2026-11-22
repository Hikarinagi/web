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

function render(property = 'TITLE_LOGO', type = 'GAME') {
  const editor = { add: vi.fn(), set: vi.fn(), typeOf: () => type }
  const wrapper = mount(WikiFieldImages, {
    attachTo: document.body,
    props: {
      entry: 7,
      definition: {
        property,
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

  it('asks to cut the empty margin only of the image of an appearance', async () => {
    const appearance = render('IMAGE', 'APPEARANCE')
    await pick(appearance.wrapper, [image('a.png')])
    appearance.wrapper.unmount()
    const person = render('IMAGE', 'PERSON')
    await pick(person.wrapper, [image('b.png')])
    person.wrapper.unmount()
    const logo = render()
    await pick(logo.wrapper, [image('c.png')])
    logo.wrapper.unmount()
    expect(uploadImage.mock.calls.map(([file, options]) => [file.name, options.trim])).toEqual([
      ['a.png', true],
      ['b.png', false],
      ['c.png', false],
    ])
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
