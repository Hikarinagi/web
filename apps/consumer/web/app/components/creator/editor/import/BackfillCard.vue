<script setup lang="ts">
  import type {
    BackfillField,
    BackfillItem,
  } from '~/features/creator/composables/useEntityBackfill'

  defineProps<{
    item: BackfillItem
    running: boolean
  }>()

  const STATUS: Record<string, string> = {
    loading: '对比中…',
    blocked: '他人审核中',
    error: '对比失败',
    staged: '已暂存',
  }

  const TARGET_LABEL: Record<string, string> = {
    person: '人物',
    character: '角色',
    producer: '厂商',
  }

  function opOf(field: BackfillField): Record<string, unknown> {
    if (field.coverUrl) {
      return {
        kind: 'scalar',
        field: field.field,
        value_type: 'media',
        from: null,
        to: { id: 0, src: field.coverUrl },
      }
    }
    return field.op ?? {}
  }
</script>

<template>
  <div
    class="flex min-w-0 flex-col gap-2 rounded-lg border border-(--p-form-field-border-color) bg-(--p-form-field-background) p-2.5"
    :class="item.status === 'staged' ? 'opacity-60' : ''"
  >
    <div class="flex items-center gap-3">
      <HikariImage
        :src="item.cover ?? ''"
        alt=""
        preset="small"
        class="size-10 shrink-0 rounded bg-surface-100 dark:bg-surface-800"
        image-class="size-full object-cover object-top"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="truncate text-sm font-medium">{{ item.name }}</span>
          <Tag :value="TARGET_LABEL[item.target]" severity="secondary" class="text-[10px]!" />
          <Tag
            v-if="item.pairName"
            :value="`外部源：${item.pairName}`"
            severity="secondary"
            class="text-[10px]!"
          />
        </div>
        <span class="font-mono text-xs text-muted-color">#{{ item.id }}</span>
      </div>
      <Tag
        v-if="item.status !== 'ready'"
        class="shrink-0"
        :value="STATUS[item.status]"
        :severity="
          item.status === 'staged' ? 'success' : item.status === 'error' ? 'danger' : 'secondary'
        "
      />
    </div>

    <div v-if="item.status === 'ready'" class="flex flex-col gap-2 pl-13">
      <label
        v-for="field in item.fields"
        :key="field.field"
        class="flex cursor-pointer items-start gap-2"
      >
        <Checkbox v-model="field.checked" binary class="mt-3 shrink-0" :disabled="running" />
        <div class="pointer-events-none min-w-0 flex-1">
          <CreatorChangesetFieldDiff :op="opOf(field)" :label="field.label" />
        </div>
      </label>
    </div>
  </div>
</template>
