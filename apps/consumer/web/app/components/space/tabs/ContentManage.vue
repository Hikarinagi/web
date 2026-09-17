<script setup lang="ts">
  import { Button, DateRangePicker, Inline, SearchInput, Select, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { FileText, ImagePlus, SquarePen } from '@lucide/vue'
  import { MANAGED_STATUS_FILTERS, type ManagedContentPage } from '~/features/space/space'
  import { useManagedContent } from '~/features/space/useManagedContent'

  defineOptions({ name: 'SpaceTabsContentManage' })

  const props = defineProps<{ managed: ManagedContentPage; type: 'post' | 'article' }>()
  const statusOptions = MANAGED_STATUS_FILTERS.map(f => ({ value: f.key, label: f.label }))
  const {
    list,
    status,
    search,
    updatedRange,
    hasFilters,
    pending,
    create,
    edit,
    remove,
    reset,
    loadPage,
  } = useManagedContent(props.managed, props.type)

  function selectStatus(value: string | number | null | undefined) {
    const next = MANAGED_STATUS_FILTERS.find(f => f.key === value)?.key
    if (next) status.value = next
  }
</script>

<template>
  <Stack gap="md" class="pt-2">
    <Inline gap="sm" justify="between" class="sm:flex-nowrap">
      <Inline gap="sm" class="min-w-0 sm:flex-1 sm:flex-nowrap">
        <Select
          :model-value="status"
          :options="statusOptions"
          size="sm"
          aria-label="状态"
          class="min-w-0 sm:w-36 sm:shrink-0"
          @update:model-value="selectStatus"
        />
        <DateRangePicker
          v-model="updatedRange"
          placeholder="更新时间"
          size="sm"
          class="min-w-0 sm:w-56 sm:shrink-0"
          aria-label="更新时间"
        />
        <SearchInput
          v-model="search"
          placeholder="搜索标题或正文"
          size="sm"
          class="w-full sm:min-w-64 sm:flex-1"
          aria-label="搜索标题或正文"
        />
      </Inline>
      <Inline gap="sm" :wrap="false" class="shrink-0">
        <Button variant="ghost" tone="neutral" size="sm" :disabled="!hasFilters" @click="reset">
          清空
        </Button>
        <Button v-if="type === 'article'" :as="NuxtLink" to="/articles/new" size="sm">
          <template #icon><SquarePen /></template>
          写文章
        </Button>
        <Button v-else size="sm" @click="create">
          <template #icon><ImagePlus /></template>
          发图文
        </Button>
      </Inline>
    </Inline>

    <LoadingOverlay :loading="pending">
      <Stack v-if="list.items.length" gap="none">
        <SpaceTabsContentManageRow
          v-for="item in list.items"
          :key="item.id"
          :item="item"
          @edit="edit"
          @remove="remove"
        />
      </Stack>
      <SpaceEmptyState
        v-else
        :icon="FileText"
        :text="type === 'post' ? '没有匹配的图文' : '没有匹配的文章'"
      />
    </LoadingOverlay>

    <Paginator
      v-if="list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      :loading="pending"
      route="replace"
      @change="loadPage"
    />
  </Stack>
</template>
