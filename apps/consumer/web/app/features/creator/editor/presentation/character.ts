import type { EditorPresentation } from './types'

export const characterPresentation: EditorPresentation = {
  fields: {
    name: { label: '姓名' },
    trans_name: { label: '译名' },
    aliases: { label: '别名' },
    intro: { label: '简介', control: 'textarea' },
    trans_intro: { label: '译介简介', control: 'textarea' },
    image: { label: '立绘' },
    gender: {
      label: '性别',
      control: 'select',
      options: [
        { value: '女', label: '女' },
        { value: '男', label: '男' },
        { value: '其他', label: '其他' },
      ],
    },
    blood_type: {
      label: '血型',
      control: 'select',
      options: [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'AB', label: 'AB' },
        { value: 'O', label: 'O' },
      ],
    },
    cup: { label: '罩杯' },
    birthday_month: { label: '生日(月)' },
    birthday_day: { label: '生日(日)' },
    height: { label: '身高 (cm)' },
    weight: { label: '体重 (kg)' },
    bust: { label: '胸围 (cm)' },
    waist: { label: '腰围 (cm)' },
    hips: { label: '臀围 (cm)' },
    age: { label: '年龄' },
    vndb_id: { label: 'VNDB ID' },
    bangumi_id: { label: 'Bangumi ID' },
    labels: { label: '其他资料', control: 'labels' },
  },
}
