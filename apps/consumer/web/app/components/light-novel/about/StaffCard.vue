<script setup lang="ts">
  import { getLightNovelPersonRelationLabel } from '#imports'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelAboutStaffCard' })
  const props = defineProps<{ item: LightNovelPageData['people'][number] }>()

  const name = computed(() => props.item.person.trans_name || props.item.person.name)
  const original = computed(() =>
    props.item.person.trans_name && props.item.person.trans_name !== props.item.person.name
      ? props.item.person.name
      : '',
  )
  const role = computed(
    () => props.item.note || getLightNovelPersonRelationLabel(props.item.relation),
  )
  const to = computed(() =>
    props.item.relation === 'illustrator'
      ? `/light-novels/illustrator/${props.item.person.id}`
      : `/light-novels/author/${props.item.person.id}`,
  )
</script>

<template>
  <WorkEntityCard
    :to="to"
    :name="name"
    :original="original"
    :meta="role"
    :image="item.person.image?.src"
  />
</template>
