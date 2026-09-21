<script setup lang="ts">
  import { Prose } from '@hina-ui/vue'
  import type { DeveloperGuideCollectionItem } from '@nuxt/content'

  defineOptions({ name: 'DeveloperGuideBody' })
  defineProps<{ doc: DeveloperGuideCollectionItem }>()
</script>

<template>
  <Prose as-child>
    <ContentRenderer
      :value="doc"
      tag="article"
      class="[&_h2]:scroll-mt-[calc(var(--app-header-height)+16px)]"
    />
  </Prose>
</template>
