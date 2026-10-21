import type { BackendMangaCheck } from '../manga'

export function useReviewCheck(projectId: () => number, initial: () => BackendMangaCheck | null) {
  const check = shallowRef(initial())
  const rerunning = ref(false)
  watch(initial, value => {
    check.value = value
  })

  const { pause, resume } = useIntervalFn(
    async () => {
      const next = await hikariRequest('/api/v3/manga-projects/{project_id}/check', {
        path: { project_id: projectId() },
        toast: false,
      }).catch(() => undefined)
      if (next !== undefined) check.value = next
    },
    5000,
    { immediate: false },
  )

  onMounted(() => {
    watch(
      () => check.value?.status === 'PENDING',
      pending => (pending ? resume() : pause()),
      { immediate: true },
    )
  })

  async function rerun() {
    if (rerunning.value) return
    rerunning.value = true
    try {
      check.value = await hikariRequest('/api/v3/manga-projects/{project_id}/check', {
        method: 'post',
        path: { project_id: projectId() },
      })
    } finally {
      rerunning.value = false
    }
  }

  return { check, rerunning, rerun }
}
