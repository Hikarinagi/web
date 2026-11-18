import { describe, expect, it } from 'vitest'
import { groupsOf } from '~/features/wiki/editor/layout'

describe('groupsOf', () => {
  it('places every defined property, putting the ones without a group last', () => {
    const groups = groupsOf('PERSON', ['NAME', 'WEBSITE', 'GENDER', 'ALIAS'])
    expect(groups).toEqual([
      { title: '基本资料', properties: ['NAME', 'GENDER'] },
      { title: '链接', properties: ['WEBSITE'] },
      { title: '其他', properties: ['ALIAS'] },
    ])
  })

  it('edits the credits of a game, its developer among them, as its own section', () => {
    expect(groupsOf('GAME', ['TITLE', 'CREDIT'])).toEqual([
      { title: '标题', properties: ['TITLE'] },
      { title: '制作信息', properties: ['CREDIT'] },
    ])
  })

  it('keeps the properties the system maintains out of the form', () => {
    const groups = groupsOf('APPEARANCE', ['WORK', 'CHARACTER', 'LABEL', 'LABEL_NUMBER'])
    expect(groups.flatMap(group => group.properties)).toEqual(['WORK', 'LABEL'])
  })
})
