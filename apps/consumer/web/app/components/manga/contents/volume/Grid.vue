<script setup lang="ts">
  import { Grid, SimpleGrid } from '@hina-ui/vue'
  import type { ContentsItem, ContentsVariant } from '~/features/manga/contents'

  defineOptions({ name: 'MangaContentsVolumeGrid' })

  const props = withDefaults(
    defineProps<{
      volumes: ContentsItem[]
      currentId: number | null
      currentPage?: number
      readIds: ReadonlySet<number>
      signedIn: boolean
      desc?: boolean
      variant?: ContentsVariant
    }>(),
    { currentPage: 0, desc: false, variant: 'page' },
  )
  const emit = defineEmits<{ select: [item: ContentsItem] }>()

  const shown = computed(() => (props.desc ? [...props.volumes].reverse() : props.volumes))
  const layout = computed(() =>
    props.variant === 'page'
      ? { is: SimpleGrid, attrs: { min: '8rem' } }
      : { is: Grid, attrs: { cols: 3 } },
  )
</script>

<template>
  <component :is="layout.is" v-bind="layout.attrs" gap="sm" class="-mx-1.5">
    <MangaContentsVolumeCover
      v-for="item in shown"
      :key="item.id"
      :item="item"
      :read="readIds.has(item.id)"
      :current="item.id === currentId"
      :current-page="currentPage"
      :locked="!signedIn && !item.guest_readable"
      :data-current="item.id === currentId ? '' : undefined"
      @select="emit('select', $event)"
    />
  </component>
</template>
