<script setup lang="ts">
  import { Button as HnButton, Grid, Link, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'EntryCharacters' })
  const props = defineProps<{
    characters: { id: number; name: string; image: HikariImageSource }[]
  }>()

  const COLLAPSED = 12
  const all = ref(false)
  const shown = computed(() =>
    all.value ? props.characters : props.characters.slice(0, COLLAPSED),
  )
</script>

<template>
  <EntrySectionHead id="characters" title="角色" :count="characters.length">
    <template #actions>
      <HnButton
        v-if="characters.length > COLLAPSED"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="all = !all"
      >
        {{ all ? '收起' : '查看全部' }}
      </HnButton>
    </template>
  </EntrySectionHead>
  <Grid :cols="3" gap="none" class="gap-x-3 gap-y-4 sm:grid-cols-4 md:grid-cols-6">
    <Stack v-for="member in shown" :key="member.id" gap="xs" class="min-w-0">
      <HikariImage
        :src="member.image"
        :alt="member.name"
        :ratio="3 / 4"
        :processing="{ gravity: 'face' }"
        preset="thumbnail"
        :fallback-src="ENTITY_FALLBACK_IMAGE"
        class="w-full rounded-md bg-subtle"
        image-class="object-cover object-top"
      />
      <Link
        :as="NuxtLink"
        :to="`/characters/${member.id}`"
        tone="neutral"
        class="truncate text-sm"
        lang="ja"
      >
        {{ member.name }}
      </Link>
    </Stack>
  </Grid>
</template>
