import * as v from 'valibot'

const CHAPTER_NUMBER = /^\d+(\.\d+)?$/

export const mangaChapterEditSchema = v.pipe(
  v.object({
    chapter_type: v.picklist(
      ['SERIALIZATION', 'EXTRA', 'VOLUME'],
      issueMessage('validation.manga.chapterTypeRequired'),
    ),
    chapter_number: v.pipe(
      v.nullish(v.string(issueMessage('validation.manga.chapterNumberType')), ''),
      v.trim(),
      v.maxLength(20, issueMessage('validation.manga.chapterNumberMax')),
      v.check(
        value => !value || CHAPTER_NUMBER.test(value),
        issueMessage('validation.manga.chapterNumberFormat'),
      ),
    ),
    title: v.pipe(
      v.nullish(v.string(issueMessage('validation.manga.titleType')), ''),
      v.trim(),
      v.maxLength(300, issueMessage('validation.manga.titleMax')),
    ),
    volume_id: v.nullish(v.number(issueMessage('validation.manga.volumeType'))),
    publication_date: v.nullish(v.string(issueMessage('validation.manga.publicationDateType')), ''),
  }),
  v.forward(
    v.partialCheck(
      [['chapter_type'], ['chapter_number']],
      input => input.chapter_type !== 'SERIALIZATION' || !!input.chapter_number?.trim(),
      issueMessage('validation.manga.chapterNumberRequired'),
    ),
    ['chapter_number'],
  ),
  v.forward(
    v.partialCheck(
      [['chapter_type'], ['title']],
      input => input.chapter_type !== 'EXTRA' || !!input.title?.trim(),
      issueMessage('validation.manga.titleRequired'),
    ),
    ['title'],
  ),
  v.forward(
    v.partialCheck(
      [['chapter_type'], ['volume_id']],
      input => input.chapter_type !== 'VOLUME' || input.volume_id != null,
      issueMessage('validation.manga.volumeRequired'),
    ),
    ['volume_id'],
  ),
)

export type MangaChapterEditValues = v.InferOutput<typeof mangaChapterEditSchema>
