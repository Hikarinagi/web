import * as v from 'valibot'

export const developerAppSchema = v.object({
  client_name: v.pipe(
    v.string(issueMessage('validation.developer.clientNameRequired')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.developer.clientNameRequired')),
    v.maxLength(64, issueMessage('validation.developer.clientNameMax')),
  ),
  form: v.picklist(['server', 'spa', 'native'], issueMessage('validation.developer.formRequired')),
})
export type DeveloperAppValues = v.InferOutput<typeof developerAppSchema>

export const developerAppProfileSchema = v.object({
  client_name: v.pipe(
    v.string(issueMessage('validation.developer.clientNameRequired')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.developer.clientNameRequired')),
    v.maxLength(64, issueMessage('validation.developer.clientNameMax')),
  ),
  client_uri: v.pipe(
    v.nullish(v.string(issueMessage('validation.developer.clientUriType')), ''),
    v.trim(),
    v.check(
      value => !value || /^https:\/\/[^#\s]+$/i.test(value),
      issueMessage('validation.developer.clientUriFormat'),
    ),
  ),
})
export type DeveloperAppProfileValues = v.InferOutput<typeof developerAppProfileSchema>

export const developerAppRedirectSchema = v.object({
  uri: v.pipe(
    v.string(issueMessage('validation.developer.redirectUriRequired')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.developer.redirectUriRequired')),
    v.check(
      value => !value.includes('#'),
      issueMessage('validation.developer.redirectUriFragment'),
    ),
    v.check(
      value => /^[a-z][a-z0-9+.-]*:/i.test(value),
      issueMessage('validation.developer.redirectUriScheme'),
    ),
  ),
})
export type DeveloperAppRedirectValues = v.InferOutput<typeof developerAppRedirectSchema>
