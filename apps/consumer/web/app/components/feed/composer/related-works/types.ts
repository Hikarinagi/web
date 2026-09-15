import type { WorkType } from '#shared/utils/work'
import type { PickedEntity } from '~/components/hikari-editor/plugins/entity-card/search'
import type { ComposerWork } from '../composables/useComposer'

export function composerWorkType(entity: PickedEntity): WorkType {
  if (entity.kind === 'galgame') return 'GALGAME'
  return entity.kind === 'light_novel' ? 'LIGHT_NOVEL' : 'MANGA'
}

export function composerWorkKey(work: Pick<ComposerWork, 'work_type' | 'id'>) {
  return `${work.work_type}:${work.id}`
}

export function toComposerWork(entity: PickedEntity): ComposerWork {
  return {
    work_type: composerWorkType(entity),
    id: entity.entity_id,
    title: entity.display.title,
  }
}
