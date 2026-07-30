import type { EditorPresentation } from './types'

export const personPresentation: EditorPresentation = {
  fields: {
    name: { label: '姓名' },
    trans_name: { label: '译名' },
    aliases: { label: '别名' },
    intro: { label: '简介', control: 'textarea' },
    trans_intro: { label: '译介简介', control: 'textarea' },
    image: { label: '头像' },
    gender: {
      label: '性别',
      control: 'select',
      options: [
        { value: '女', label: '女' },
        { value: '男', label: '男' },
        { value: '其他', label: '其他' },
      ],
    },
    vndb_id: { label: 'VNDB ID' },
    bangumi_id: { label: 'Bangumi ID' },
    labels: { label: '其他资料', control: 'labels' },
  },
}
