export function useArticleOwnerActions() {
  const router = useRouter()
  const confirm = useConfirm()

  function edit(id: number, status?: string) {
    const to = `/articles/${id}/edit`
    if (status && status !== 'PUBLISHED') {
      void router.push(to)
      return
    }
    confirm.require({
      group: 'app-shell',
      header: '确认编辑已发布文章',
      message: '进入编辑后，任何修改都会自动让文章转为草稿，需要重新提交后才会再次公开。',
      acceptLabel: '继续编辑',
      rejectLabel: '取消',
      onAccept: async ({ close }) => {
        close()
        await router.push(to)
      },
    })
  }

  return { edit }
}
