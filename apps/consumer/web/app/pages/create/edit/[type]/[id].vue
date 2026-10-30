<script setup lang="ts">
  import type { EditRedirectPageData } from '~~/server/api/pages/create/edit/[type]/[id].get'

  definePageMeta({ title: '编辑条目', middleware: 'wiki-editor-content-limit' })

  const route = useRoute()
  const { data } = await useHikariApiData<EditRedirectPageData>(
    `/api/pages/create/edit/${String(route.params.type)}/${Number(route.params.id)}`,
    { fatal: true },
  )
  if (data.value)
    await navigateTo({ path: data.value.target, query: route.query }, { replace: true })
</script>
