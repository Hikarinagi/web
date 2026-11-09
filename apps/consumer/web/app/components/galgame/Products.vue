<script setup lang="ts">
  import { Card, Divider, Empty } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameProducts' })
  defineProps<{ products: GalgamePageData['products'] }>()

  const route = useRoute()
  const router = useRouter()
  const select = (id: number) => router.replace({ query: { ...route.query, product: String(id) } })
</script>

<template>
  <EntrySectionHead id="releases" title="发行版本" :count="products.length" />
  <Card v-if="products.length" :padded="false">
    <template v-for="(product, index) in products" :key="product.id">
      <Divider v-if="index > 0" />
      <GalgameProductsRow :product="product" @select="select(product.id)" />
    </template>
  </Card>
  <Card v-else><Empty title="尚未记录发行版本" size="sm" /></Card>
  <GalgameProductsDrawer />
</template>
