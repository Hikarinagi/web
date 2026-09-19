import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EditButton from '../../app/components/work/EditButton.vue'
import type { WorkResourceSlug } from '../../app/features/revision/resources'

function render(resourceType: WorkResourceSlug, resourceId: number) {
  return mount(EditButton, { props: { resourceType, resourceId } })
}

describe('WorkEditButton', () => {
  it.each([
    ['galgame', '/create/edit/galgame/12'],
    ['light-novel', '/create/edit/light-novel/12'],
    ['light-novel-volume', '/create/edit/light-novel-volume/12'],
    ['manga', '/create/edit/manga/12'],
    ['manga-volume', '/create/edit/manga-volume/12'],
  ] as const)('%s 指向正确的编辑路径', (type, href) => {
    expect(render(type, 12).get('a').attributes('href')).toBe(href)
  })

  it('纯图标按钮仍要给读屏器留下名字', () => {
    expect(render('galgame', 1).get('a').attributes('aria-label')).toBe('修订此条目')
  })

  it('在新标签页打开，不打断当前浏览', () => {
    expect(render('galgame', 1).get('a').attributes('target')).toBe('_blank')
  })
})
