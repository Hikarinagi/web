<script setup lang="ts">
  import { Empty, Stack } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameProducts' })
  defineProps<{ galgameId: number; products: GalgamePageData['products'] }>()

  const route = useRoute()
  const router = useRouter()
  const select = (id: number) => router.replace({ query: { ...route.query, product: String(id) } })
</script>

<template>
  <WorkSection title="发行版本" :meta="products.length ? `${products.length} 个` : undefined">
    <template #action>
      <WorkEditButton resource-type="galgame" :resource-id="galgameId" />
    </template>
    <Empty v-if="!products.length" title="尚未记录发行版本" />
    <template v-else>
      <GalgameProductsTable :products="products" class="hidden md:block" @select="select" />
      <Stack gap="sm" class="md:hidden">
        <GalgameProductsCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @select="select(product.id)"
        />
      </Stack>
    </template>
    <GalgameProductsDrawer />
  </WorkSection>
</template>
