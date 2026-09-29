import * as v from 'valibot'

export const purchaseQuotaSchema = v.object({
  points: v.pipe(
    v.number('请输入兑换光点'),
    v.integer('光点应为整数'),
    v.minValue(1, '兑换至少 1 光点'),
    v.maxValue(100000, '一次最多可兑换 100000 光点'),
  ),
})

export type PurchaseQuotaValues = v.InferOutput<typeof purchaseQuotaSchema>

export const createProjectSchema = v.pipe(
  v.object({
    mode: v.picklist(['ENTRY', 'TRANSLATION'], '请选择投稿类型'),
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

export type CreateProjectValues = v.InferOutput<typeof createProjectSchema>

export const importBookSchema = v.pipe(
  v.object({
    source: v.picklist(['file', 'current'], '请选择导入来源'),
    file: v.nullable(
      v.custom<File>(value => typeof File !== 'undefined' && value instanceof File, '请选择文件'),
    ),
  }),
  v.forward(
    v.partialCheck(
      [['source'], ['file']],
      input => input.source !== 'file' || !!input.file,
      '请选择要导入的文件',
    ),
    ['file'],
  ),
)

export type ImportBookValues = v.InferOutput<typeof importBookSchema>

export const rejectProjectSchema = v.object({
  reason: v.pipe(
    v.string('请输入退回原因'),
    v.trim(),
    v.nonEmpty('请输入退回原因'),
    v.maxLength(500, '退回原因不能超过 500 个字符'),
  ),
})

export type RejectProjectValues = v.InferOutput<typeof rejectProjectSchema>

export const chapterSchema = v.object({
  title: v.pipe(
    v.string('请输入章节标题'),
    v.trim(),
    v.nonEmpty('请输入章节标题'),
    v.maxLength(200, '章节标题不能超过 200 个字符'),
  ),
  source_title: v.pipe(
    v.nullish(v.string('原标题应为文本'), ''),
    v.trim(),
    v.maxLength(200, '原标题不能超过 200 个字符'),
  ),
})

export type ChapterValues = v.InferOutput<typeof chapterSchema>

export const projectMemberSchema = v.object({
  user_id: v.pipe(v.number('请选择用户'), v.integer('请选择用户'), v.minValue(1, '请选择用户')),
  role: v.picklist(
    ['MANAGER', 'TRANSLATOR', 'PROOFREADER', 'TYPESETTER', 'REDRAWER', 'REVIEWER'],
    '请选择角色',
  ),
})

export type ProjectMemberValues = v.InferOutput<typeof projectMemberSchema>

export const termSchema = v.object({
  source: v.pipe(
    v.string('请输入原文写法'),
    v.trim(),
    v.nonEmpty('请输入原文写法'),
    v.maxLength(100, '原文写法不能超过 100 个字符'),
  ),
  target: v.pipe(
    v.string('请输入译法'),
    v.trim(),
    v.nonEmpty('请输入译法'),
    v.maxLength(100, '译法不能超过 100 个字符'),
  ),
  note: v.pipe(
    v.nullish(v.string('备注应为文本'), ''),
    v.trim(),
    v.maxLength(500, '备注不能超过 500 个字符'),
  ),
  forbidden: v.boolean('禁用译法应为开关'),
})

export type TermValues = v.InferOutput<typeof termSchema>

export const creditsSchema = v.object({
  lines: v.pipe(
    v.array(
      v.object({
        role: v.pipe(
          v.string('请输入职责'),
          v.trim(),
          v.nonEmpty('请输入职责'),
          v.maxLength(20, '职责不能超过 20 个字符'),
        ),
        names: v.pipe(
          v.string('请输入署名'),
          v.trim(),
          v.nonEmpty('请输入署名'),
          v.maxLength(200, '署名不能超过 200 个字符'),
        ),
      }),
      '署名应为列表',
    ),
    v.maxLength(10, '最多补充 10 行署名'),
  ),
})

export type CreditsValues = v.InferOutput<typeof creditsSchema>
