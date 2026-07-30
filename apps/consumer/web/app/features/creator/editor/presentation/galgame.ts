import type { EditorPresentation } from './types'
import { LANGUAGE_OPTIONS } from './enum-labels'
import { PLATFORM_OPTIONS } from '~/features/galgame/platforms'

export const galgamePresentation: EditorPresentation = {
  fields: {
    trans_title: { label: '译名' },
    origin_title: { label: '原名' },
    aliases: { label: '别名' },
    release_date: {
      label: '发售日期',
      enableWhen: values => values.release_date_tbd !== true,
    },
    release_date_tbd: { label: '发售日期待定' },
    release_date_tbd_note: {
      label: '待定说明',
      enableWhen: values => values.release_date_tbd === true,
      requireWhen: values => values.release_date_tbd === true,
    },
    origin_intro: { label: '原文简介', control: 'textarea' },
    trans_intro: { label: '译介简介', control: 'textarea' },
    adv_type: { label: 'ADV 类型' },
    platforms: { label: '平台', control: 'multiselect', options: PLATFORM_OPTIONS },
    homepage: { label: '官方网站' },
    prices: { label: '价格' },
    nsfw: { label: 'NSFW' },
    engine: { label: '引擎' },
    origin_lang: { label: '原始语言', control: 'select', options: LANGUAGE_OPTIONS },
    dev_status: { label: '开发状态' },
    vndb_id: { label: 'VNDB ID' },
    bangumi_game_id: { label: 'Bangumi 条目 ID' },
    tags: { label: '标签' },
    producers: { label: '厂商' },
    staffs: { label: 'STAFF' },
    characters: { label: '角色' },
    covers: { label: '封面' },
    images: { label: '截图 / CG' },
    source_relations: { label: '相关作品' },
  },
}
