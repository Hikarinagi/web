import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'

export interface CreatableEntityConfig {
  resource_type: 'TAG' | 'PERSON' | 'PRODUCER' | 'CHARACTER'
  label: string
}

export const CREATABLE_ENTITY: Partial<Record<EntityTarget, CreatableEntityConfig>> = {
  tag: { resource_type: 'TAG', label: '标签' },
  person: { resource_type: 'PERSON', label: '人物' },
  producer: { resource_type: 'PRODUCER', label: '厂商' },
  character: { resource_type: 'CHARACTER', label: '角色' },
}
