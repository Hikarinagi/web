import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

export const editorSubmitSchema = v.object({
  summary: v.pipe(v.string('变更说明为必填项'), v.trim(), v.nonEmpty('变更说明为必填项')),
})
export type EditorSubmitValues = v.InferOutput<typeof editorSubmitSchema>
export const editorSubmitResolver = valibotResolver(editorSubmitSchema)
