<script setup lang="ts">
  import { Card, Combobox, FormField, IconButton, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { X } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import type { ImportType } from '~/features/creator/editor/import'

  type SearchItem = ApiData<'/api/v3/external-source/{source}/search', 'get'>[number]

  const props = defineProps<{ source: 'bangumi' | 'vndb'; label: string; type: ImportType }>()
  const picked = defineModel<SearchItem | null>({ default: null })

  const results = ref<SearchItem[]>([])
  const search = ref('')
  const loading = ref(false)

  const options = computed(() =>
    results.value.map(item => ({
      value: item.external_id,
      label: item.title,
      disabled: item.existing_id != null,
      item,
    })),
  )

  watch(search, value => {
    loading.value = value.trim().length > 0
  })

  watchDebounced(
    search,
    async value => {
      const q = value.trim()
      if (!q) {
        results.value = []
        loading.value = false
        return
      }
      try {
        results.value = await hikariRequest('/api/v3/external-source/{source}/search', {
          path: { source: props.source },
          query: { q, type: props.type },
        })
      } finally {
        loading.value = false
      }
    },
    { debounce: 300 },
  )

  function pick(value: string | number | null | undefined) {
    picked.value = results.value.find(item => item.external_id === value) ?? null
  }

  function clear() {
    picked.value = null
    search.value = ''
    results.value = []
    loading.value = false
  }
</script>

<template>
  <FormField :label="label">
    <Card v-if="picked" :padded="false" class="w-full">
      <Inline gap="sm" align="center" :wrap="false" class="p-2">
        <HikariImage
          :src="picked.cover ?? ''"
          alt=""
          preset="small"
          class="h-14 w-10 shrink-0 rounded bg-subtle"
          image-class="size-full object-cover"
        >
          <template #empty />
          <template #error />
        </HikariImage>
        <Stack gap="none" class="min-w-0 flex-1">
          <Text as="span" size="sm" weight="medium" truncate class="min-w-0">
            {{ picked.title }}
          </Text>
          <Text as="span" size="xs" tone="muted" class="font-mono">
            {{ picked.external_id }}
            <template v-if="picked.year">· {{ picked.year }}</template>
          </Text>
        </Stack>
        <IconButton
          label="清除"
          variant="ghost"
          tone="neutral"
          size="sm"
          class="shrink-0"
          @click="clear"
        >
          <X />
        </IconButton>
      </Inline>
    </Card>

    <Combobox
      v-else
      v-model:search="search"
      :options="options"
      :loading="loading"
      ignore-filter
      :placeholder="`搜索 ${label} 标题 / 条目 ID…`"
      class="w-full"
      @update:model-value="pick"
    >
      <template #option="{ option }">
        <Inline gap="sm" align="center" :wrap="false" :class="option.disabled ? 'opacity-60' : ''">
          <HikariImage
            :src="option.item.cover ?? ''"
            alt=""
            preset="small"
            class="h-12 w-9 shrink-0 rounded bg-subtle"
            image-class="size-full object-cover"
          >
            <template #empty />
            <template #error />
          </HikariImage>
          <Stack gap="none" class="min-w-0">
            <Inline gap="xs" align="center">
              <Text as="span" size="sm" weight="medium" truncate class="min-w-0">
                {{ option.item.title }}
              </Text>
              <Tag v-if="option.disabled" size="sm" tone="neutral">已收录</Tag>
            </Inline>
            <Text v-if="option.item.subtitle" as="span" size="xs" tone="muted" truncate>
              {{ option.item.subtitle }}
            </Text>
            <Text as="span" size="xs" tone="muted" class="font-mono">
              {{ option.item.external_id }}
              <template v-if="option.item.year">· {{ option.item.year }}</template>
            </Text>
          </Stack>
        </Inline>
      </template>
    </Combobox>
  </FormField>
</template>
