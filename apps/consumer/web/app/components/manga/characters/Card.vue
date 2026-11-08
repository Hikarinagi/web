<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { characterRoleLabel } from '~/labels/work'

  defineOptions({ name: 'MangaCharactersCard' })

  const props = defineProps<{ item: MangaPageData['characters'][number] }>()

  const name = computed(() => props.item.character.trans_name || props.item.character.name)
  const original = computed(() =>
    props.item.character.trans_name && props.item.character.trans_name !== props.item.character.name
      ? props.item.character.name
      : '',
  )
</script>

<template>
  <WorkEntityCard
    :to="`/characters/${item.character.id}`"
    :name="name"
    :original="original"
    :meta="characterRoleLabel(item.role)"
    :image="item.character.image?.src"
  />
</template>
