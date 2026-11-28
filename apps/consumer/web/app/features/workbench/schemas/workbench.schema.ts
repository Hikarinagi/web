import * as v from 'valibot'

export const createProjectSchema = v.pipe(
  v.object({
    mode: v.picklist(['ENTRY', 'TRANSLATION'], issueMessage('validation.workbench.modeRequired')),
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

export type CreateProjectValues = v.InferOutput<typeof createProjectSchema>

export const importBookSchema = v.pipe(
  v.object({
    source: v.picklist(
      ['file', 'current'],
      issueMessage('validation.workbench.importSourceRequired'),
    ),
    file: v.nullable(
      v.custom<File>(
        value => typeof File !== 'undefined' && value instanceof File,
        issueMessage('validation.workbench.fileRequired'),
      ),
    ),
  }),
  v.forward(
    v.partialCheck(
      [['source'], ['file']],
      input => input.source !== 'file' || !!input.file,
      issueMessage('validation.workbench.importFileRequired'),
    ),
    ['file'],
  ),
)

export type ImportBookValues = v.InferOutput<typeof importBookSchema>

export const rejectProjectSchema = v.object({
  reason: v.pipe(
    v.string(issueMessage('validation.workbench.rejectReasonRequired')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.workbench.rejectReasonRequired')),
    v.maxLength(500, issueMessage('validation.workbench.rejectReasonMax')),
  ),
})

export type RejectProjectValues = v.InferOutput<typeof rejectProjectSchema>

export const chapterSchema = v.object({
  title: v.pipe(
    v.string(issueMessage('validation.workbench.chapterTitleRequired')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.workbench.chapterTitleRequired')),
    v.maxLength(200, issueMessage('validation.workbench.chapterTitleMax')),
  ),
  source_title: v.pipe(
    v.nullish(v.string(issueMessage('validation.workbench.sourceTitleType')), ''),
    v.trim(),
    v.maxLength(200, issueMessage('validation.workbench.sourceTitleMax')),
  ),
})

export type ChapterValues = v.InferOutput<typeof chapterSchema>

export const projectMemberSchema = v.object({
  user_id: v.pipe(
    v.number(issueMessage('validation.workbench.userRequired')),
    v.integer(issueMessage('validation.workbench.userRequired')),
    v.minValue(1, issueMessage('validation.workbench.userRequired')),
  ),
  role: v.picklist(
    ['MANAGER', 'TRANSLATOR', 'PROOFREADER', 'TYPESETTER', 'REDRAWER', 'REVIEWER'],
    issueMessage('validation.workbench.roleRequired'),
  ),
})

export type ProjectMemberValues = v.InferOutput<typeof projectMemberSchema>

export const termSchema = v.object({
  source: v.pipe(
    v.string(issueMessage('validation.workbench.termSourceRequired')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.workbench.termSourceRequired')),
    v.maxLength(100, issueMessage('validation.workbench.termSourceMax')),
  ),
  target: v.pipe(
    v.string(issueMessage('validation.workbench.termTargetRequired')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.workbench.termTargetRequired')),
    v.maxLength(100, issueMessage('validation.workbench.termTargetMax')),
  ),
  note: v.pipe(
    v.nullish(v.string(issueMessage('validation.workbench.termNoteType')), ''),
    v.trim(),
    v.maxLength(500, issueMessage('validation.workbench.termNoteMax')),
  ),
  forbidden: v.boolean(issueMessage('validation.workbench.termForbiddenType')),
})

export type TermValues = v.InferOutput<typeof termSchema>

export const creditsSchema = v.object({
  lines: v.pipe(
    v.array(
      v.object({
        role: v.pipe(
          v.string(issueMessage('validation.workbench.creditRoleRequired')),
          v.trim(),
          v.nonEmpty(issueMessage('validation.workbench.creditRoleRequired')),
          v.maxLength(20, issueMessage('validation.workbench.creditRoleMax')),
        ),
        names: v.pipe(
          v.string(issueMessage('validation.workbench.creditNamesRequired')),
          v.trim(),
          v.nonEmpty(issueMessage('validation.workbench.creditNamesRequired')),
          v.maxLength(200, issueMessage('validation.workbench.creditNamesMax')),
        ),
      }),
      issueMessage('validation.workbench.creditsType'),
    ),
    v.maxLength(10, issueMessage('validation.workbench.creditsMax')),
  ),
})

export type CreditsValues = v.InferOutput<typeof creditsSchema>
