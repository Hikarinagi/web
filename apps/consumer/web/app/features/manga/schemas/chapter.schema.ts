import * as v from 'valibot'

const CHAPTER_NUMBER = /^\d+(\.\d+)?$/

export const mangaChapterEditSchema = v.pipe(
  v.object({
    chapter_type: v.picklist(['SERIALIZATION', 'EXTRA', 'ONESHOT', 'VOLUME'], '请选择类型'),
    chapter_number: v.pipe(
      v.nullish(v.string('话数应为文本'), ''),
      v.trim(),
      v.maxLength(20, '话数不能超过 20 个字符'),
      v.check(value => !value || CHAPTER_NUMBER.test(value), '话数只填数字，例如 12 或 12.5'),
    ),
    name: v.pipe(
      v.nullish(v.string('标题应为文本'), ''),
      v.trim(),
      v.maxLength(300, '标题不能超过 300 个字符'),
    ),
    volume_id: v.nullish(v.number('单行本应为数字')),
    publication_date: v.nullish(v.string('发表日期应为文本'), ''),
  }),
  v.forward(
    v.partialCheck(
      [['chapter_type'], ['chapter_number']],
      input => input.chapter_type !== 'SERIALIZATION' || !!input.chapter_number?.trim(),
      '请填写话数',
    ),
    ['chapter_number'],
  ),
  v.forward(
    v.partialCheck(
      [['chapter_type'], ['name']],
      input =>
        input.chapter_type === 'SERIALIZATION' ||
        input.chapter_type === 'VOLUME' ||
        !!input.name?.trim(),
      '请填写标题',
    ),
    ['name'],
  ),
  v.forward(
    v.partialCheck(
      [['chapter_type'], ['volume_id']],
      input => input.chapter_type !== 'VOLUME' || input.volume_id != null,
      '请选择单行本',
    ),
    ['volume_id'],
  ),
)

export type MangaChapterEditValues = v.InferOutput<typeof mangaChapterEditSchema>
