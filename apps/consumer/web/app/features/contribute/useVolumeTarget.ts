import { firstFree, NEW_TARGET, volumeOptions } from './manga-options'
import type { CreateMangaProjectValues } from '~/features/workbench/manga/schemas/manga.schema'
import type { MangaTargetChapter, MangaTargetClaim, MangaTargetVolume } from './manga-target'

interface CreatedVolume {
  id: number
  label: string
}

export function useVolumeTarget(input: {
  volumes: Ref<MangaTargetVolume[]>
  chapters: Ref<MangaTargetChapter[]>
  claims: Ref<MangaTargetClaim[]>
  published: Ref<MangaTargetClaim[]>
  values: Pick<CreateMangaProjectValues, 'volume_id' | 'mode'>
  fixed: () => boolean
}) {
  const auth = useAuthStore()
  const createOpen = ref(false)
  const created = ref<CreatedVolume | null>(null)

  const choices = computed(() => {
    const options = volumeOptions(input.volumes.value, input.chapters.value, input.claims.value, {
      published: input.published.value,
      upload: input.values.mode === 'UPLOAD',
      viewerId: auth.user?.id ?? null,
    })
    if (created.value && !options.some(option => option.value === created.value!.id)) {
      options.splice(options.length - 1, 0, { value: created.value.id, label: created.value.label })
    }
    return options
  })
  const nextNumber = computed(() => {
    const numbers = input.volumes.value
      .map(volume => volume.volume_number)
      .filter((value): value is number => value != null)
    return numbers.length ? Math.max(...numbers) + 1 : 1
  })
  const model = computed<number | string | null>({
    get: () => input.values.volume_id ?? null,
    set: value => {
      if (value === NEW_TARGET) createOpen.value = true
      else input.values.volume_id = value == null ? null : Number(value)
    },
  })
  const replaced = computed(
    () => choices.value.find(option => option.value === input.values.volume_id)?.pages ?? null,
  )

  function onCreated(volume: CreatedVolume) {
    created.value = volume
    input.values.volume_id = volume.id
  }

  watch(choices, options => {
    if (!input.fixed()) input.values.volume_id = firstFree(options)
  })

  return { createOpen, created, choices, nextNumber, model, replaced, onCreated }
}
