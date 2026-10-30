<script setup lang="ts">
  import { Empty, Panel } from '@hina-ui/vue'
  import type { BackendProductSummary } from '~/features/entry/contract'

  defineOptions({ name: 'CreatorEntryProducts' })
  defineProps<{ products: BackendProductSummary[] }>()

  const router = useRouter()
</script>

<template>
  <Panel title="发行版本" :count="products.length">
    <Empty v-if="!products.length" title="尚未记录发行版本" />
    <GalgameProductsTable
      v-else
      :products="products"
      variant="secondary"
      @select="id => router.push(`/create/edit/product/${id}`)"
    />
  </Panel>
</template>
