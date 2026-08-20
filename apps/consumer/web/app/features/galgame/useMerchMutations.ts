import type { ApiRequestBody } from '@hikarinagi/api-contract/v3'

export type CreateMerchBody = ApiRequestBody<'/api/v3/galgames/{id}/merchs', 'post'>

export function useMerchMutations(galgameId: number) {
  const submitting = ref(false)

  async function create(body: CreateMerchBody) {
    if (submitting.value) return
    submitting.value = true
    try {
      await hikariRequest<'/api/v3/galgames/{id}/merchs', 'post'>('/api/v3/galgames/{id}/merchs', {
        method: 'post',
        path: { id: galgameId },
        body,
      })
      await refreshNuxtData()
    } finally {
      submitting.value = false
    }
  }

  return { submitting, create }
}

export function useMerchRemove() {
  const confirm = useConfirm()
  const removing = ref(false)

  function confirmRemove(item: { id: number; name: string }) {
    confirm.require({
      group: 'app-shell',
      header: '删除制品',
      message: `确定删除「${item.name}」吗?删除后不可恢复。`,
      acceptLabel: '删除',
      rejectLabel: '再想想',
      onAccept: async ({ close }: { close: () => void }) => {
        close()
        if (removing.value) return
        removing.value = true
        try {
          await hikariRequest<'/api/v3/merchs/{id}', 'delete'>('/api/v3/merchs/{id}', {
            method: 'delete',
            path: { id: item.id },
          })
          await refreshNuxtData()
        } finally {
          removing.value = false
        }
      },
    })
  }

  return { removing, confirmRemove }
}
