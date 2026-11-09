import type { ApiData } from '@hikarinagi/api-contract/v3'

type Definitions = ApiData<'/api/v3/wiki/definitions', 'get'>

export function wikiNames(definitions: Definitions, types: Iterable<string>) {
  const wanted = new Set(types)
  return Object.fromEntries(
    definitions
      .filter(definition => wanted.has(definition.type))
      .map(definition => [
        definition.type,
        {
          label: definition.label,
          properties: Object.fromEntries(
            definition.properties.map(property => [property.property, property.label]),
          ),
        },
      ]),
  )
}
