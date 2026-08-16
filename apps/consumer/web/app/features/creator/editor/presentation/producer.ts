import type { EditorPresentation } from './types'

export const producerPresentation: EditorPresentation = {
  fields: {
    name: { label: '名称' },
    aliases: { label: '别名' },
    intro: { label: '简介', control: 'textarea' },
    trans_intro: { label: '译介简介', control: 'textarea' },
    country: { label: '国家/地区' },
    established: { label: '成立时间' },
    logo: { label: 'Logo' },
    website: { label: '官方网站' },
    vndb_id: { label: 'VNDB ID' },
    bangumi_id: { label: 'Bangumi ID' },
    labels: { label: '其他资料', control: 'labels' },
    relations_source: { label: '相关厂商' },
  },
}
