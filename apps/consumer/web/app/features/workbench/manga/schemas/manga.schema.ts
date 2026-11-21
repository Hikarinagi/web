import * as v from 'valibot'

const CHAPTER_TYPES = ['SERIALIZATION', 'EXTRA', 'ONESHOT'] as const
const CHAPTER_NUMBER = /^\d+(\.\d+)?$/

const chapterNumberField = v.pipe(
  v.nullish(v.string('话数应为文本'), ''),
  v.trim(),
  v.maxLength(20, '话数不能超过 20 个字符'),
  v.check(value => !value || CHAPTER_NUMBER.test(value), '话数只填数字，例如 12 或 12.5'),
)

const chapterNameField = v.pipe(
  v.nullish(v.string('标题应为文本'), ''),
  v.trim(),
  v.maxLength(200, '标题不能超过 200 个字符'),
)

const volumeIdField = v.nullish(v.number('单行本应为数字'))

const partField = v.nullish(
  v.pipe(v.number('第几册应为数字'), v.integer('第几册应为整数'), v.minValue(1, '第几册至少为 1')),
)

const partCountField = v.nullish(
  v.pipe(
    v.number('共几册应为数字'),
    v.integer('共几册应为整数'),
    v.minValue(2, '共几册至少为 2'),
    v.maxValue(50, '共几册不能超过 50'),
  ),
)

function splitHasPart(input: { scope?: string; part?: number | null }) {
  return input.scope !== 'SPLIT' || input.part != null
}

function splitHasCount(input: { scope?: string; part_count?: number | null }) {
  return input.scope !== 'SPLIT' || input.part_count != null
}

function splitWithin(input: { scope?: string; part?: number | null; part_count?: number | null }) {
  return (
    input.scope !== 'SPLIT' ||
    input.part == null ||
    input.part_count == null ||
    input.part <= input.part_count
  )
}

function serialNeedsNumber(input: { chapter_type?: string; chapter_number?: string | null }) {
  return input.chapter_type !== 'SERIALIZATION' || !!input.chapter_number?.trim()
}

function extraNeedsName(input: { chapter_type?: string; chapter_name?: string | null }) {
  return input.chapter_type === 'SERIALIZATION' || !!input.chapter_name?.trim()
}

export const createMangaProjectSchema = v.pipe(
  v.object({
    mode: v.picklist(['UPLOAD', 'TRANSLATION'], '请选择投稿类型'),
    scope: v.picklist(['CHAPTER', 'VOLUME', 'SPLIT'], '请选择投稿范围'),
    chapter_id: v.nullish(v.number('话应为数字')),
    chapter_type: v.picklist(CHAPTER_TYPES, '请选择类型'),
    chapter_number: chapterNumberField,
    chapter_name: chapterNameField,
    volume_id: volumeIdField,
    part: partField,
    part_count: partCountField,
    source_lang: v.pipe(v.string('请选择原文语言'), v.nonEmpty('请选择原文语言')),
    target_lang: v.nullish(v.string('译文语言应为文本'), ''),
  }),
  v.forward(v.partialCheck([['scope'], ['part']], splitHasPart, '请填写第几册'), ['part']),
  v.forward(v.partialCheck([['scope'], ['part_count']], splitHasCount, '请填写共几册'), [
    'part_count',
  ]),
  v.forward(
    v.partialCheck([['scope'], ['part'], ['part_count']], splitWithin, '第几册不能大于共几册'),
    ['part'],
  ),
  v.forward(
    v.partialCheck(
      [['scope'], ['chapter_id'], ['chapter_type'], ['chapter_number']],
      input => input.scope !== 'CHAPTER' || input.chapter_id != null || serialNeedsNumber(input),
      '请填写话数',
    ),
    ['chapter_number'],
  ),
  v.forward(
    v.partialCheck(
      [['scope'], ['chapter_id'], ['chapter_type'], ['chapter_name']],
      input => input.scope !== 'CHAPTER' || input.chapter_id != null || extraNeedsName(input),
      '请填写标题',
    ),
    ['chapter_name'],
  ),
  v.forward(
    v.partialCheck(
      [['scope'], ['volume_id']],
      input => input.scope === 'CHAPTER' || input.volume_id != null,
      '请选择单行本',
    ),
    ['volume_id'],
  ),
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

export const mangaChapterInfoSchema = v.pipe(
  v.object({
    chapter_type: v.picklist(CHAPTER_TYPES, '请选择类型'),
    chapter_number: chapterNumberField,
    chapter_name: chapterNameField,
    volume_id: volumeIdField,
  }),
  v.forward(
    v.partialCheck([['chapter_type'], ['chapter_number']], serialNeedsNumber, '请填写话数'),
    ['chapter_number'],
  ),
  v.forward(v.partialCheck([['chapter_type'], ['chapter_name']], extraNeedsName, '请填写标题'), [
    'chapter_name',
  ]),
)

export const mangaVolumeInfoSchema = v.pipe(
  v.object({
    scope: v.picklist(['VOLUME', 'SPLIT'], '请选择投稿范围'),
    chapter_type: v.optional(v.string('类型应为文本')),
    chapter_number: chapterNumberField,
    chapter_name: chapterNameField,
    volume_id: v.number('请选择单行本'),
    part: partField,
    part_count: partCountField,
  }),
  v.forward(v.partialCheck([['scope'], ['part']], splitHasPart, '请填写第几册'), ['part']),
  v.forward(v.partialCheck([['scope'], ['part_count']], splitHasCount, '请填写共几册'), [
    'part_count',
  ]),
  v.forward(
    v.partialCheck([['scope'], ['part'], ['part_count']], splitWithin, '第几册不能大于共几册'),
    ['part'],
  ),
)

export type MangaChapterInfoValues = v.InferOutput<typeof mangaChapterInfoSchema>

export type MangaVolumeInfoValues = v.InferOutput<typeof mangaVolumeInfoSchema>

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
