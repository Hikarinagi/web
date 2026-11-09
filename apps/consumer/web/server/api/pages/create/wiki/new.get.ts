import type { H3Event } from 'h3'
import { MATCHING_CODES } from '~/features/wiki/codes'
import { fetchBackendData } from '~~/server/utils/backend-api'
import { definePageBffHandler } from '~~/server/utils/page-bff'

async function handler(event: H3Event) {
  const definitions = await fetchBackendData(event, '/api/v3/wiki/definitions')
  return {
    definitions: definitions.map(definition => ({
      ...definition,
      properties: definition.properties.map(property =>
        property.property === 'IDENTIFIER' && property.codes
          ? { ...property, codes: property.codes.filter(code => !MATCHING_CODES.includes(code)) }
          : property,
      ),
    })),
  }
}

export type NewEntryPageData = Awaited<ReturnType<typeof handler>>
export default definePageBffHandler(handler)
