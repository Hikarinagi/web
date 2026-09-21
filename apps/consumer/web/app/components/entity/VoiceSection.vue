<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import { mapVoiceItems } from '~/features/entity/relations'

  defineOptions({ name: 'EntityVoiceSection' })
  const props = defineProps<{
    title: string
    relation: { items: readonly unknown[]; meta: { total_items: number } } | null
    moreBase: string
  }>()

  const items = computed(() => (props.relation ? mapVoiceItems(props.relation.items) : []))
  const total = computed(() => props.relation?.meta.total_items ?? 0)
  const moreTo = computed(() =>
    props.relation && total.value > props.relation.items.length ? props.moreBase : null,
  )
</script>

<template>
  <EntitySection v-if="items.length" :title="title" :meta="`${total} 个角色`" :more-to="moreTo">
    <Grid :cols="1" class="gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <EntityVoiceCard v-for="item in items" :key="item.to" :item="item" />
    </Grid>
  </EntitySection>
</template>
