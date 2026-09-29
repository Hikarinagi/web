import * as v from 'valibot'

export const createMangaProjectSchema = v.pipe(
  v.object({
    mode: v.picklist(['UPLOAD', 'TRANSLATION'], '请选择投稿类型'),
    chapter_id: v.nullish(v.number('话应为数字')),
    chapter_number: v.pipe(
      v.nullish(v.string('话数应为文本'), ''),
      v.trim(),
      v.maxLength(20, '话数不能超过 20 个字符'),
    ),
    chapter_name: v.pipe(
      v.nullish(v.string('标题应为文本'), ''),
      v.trim(),
      v.maxLength(200, '标题不能超过 200 个字符'),
    ),
    source_lang: v.pipe(v.string('请选择原文语言'), v.nonEmpty('请选择原文语言')),
    target_lang: v.nullish(v.string('译文语言应为文本'), ''),
  }),
  v.forward(
    v.partialCheck(
      [['mode'], ['target_lang']],
      input => input.mode !== 'TRANSLATION' || !!input.target_lang,
      '请选择译文语言',
    ),
    ['target_lang'],
  ),
  v.forward(
    v.partialCheck(
      [['mode'], ['source_lang'], ['target_lang']],
      input => input.mode !== 'TRANSLATION' || input.source_lang !== input.target_lang,
      '译文语言不能与原文语言相同',
    ),
    ['target_lang'],
  ),
)

export type CreateMangaProjectValues = v.InferOutput<typeof createMangaProjectSchema>

export const mangaChapterInfoSchema = v.object({
  chapter_number: v.pipe(
    v.nullish(v.string('话数应为文本'), ''),
    v.trim(),
    v.maxLength(20, '话数不能超过 20 个字符'),
  ),
  chapter_name: v.pipe(
    v.nullish(v.string('标题应为文本'), ''),
    v.trim(),
    v.maxLength(200, '标题不能超过 200 个字符'),
  ),
  volume_number: v.nullish(
    v.pipe(v.number('卷数应为数字'), v.integer('卷数应为整数'), v.minValue(0, '卷号不能小于 0')),
  ),
})

export type MangaChapterInfoValues = v.InferOutput<typeof mangaChapterInfoSchema>

export const importLabelPlusSchema = v.object({
  file: v.custom<File | null>(
    value => typeof File !== 'undefined' && value instanceof File,
    '请选择要导入的翻译稿',
  ),
  target: v.picklist(['source', 'translation'], '请选择导入为原文还是译文'),
  replace: v.boolean('清空重导应为开关'),
})

export type ImportLabelPlusValues = v.InferOutput<typeof importLabelPlusSchema>

export const mangaNoteSchema = v.object({
  content: v.pipe(
    v.string('请输入批注'),
    v.trim(),
    v.nonEmpty('请输入批注'),
    v.maxLength(1000, '批注不能超过 1000 个字符'),
  ),
})

export type MangaNoteValues = v.InferOutput<typeof mangaNoteSchema>
