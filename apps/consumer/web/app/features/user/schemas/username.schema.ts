import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, usernameIssue } from '@hikarinagi/shared'
import * as v from 'valibot'

export const usernameSchema = v.object({
  username: v.pipe(
    v.string(issueMessage('validation.user.usernameType')),
    v.trim(),
    v.rawCheck(({ dataset, addIssue }) => {
      if (!dataset.typed) return
      const issue = usernameIssue(dataset.value)
      if (!issue) return
      addIssue({
        message: translate(`validation.user.username.${issue}`, {
          min: USERNAME_MIN_LENGTH,
          max: USERNAME_MAX_LENGTH,
        }),
      })
    }),
  ),
})
export type UsernameValues = v.InferOutput<typeof usernameSchema>
