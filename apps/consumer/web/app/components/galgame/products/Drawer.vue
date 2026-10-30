<script setup lang="ts">
  import { Drawer, Sheet, Skeleton, Stack } from '@hina-ui/vue'
  import { useMediaQuery } from '@vueuse/core'
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  defineOptions({ name: 'GalgameProductsDrawer' })

  const route = useRoute()
  const router = useRouter()
  const narrow = useMediaQuery('(max-width: 767px)')
  const id = computed(() => {
    const raw = Array.isArray(route.query.product) ? route.query.product[0] : route.query.product
    const value = Number(raw)
    return Number.isInteger(value) && value > 0 ? value : null
  })
  const open = computed({
    get: () => id.value !== null,
    set: next => {
      if (next) return
      const { product: _product, ...query } = route.query
      void router.replace({ query })
    },
  })
  const detail = ref<ApiData<'/api/v3/products/{id}', 'get'> | null>(null)
  const loading = ref(false)

  watch(
    id,
    async next => {
      if (next === null || detail.value?.id === next) return
      loading.value = true
      try {
        detail.value = await hikariRequest('/api/v3/products/{id}', { path: { id: next } })
      } catch {
        open.value = false
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )
</script>

<template>
  <component
    :is="narrow ? Sheet : Drawer"
    v-model:open="open"
    title="发行版本详情"
    v-bind="narrow ? {} : { size: 'lg' }"
  >
    <template #content>
      <Stack v-if="loading || !detail" gap="md">
        <Skeleton class="h-36 w-full" />
        <Skeleton class="h-48 w-full" />
      </Stack>
      <GalgameProductsDetail v-else :product="detail" />
    </template>
  </component>
</template>
