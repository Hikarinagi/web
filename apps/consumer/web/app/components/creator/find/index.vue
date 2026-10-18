<script setup lang="ts">
  import { Button, Card, Inline, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type { BackendDuplicateLookup } from '~/features/creator/duplicates'
  import { canImport } from '~/features/creator/editor/import'
  import { EDITOR_RESOURCE_OPTIONS, type FindValues } from '~/features/creator/schemas/find.schema'

  const route = useRoute()
  const router = useRouter()

  function fromQuery(): FindValues {
    const type = String(route.query.type ?? '')
    return {
      resource_type: EDITOR_RESOURCE_OPTIONS.some(option => option.value === type)
        ? type
        : 'light-novel',
      q: String(route.query.q ?? ''),
      author: String(route.query.author ?? ''),
    }
  }

  const initial = ref<FindValues>(fromQuery())
  const searched = ref<FindValues | null>(null)
  const result = ref<BackendDuplicateLookup | null>(null)
  const loading = ref(false)
  const newOpen = ref(false)
  let seq = 0

  async function run(values: FindValues) {
    const current = ++seq
    loading.value = true
    try {
      const data = await hikariRequest('/api/v3/contribution/lookups/{resource_type}', {
        path: { resource_type: values.resource_type },
        query: { q: values.q, author: values.author || undefined },
      })
      if (current !== seq) return
      result.value = data
      searched.value = { ...values }
    } finally {
      if (current === seq) loading.value = false
    }
  }

  function onSearch(values: FindValues) {
    initial.value = values
    void router.replace({
      query: { type: values.resource_type, q: values.q, author: values.author || undefined },
    })
    void run(values)
  }

  onMounted(() => {
    if (initial.value.q) void run(initial.value)
  })

  const hasResults = computed(
    () => !!result.value && (result.value.site.length > 0 || result.value.external.length > 0),
  )
  const externalType = computed(() =>
    searched.value && canImport(searched.value.resource_type) ? searched.value.resource_type : null,
  )
</script>

<template>
  <Stack gap="lg">
    <CreatorFindSearch :initial="initial" :loading="loading" @search="onSearch" />

    <template v-if="searched && result">
      <CreatorFindSiteList :candidates="result.site" />
      <CreatorFindExternalList v-if="externalType" :type="externalType" :items="result.external" />

      <Card>
        <Inline gap="md" align="center" justify="between">
          <Text size="sm" tone="muted">以上都不是要找的条目。</Text>
          <Button
            :variant="hasResults ? 'outline' : undefined"
            :tone="hasResults ? 'neutral' : undefined"
            @click="newOpen = true"
          >
            <template #icon><Plus /></template>
            新建空白条目
          </Button>
        </Inline>
      </Card>

      <CreatorFindNewDialog
        v-model:open="newOpen"
        :type="searched.resource_type"
        :query="searched.q"
        :author="result.author"
      />
    </template>
  </Stack>
</template>
