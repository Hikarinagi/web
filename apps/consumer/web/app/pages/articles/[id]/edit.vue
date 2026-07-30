<script setup lang="ts">
  defineOptions({ name: 'PageArticleEdit' })
  definePageMeta({ layout: 'editor', middleware: 'auth', floatingToolbar: false })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  useHikariSeoMeta({ title: '编辑文章', appendSiteName: true })
</script>

<template>
  <ArticleEditorShell :article-id="id" />
</template>
