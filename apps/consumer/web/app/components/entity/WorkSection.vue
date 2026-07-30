<script setup lang="ts">
  import { mapWorkItems, type WorkVariant } from '~/features/entity/relations'

  defineOptions({ name: 'EntityWorkSection' })
  const props = defineProps<{
    title: string
    relation: { items: readonly unknown[]; meta: { total_items: number } } | null
    variant: WorkVariant
    moreBase: string
    unit?: string
  }>()

  const items = computed(() =>
    props.relation ? mapWorkItems(props.relation.items, props.variant) : [],
  )
  const total = computed(() => props.relation?.meta.total_items ?? 0)
  const meta = computed(() =>
    props.unit ? `${props.unit} · ${total.value} 部` : `${total.value} 部`,
  )
  const moreTo = computed(() =>
    props.relation && total.value > props.relation.items.length ? props.moreBase : null,
  )
</script>

<template>
  <EntitySection v-if="items.length" :title="title" :meta="meta" :more-to="moreTo">
    <div class="grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
      <EntityWorkCard v-for="(item, index) in items" :key="`${item.to}-${index}`" :item="item" />
    </div>
  </EntitySection>
</template>
