export type WorkTagResource = 'galgames' | 'light-novels' | 'mangas'

export interface WorkTag {
  id: number
  name: string
  likes: number
  mine: number
  proposed: boolean
  spoiler: boolean
}

export const TAG_REJECT_LABELS: Record<string, string> = {
  opinion: '是评价',
  comment: '是评论',
  personal: '是个人备注',
  rating: '表示年龄分级',
  character: '是角色名',
  brand: '是品牌名称',
  person: '是人名',
  year: '是年份',
  platform: '是平台名称',
  field: '属于作品资料',
}

export const TAG_REJECT_ACTIONS: Record<string, { label: string; target: string }> = {
  opinion: { label: '为作品评分', target: 'reviews' },
  comment: { label: '写短评', target: 'reviews' },
  personal: { label: '标记状态', target: 'top' },
  cast: { label: '查看出场角色', target: 'cast' },
}

export const tagKey = (text: string) => text.normalize('NFKC').toLowerCase().replace(/\s+/g, '')
