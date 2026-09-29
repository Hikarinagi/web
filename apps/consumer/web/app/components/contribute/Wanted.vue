<script setup lang="ts">
  import { Section } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import { useContributeKind } from '~/features/contribute/useContributeKind'

  defineProps<{ data: ContributePageData }>()

  const kind = useContributeKind()
</script>

<template>
  <Section title="正在征集">
    <ContributeNovelList v-if="kind === 'novel'" :volumes="data.volumes" :target="data.target" />
    <ContributeMangaList v-else :chapters="data.chapters" />
  </Section>
</template>
