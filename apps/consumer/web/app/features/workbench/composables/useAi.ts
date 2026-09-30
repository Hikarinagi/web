import type { BackendAiModel } from '~/features/workbench/workbench'

export function useAiModels(scene: string, vision = false) {
  const models = ref<BackendAiModel[]>([])
  const model = ref<string | null>(null)
  const selected = computed(() => models.value.find(item => item.key === model.value) ?? null)

  async function load() {
    models.value = await hikariRequest('/api/v3/ai/models', {
      query: { scene, vision: vision || undefined },
      toast: false,
    }).catch(() => [])
    if (!models.value.some(item => item.key === model.value)) {
      model.value = (models.value.find(item => item.is_default) ?? models.value[0])?.key ?? null
    }
  }

  return { models, model, selected, load }
}
