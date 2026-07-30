<script setup lang="ts">
  import { FileText, ImagePlus, SquarePen } from '@lucide/vue'
  import { MANAGED_STATUS_FILTERS, type ManagedContentPage } from '~/features/space/space'
  import { useManagedContent } from '~/features/space/useManagedContent'

  defineOptions({ name: 'SpaceTabsContentManage' })

  const props = defineProps<{ managed: ManagedContentPage; type: 'post' | 'article' }>()
  const statusOptions = [...MANAGED_STATUS_FILTERS]
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
</script>

<template>
  <div class="flex flex-col gap-4 pt-2">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:min-w-0 sm:flex-1">
        <InputText
          v-model="search"
          placeholder="搜索标题或正文"
          size="small"
          class="order-1 col-span-2 w-full sm:order-3 sm:min-w-64 sm:flex-1"
        />
        <Select
          v-model="status"
          :options="statusOptions"
          option-label="label"
          option-value="key"
          size="small"
          class="order-2 min-w-0 sm:order-1 sm:w-36 sm:shrink-0"
        />
        <DatePicker
          v-model="updatedRange"
          selection-mode="range"
          date-format="yy/mm/dd"
          placeholder="更新时间"
          show-icon
          :manual-input="false"
          size="small"
          class="order-3 min-w-0 sm:order-2 sm:w-56 sm:shrink-0"
        />
      </div>
      <div class="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
        <Button
          label="清空"
          text
          size="small"
          class="shrink-0"
          :disabled="!hasFilters"
          @click="reset"
        />
        <Button
          v-if="type === 'article'"
          as="router-link"
          to="/articles/new"
          label="写文章"
          size="small"
          class="flex-1 sm:flex-none"
        >
          <template #icon><SquarePen class="size-4" /></template>
        </Button>
        <Button v-else label="发图文" size="small" class="flex-1 sm:flex-none" @click="create">
          <template #icon><ImagePlus class="size-4" /></template>
        </Button>
      </div>
    </div>

    <LoadingOverlay :loading="pending">
      <div v-if="list.items.length" class="flex flex-col">
        <SpaceTabsContentManageRow
          v-for="item in list.items"
          :key="item.id"
          :item="item"
          @edit="edit"
          @remove="remove"
        />
      </div>
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
  </div>
</template>
