import { usernameError } from '@hikarinagi/shared'
import * as v from 'valibot'

// One rule, shared with the API and the IdP; the message comes from the first failing check.
export const usernameSchema = v.object({
  username: v.pipe(
    v.string('用户名应为文本'),
    v.trim(),
    v.rawCheck(({ dataset, addIssue }) => {
      if (!dataset.typed) return
      const message = usernameError(dataset.value)
      if (message) addIssue({ message })
    }),
  ),
})
export type UsernameValues = v.InferOutput<typeof usernameSchema>
