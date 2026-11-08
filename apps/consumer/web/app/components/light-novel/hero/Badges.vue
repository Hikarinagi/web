<script setup lang="ts">
  import { Chip, Inline, Tag } from '@hina-ui/vue'
  import { getNovelStatusLabel } from '#imports'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    bunko: { id: number; name: string } | null
  }>()
</script>

<template>
  <Inline justify="center" align="center" gap="sm" class="lg:justify-start">
    <Tag tone="accent" size="md">{{ getNovelStatusLabel(lightNovel.novel_status) }}</Tag>
    <NuxtLink
      v-if="bunko"
      v-slot="{ href, navigate }"
      :to="`/light-novels/bunko/${bunko.id}`"
      custom
    >
      <Chip as="a" size="md" :href="href" @click="navigate">{{ bunko.name }}</Chip>
    </NuxtLink>
    <Tag v-if="lightNovel.nsfw" tone="danger" size="md">NSFW</Tag>
  </Inline>
</template>
