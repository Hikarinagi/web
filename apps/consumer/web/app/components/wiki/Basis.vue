<script setup lang="ts">
  import { Link, Stack } from '@hina-ui/vue'
  import type { EditBasis } from '~/features/wiki/changes'

  defineOptions({ name: 'WikiBasis' })

  defineProps<{ basis: EditBasis }>()
</script>

<template>
  <Stack gap="sm" class="min-w-0">
    <Link
      v-if="basis.url"
      :href="basis.url"
      target="_blank"
      rel="noreferrer"
      class="min-w-0 truncate text-sm"
    >
      {{ basis.url }}
    </Link>
    <HikariImageGroup v-if="basis.media.length" class="flex-row flex-wrap gap-2">
      <HikariImage
        v-for="(media, index) in basis.media"
        :key="media.id"
        :src="media"
        :alt="`截图 ${index + 1}`"
        preset="small"
        preview
        class="size-16 overflow-hidden rounded-md"
        image-class="size-full object-cover"
      />
    </HikariImageGroup>
  </Stack>
</template>
