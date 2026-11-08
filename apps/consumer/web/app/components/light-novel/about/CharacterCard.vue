<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { characterRoleLabel } from '~/labels/work'

  defineOptions({ name: 'LightNovelAboutCharacterCard' })
  const props = defineProps<{ item: LightNovelPageData['characters'][number] }>()

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
