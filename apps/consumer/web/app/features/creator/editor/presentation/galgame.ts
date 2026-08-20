import type { EditorPresentation } from './types'
import { LANGUAGE_OPTIONS } from './enum-labels'
import { PLATFORM_OPTIONS } from '~/features/galgame/platforms'

export const galgamePresentation: EditorPresentation = {
  fields: {
    trans_title: { label: '译名' },
    origin_title: { label: '原名' },
    en_title: { label: '英文标题' },
    aliases: { label: '别名' },
    start_date: {
      label: '开始时间',
      enableWhen: values => values.start_date_tbd !== true,
    },
    start_date_year_only: {
      label: '只选取年份',
      help: '只确认到年份时开启，保存后仅按年份展示。',
      enableWhen: values => values.start_date_tbd !== true,
    },
    start_date_tbd: { label: '开始时间待定' },
    start_date_tbd_note: {
      label: '待定说明',
      enableWhen: values => values.start_date_tbd === true,
      requireWhen: values => values.start_date_tbd === true,
    },
    end_date: { label: '完结时间' },
    end_date_year_only: {
      label: '只选取年份',
      help: '只确认到年份时开启，保存后仅按年份展示。',
    },
    origin_intro: { label: '原文简介', control: 'textarea' },
    trans_intro: { label: '译介简介', control: 'textarea' },
    en_intro: { label: '英文简介', control: 'textarea' },
    adv_type: { label: 'ADV 类型' },
    platforms: { label: '平台', control: 'multiselect', options: PLATFORM_OPTIONS },
    homepage: { label: '官方网站' },
    prices: { label: '价格' },
    external_links: { label: '外部链接', control: 'external-links' },
    steam_apps: { label: 'Steam App ID', control: 'steam-apps' },
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
