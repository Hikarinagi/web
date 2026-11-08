import * as v from 'valibot'

export const EDITOR_RESOURCE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Galgame', value: 'galgame' },
  { label: '轻小说', value: 'light-novel' },
  { label: '轻小说卷', value: 'light-novel-volume' },
  { label: '漫画', value: 'manga' },
  { label: '漫画单行本', value: 'manga-volume' },
  { label: '人物', value: 'person' },
  { label: '厂商', value: 'producer' },
  { label: '角色', value: 'character' },
  { label: '标签', value: 'tag' },
]

export const findSchema = v.object({
  resource_type: v.picklist(
    EDITOR_RESOURCE_OPTIONS.map(option => option.value),
    '请选择条目类型',
  ),
  q: v.pipe(v.string('标题应为文本'), v.trim(), v.nonEmpty('请输入标题、链接或编号')),
  author: v.pipe(v.nullish(v.string('作者应为文本'), ''), v.trim()),
  work: v.pipe(v.nullish(v.string('所属作品应为文本'), ''), v.trim()),
})

export type FindValues = v.InferOutput<typeof findSchema>

export const newEntrySchema = v.object({
  original: v.pipe(v.string('原名应为文本'), v.trim(), v.nonEmpty('请输入原名')),
  chinese: v.pipe(v.nullish(v.string('中文名应为文本'), ''), v.trim()),
})

export type NewEntryValues = v.InferOutput<typeof newEntrySchema>
