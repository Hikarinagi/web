import type { EditorPresentation } from './types'

export const lightNovelVolumePresentation: EditorPresentation = {
  fields: {
    series_id: { label: '所属系列' },
    name: { label: '名称' },
    name_cn: { label: '中文名' },
    volume_type: { label: '卷类型' },
    volume_number: { label: '卷号' },
    volume_label: { label: '卷标' },
    cover_id: { label: '封面' },
    isbn: { label: 'ISBN' },
    price_amount: { label: '价格' },
    price_currency: {
      label: '货币',
      control: 'select',
      options: [
        { value: 'JPY', label: 'JPY' },
        { value: 'CNY', label: 'CNY' },
        { value: 'USD', label: 'USD' },
        { value: 'TWD', label: 'TWD' },
        { value: 'HKD', label: 'HKD' },
        { value: 'KRW', label: 'KRW' },
      ],
    },
    publication_date: { label: '出版日期' },
    pages: { label: '页数' },
    summary: { label: '简介', control: 'textarea' },
    summary_cn: { label: '中文简介', control: 'textarea' },
    bangumi_book_id: { label: 'Bangumi 条目 ID' },
    covers: { label: '封面' },
  },
}
