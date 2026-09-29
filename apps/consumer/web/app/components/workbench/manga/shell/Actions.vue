<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import { MANGA_GUIDE } from '~/features/workbench/manga/guide'
  import type { BackendMangaPage, BackendMangaProject } from '~/features/workbench/manga/manga'

  const props = defineProps<{ project: BackendMangaProject; pages: BackendMangaPage[] }>()
  const emit = defineEmits<{ changed: []; manage: [action: string] }>()

  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const blocker = computed(() => {
    if (!props.pages.length) return '还没有页面'
    const missing = props.pages.filter(page => !page.rendered_url).length
    return translation.value && missing > 0 ? `${missing} 页仍然没有成品图` : ''
  })
</script>

<template>
  <Inline gap="xs" align="center" :wrap="false" class="shrink-0">
    <Question title="使用说明" size="lg" aria-label="查看使用说明">
      <WorkbenchGuide :sections="MANGA_GUIDE[project.mode]" />
    </Question>
    <WorkbenchMangaPageTaskMenu
      v-if="translation && pages.length"
      :project="project"
      :pages="pages"
      class="max-md:hidden"
      @queued="emit('changed')"
    />
    <WorkbenchSubmitActions
      kind="manga"
      :project="project"
      :blocker="blocker"
      @changed="emit('changed')"
    />
    <WorkbenchMangaShellMenu :project="project" @select="emit('manage', $event)" />
  </Inline>
</template>
