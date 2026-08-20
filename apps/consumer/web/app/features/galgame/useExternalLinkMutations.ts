import type { ApiRequestBody } from '@hikarinagi/api-contract/v3'

export type CreateExternalLinkBody = ApiRequestBody<'/api/v3/galgames/{id}/links', 'post'>

export function useExternalLinkMutations(galgameId: number) {
  const confirm = useConfirm()
  const submitting = ref(false)
  const removing = ref(false)

  async function create(body: CreateExternalLinkBody) {
    if (submitting.value) return
    submitting.value = true
    try {
      await hikariRequest<'/api/v3/galgames/{id}/links', 'post'>('/api/v3/galgames/{id}/links', {
        method: 'post',
        path: { id: galgameId },
        body,
      })
      await refreshNuxtData()
    } finally {
      submitting.value = false
    }
  }

  function confirmRemove(item: { id: number; name: string }) {
    confirm.require({
      group: 'app-shell',
      header: '删除资料链接',
      message: `确定删除「${item.name}」吗?删除后不可恢复。`,
      acceptLabel: '删除',
      rejectLabel: '再想想',
      onAccept: async ({ close }: { close: () => void }) => {
        close()
        if (removing.value) return
        removing.value = true
        try {
          await hikariRequest<'/api/v3/links/{id}', 'delete'>('/api/v3/links/{id}', {
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

  return { submitting, removing, create, confirmRemove }
}
