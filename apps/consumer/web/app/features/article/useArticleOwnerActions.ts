export function useArticleOwnerActions() {
  const router = useRouter()
  const { confirm } = useHikariConfirm()

  function edit(id: number, status?: string) {
    const to = `/articles/${id}/edit`
    if (status && status !== 'PUBLISHED') {
      void router.push(to)
      return
    }
    confirm({
      title: '确认编辑已发布文章',
      description: '进入编辑后，任何修改都会自动让文章转为草稿，需要重新提交后才会再次公开。',
      confirmText: '继续编辑',
      cancelText: '取消',
      onConfirm: () => router.push(to),
    })
  }

  return { edit }
}
