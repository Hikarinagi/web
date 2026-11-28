import * as v from 'valibot'

const CHAPTER_TYPES = ['SERIALIZATION', 'EXTRA', 'ONESHOT'] as const
const CHAPTER_NUMBER = /^\d+(\.\d+)?$/

const chapterNumberField = v.pipe(
  v.nullish(v.string(issueMessage('validation.workbench.manga.chapterNumberType')), ''),
  v.trim(),
  v.maxLength(20, issueMessage('validation.workbench.manga.chapterNumberMax')),
  v.check(
    value => !value || CHAPTER_NUMBER.test(value),
    issueMessage('validation.workbench.manga.chapterNumberFormat'),
  ),
)

const chapterNameField = v.pipe(
  v.nullish(v.string(issueMessage('validation.workbench.manga.chapterNameType')), ''),
  v.trim(),
  v.maxLength(200, issueMessage('validation.workbench.manga.chapterNameMax')),
)

const volumeIdField = v.nullish(v.number(issueMessage('validation.workbench.manga.volumeType')))

function serialNeedsNumber(input: { chapter_type?: string; chapter_number?: string | null }) {
  return input.chapter_type !== 'SERIALIZATION' || !!input.chapter_number?.trim()
}

function extraNeedsName(input: { chapter_type?: string; chapter_name?: string | null }) {
  return input.chapter_type === 'SERIALIZATION' || !!input.chapter_name?.trim()
}

const hintField = v.pipe(
  v.nullish(v.string(issueMessage('validation.workbench.manga.hintType')), ''),
  v.trim(),
  v.maxLength(40, issueMessage('validation.workbench.manga.hintMax')),
)

export const createMangaProjectSchema = v.pipe(
  v.object({
    mode: v.picklist(['UPLOAD', 'TRANSLATION'], issueMessage('validation.workbench.modeRequired')),
    hint: hintField,
    source_lang: v.pipe(
      v.string(issueMessage('validation.workbench.sourceLangRequired')),
      v.nonEmpty(issueMessage('validation.workbench.sourceLangRequired')),
    ),
    target_lang: v.nullish(v.string(issueMessage('validation.workbench.targetLangType')), ''),
  }),
  v.forward(
    v.partialCheck(
      [['mode'], ['target_lang']],
      input => input.mode !== 'TRANSLATION' || !!input.target_lang,
      issueMessage('validation.workbench.targetLangRequired'),
    ),
    ['target_lang'],
  ),
  v.forward(
    v.partialCheck(
      [['mode'], ['source_lang'], ['target_lang']],
      input => input.mode !== 'TRANSLATION' || input.source_lang !== input.target_lang,
      issueMessage('validation.workbench.targetLangSame'),
    ),
    ['target_lang'],
  ),
)

export type CreateMangaProjectValues = v.InferOutput<typeof createMangaProjectSchema>

export const mangaHintSchema = v.object({ hint: hintField })

export type MangaHintValues = v.InferOutput<typeof mangaHintSchema>

export const mangaChapterInfoSchema = v.pipe(
  v.object({
    chapter_type: v.picklist(
      CHAPTER_TYPES,
      issueMessage('validation.workbench.manga.chapterTypeRequired'),
    ),
    chapter_number: chapterNumberField,
    chapter_name: chapterNameField,
    volume_id: volumeIdField,
  }),
  v.forward(
    v.partialCheck(
      [['chapter_type'], ['chapter_number']],
      serialNeedsNumber,
      issueMessage('validation.workbench.manga.chapterNumberRequired'),
    ),
    ['chapter_number'],
  ),
  v.forward(
    v.partialCheck(
      [['chapter_type'], ['chapter_name']],
      extraNeedsName,
      issueMessage('validation.workbench.manga.chapterNameRequired'),
    ),
    ['chapter_name'],
  ),
)

export const mangaVolumeInfoSchema = v.object({
  chapter_type: v.optional(v.string(issueMessage('validation.workbench.manga.chapterTypeType'))),
  chapter_number: chapterNumberField,
  chapter_name: chapterNameField,
  volume_id: v.number(issueMessage('validation.workbench.manga.volumeRequired')),
})

export type MangaChapterInfoValues = v.InferOutput<typeof mangaChapterInfoSchema>

export const importLabelPlusSchema = v.object({
  file: v.custom<File | null>(
    value => typeof File !== 'undefined' && value instanceof File,
    issueMessage('validation.workbench.manga.importFileRequired'),
  ),
  target: v.picklist(
    ['source', 'translation'],
    issueMessage('validation.workbench.manga.importTargetRequired'),
  ),
  replace: v.boolean(issueMessage('validation.workbench.manga.importReplaceType')),
})

export type ImportLabelPlusValues = v.InferOutput<typeof importLabelPlusSchema>

export const mangaNoteSchema = v.object({
  content: v.pipe(
    v.string(issueMessage('validation.workbench.manga.noteRequired')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.workbench.manga.noteRequired')),
    v.maxLength(1000, issueMessage('validation.workbench.manga.noteMax')),
  ),
})

export type MangaNoteValues = v.InferOutput<typeof mangaNoteSchema>
