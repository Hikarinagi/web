import type { EditorPresentation } from './types'

export const lightNovelPresentation: EditorPresentation = {
  fields: {
    name: { label: '名称' },
    name_cn: { label: '中文名' },
    other_names: { label: '别名' },
    cover_id: { label: '封面' },
    author_id: { label: '作者' },
    bunko_id: { label: '文库' },
    novel_status: { label: '连载状态' },
    publication_date: { label: '出版日期' },
    summary: { label: '简介', control: 'textarea' },
    summary_cn: { label: '中文简介', control: 'textarea' },
    nsfw: { label: 'NSFW' },
    bangumi_book_id: { label: 'Bangumi 条目 ID' },
    illustrators: { label: '插画' },
    publishers: { label: '出版商' },
    characters: { label: '角色' },
    tags: { label: '标签' },
    covers: { label: '封面' },
    source_relations: { label: '相关作品' },
  },
}
