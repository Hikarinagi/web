import type { EditorPresentation } from './types'

export const mangaVolumePresentation: EditorPresentation = {
  fields: {
    series_id: { label: '所属系列' },
    name: { label: '名称' },
    name_reading: { label: '标题读音' },
    name_cn: { label: '中文名' },
    other_names: { label: '别名' },
    volume_number: { label: '卷号' },
    isbn: { label: 'ISBN' },
    label_id: { label: '书系' },
    publisher_id: { label: '出版社' },
    format: { label: '开本' },
    release_status: { label: '发售状态' },
    credits: { label: '创作者' },
    variants: { label: '特装版与限定版', control: 'variants' },
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
    page_count: { label: '页数' },
    summary: { label: '简介', control: 'textarea' },
    summary_cn: { label: '中文简介', control: 'textarea' },
    bangumi_book_id: { label: 'Bangumi 条目 ID' },
    covers: { label: '封面' },
  },
}
