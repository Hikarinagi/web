import * as v from 'valibot'

const optionText = v.pipe(
  v.nullish(v.string(issueMessage('validation.interaction.optionType')), ''),
  v.trim(),
  v.maxLength(80, issueMessage('validation.interaction.optionMax')),
)

const shared = {
  question: v.pipe(
    v.string(issueMessage('validation.interaction.questionType')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.interaction.questionRequired')),
    v.maxLength(120, issueMessage('validation.interaction.questionMax')),
  ),
  allow_multiple: v.boolean(issueMessage('validation.interaction.allowMultipleType')),
  max_choices: v.nullable(
    v.pipe(
      v.number(issueMessage('validation.interaction.maxChoicesType')),
      v.integer(issueMessage('validation.interaction.maxChoicesInteger')),
      v.minValue(2, issueMessage('validation.interaction.maxChoicesMin')),
    ),
  ),
  is_public: v.boolean(issueMessage('validation.interaction.publicType')),
  allow_change: v.boolean(issueMessage('validation.interaction.allowChangeType')),
  closes_at: v.nullable(v.string(issueMessage('validation.interaction.closesAtType'))),
}

export const pollSchema = v.object({
  ...shared,
  options: v.pipe(
    v.array(optionText, issueMessage('validation.interaction.optionsType')),
    v.check(
      items => items.filter(item => item.length > 0).length >= 2,
      issueMessage('validation.interaction.optionsMin'),
    ),
  ),
})

export const pollLockedSchema = v.object({
  ...shared,
  options: v.array(optionText, issueMessage('validation.interaction.optionsType')),
})

export type PollValues = v.InferOutput<typeof pollSchema>
