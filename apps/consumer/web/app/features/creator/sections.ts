import type { components } from '@hikarinagi/api-contract/v3'

type WikiSection = components['schemas']['WikiSection']
type EntryType = components['schemas']['EntryDefinitionDto']['type']

export const SECTIONS: { value: WikiSection; label: string; types: EntryType[] }[] = [
  { value: 'GAME', label: '游戏', types: ['GAME', 'PRODUCT'] },
  { value: 'LIGHT_NOVEL', label: '轻小说', types: ['SERIES', 'VOLUME', 'BOOK'] },
  { value: 'MANGA', label: '漫画', types: ['SERIES', 'VOLUME', 'BOOK'] },
  { value: 'PERSON', label: '人物', types: ['PERSON'] },
  { value: 'ORGANIZATION', label: '组织', types: ['ORGANIZATION'] },
  { value: 'CHARACTER', label: '角色', types: ['CHARACTER', 'APPEARANCE'] },
]

export function sectionQuery(section: unknown, type: unknown) {
  const picked = SECTIONS.find(item => item.value === section)
  const entryType = picked?.types.find(item => item === type)
  return {
    ...(picked ? { section: picked.value } : {}),
    ...(entryType ? { entry_type: entryType } : {}),
  }
}
